import { Router } from 'express'
import crypto from 'crypto'
import { db } from '../db/index.js'
import { vragenSets, vragen, geslotenVragen, spelSjablonen, themas } from '../db/schema.js'
import { eq, count, and, inArray } from 'drizzle-orm'
import { requireUser } from '../middleware/requireUser.js'
import { validateBody } from '../middleware/validateBody.js'
import {
  createVragenSetSchema,
  updateVragenSetSchema,
  importeerVragenSchema,
} from '../validation/schemas.js'
import { AppError } from '../middleware/errorHandler.js'
import vragenRouter from './vragen.js'
import geslotenVragenRouter from './geslotenVragen.js'

const router: Router = Router()

// Alle vragenset-routes vereisen authenticatie
router.use(requireUser)

// Mount geneste routes
router.use('/:setId/vragen', vragenRouter)
router.use('/:setId/gesloten-vragen', geslotenVragenRouter)

// Helper: haal set op en check eigendom
async function getOwnedSet(setId: number, userId: number) {
  const [set] = await db
    .select()
    .from(vragenSets)
    .where(eq(vragenSets.id, setId))
  if (!set) {
    throw new AppError(404, 'Vragenset niet gevonden')
  }
  if (set.userId !== userId) {
    throw new AppError(403, 'Geen toegang tot deze vragenset')
  }
  return set
}

// Maak nieuwe vragenset
router.post('/', validateBody(createVragenSetSchema), async (req, res) => {
  const [sjabloon] = await db
    .select()
    .from(spelSjablonen)
    .where(eq(spelSjablonen.id, req.body.spelSjabloonId))
  if (!sjabloon) {
    throw new AppError(400, 'Spelsjabloon niet gevonden')
  }

  const result = await db
    .insert(vragenSets)
    .values({
      label: req.body.label,
      userId: req.userId!,
      spelSjabloonId: req.body.spelSjabloonId,
    })
    .$returningId()
  const [set] = await db
    .select()
    .from(vragenSets)
    .where(eq(vragenSets.id, result[0].id))
  res.status(201).json(set)
})

// Lijst vragensets van ingelogde gebruiker
router.get('/', async (req, res) => {
  const result = await db
    .select()
    .from(vragenSets)
    .where(eq(vragenSets.userId, req.userId!))
    .orderBy(vragenSets.createdAt)
  res.json(result)
})

function themaToResponse(t: typeof themas.$inferSelect) {
  return {
    id: t.id,
    titel: t.titel,
    kleur: t.kleur,
    afbeeldingUrl: t.afbeeldingPad ? `/uploads/thema-afbeeldingen/${t.afbeeldingPad}` : null,
    volgorde: t.volgorde,
    spelSjabloonId: t.spelSjabloonId,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  }
}

// Detail vragenset met tellingen en spelsjabloon
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10)
  const set = await getOwnedSet(id, req.userId!)

  const [vragenCount] = await db
    .select({ count: count() })
    .from(vragen)
    .where(eq(vragen.vragenSetId, id))
  const [geslotenVragenCount] = await db
    .select({ count: count() })
    .from(geslotenVragen)
    .where(eq(geslotenVragen.vragenSetId, id))

  const [sjabloon] = await db
    .select()
    .from(spelSjablonen)
    .where(eq(spelSjablonen.id, set.spelSjabloonId))
  const sjabloonThemas = await db
    .select()
    .from(themas)
    .where(eq(themas.spelSjabloonId, set.spelSjabloonId))
    .orderBy(themas.volgorde)

  res.json({
    ...set,
    spelSjabloon: {
      ...sjabloon,
      themas: sjabloonThemas.map(themaToResponse),
    },
    _count: {
      vragen: vragenCount.count,
      geslotenVragen: geslotenVragenCount.count,
    },
  })
})

// Update label
router.put(
  '/:id',
  validateBody(updateVragenSetSchema),
  async (req, res) => {
    const id = parseInt(req.params.id as string, 10)
    await getOwnedSet(id, req.userId!)
    await db
      .update(vragenSets)
      .set({ label: req.body.label })
      .where(eq(vragenSets.id, id))
    const [set] = await db
      .select()
      .from(vragenSets)
      .where(eq(vragenSets.id, id))
    res.json(set)
  },
)

// Verwijder vragenset (cascade via FK)
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10)
  await getOwnedSet(id, req.userId!)
  await db.delete(vragenSets).where(eq(vragenSets.id, id))
  res.status(204).end()
})

// Genereer korte 4-karakter share token (zonder verwarrende tekens 0/O, 1/I)
const TOKEN_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

async function generateUniekeToken(): Promise<string> {
  for (let poging = 0; poging < 10; poging++) {
    const bytes = crypto.randomBytes(4)
    const token = Array.from(bytes).map((b) => TOKEN_CHARS[b % TOKEN_CHARS.length]).join('')
    const [bestaand] = await db
      .select({ id: vragenSets.id })
      .from(vragenSets)
      .where(eq(vragenSets.shareToken, token))
    if (!bestaand) return token
  }
  throw new AppError(500, 'Kon geen unieke code genereren')
}

router.post('/:id/share', async (req, res) => {
  const id = parseInt(req.params.id, 10)
  await getOwnedSet(id, req.userId!)
  const shareToken = await generateUniekeToken()
  await db
    .update(vragenSets)
    .set({ shareToken })
    .where(eq(vragenSets.id, id))
  const [set] = await db
    .select()
    .from(vragenSets)
    .where(eq(vragenSets.id, id))
  res.json(set)
})

// Verwijder shareToken
router.delete('/:id/share', async (req, res) => {
  const id = parseInt(req.params.id, 10)
  await getOwnedSet(id, req.userId!)
  await db
    .update(vragenSets)
    .set({ shareToken: null })
    .where(eq(vragenSets.id, id))
  const [set] = await db
    .select()
    .from(vragenSets)
    .where(eq(vragenSets.id, id))
  res.json(set)
})

// Importeer (kopieer) geselecteerde vragen uit een andere vragenset van dezelfde gebruiker
router.post(
  '/:id/importeer',
  validateBody(importeerVragenSchema),
  async (req, res) => {
    const doelId = parseInt(req.params.id as string, 10)
    const { bronSetId, vraagIds, geslotenVraagIds } = req.body as {
      bronSetId: number
      vraagIds: number[]
      geslotenVraagIds: number[]
    }

    const doel = await getOwnedSet(doelId, req.userId!)
    if (bronSetId === doelId) {
      throw new AppError(400, 'Kan niet importeren uit dezelfde vragenset')
    }
    const bron = await getOwnedSet(bronSetId, req.userId!)

    if (bron.spelSjabloonId !== doel.spelSjabloonId) {
      throw new AppError(
        400,
        'De bronvragenset heeft een ander spelsjabloon dan deze vragenset',
      )
    }

    if (vraagIds.length === 0 && geslotenVraagIds.length === 0) {
      throw new AppError(400, 'Selecteer minimaal één vraag om te importeren')
    }

    // Haal alleen bronvragen op die daadwerkelijk bij de bronset horen
    const bronVragen =
      vraagIds.length > 0
        ? await db
            .select()
            .from(vragen)
            .where(
              and(
                eq(vragen.vragenSetId, bronSetId),
                inArray(vragen.id, vraagIds),
              ),
            )
        : []

    const bronGeslotenVragen =
      geslotenVraagIds.length > 0
        ? await db
            .select()
            .from(geslotenVragen)
            .where(
              and(
                eq(geslotenVragen.vragenSetId, bronSetId),
                inArray(geslotenVragen.id, geslotenVraagIds),
              ),
            )
        : []

    if (bronVragen.length > 0) {
      await db.insert(vragen).values(
        bronVragen.map((v) => ({
          vraagTekst: v.vraagTekst,
          themaId: v.themaId,
          tijdSeconden: v.tijdSeconden,
          vragenSetId: doelId,
        })),
      )
    }

    if (bronGeslotenVragen.length > 0) {
      await db.insert(geslotenVragen).values(
        bronGeslotenVragen.map((g) => ({
          vraagTekst: g.vraagTekst,
          type: g.type,
          tijdSeconden: g.tijdSeconden,
          optieA: g.optieA,
          optieB: g.optieB,
          optieC: g.optieC,
          optieD: g.optieD,
          correctAntwoord: g.correctAntwoord,
          vragenSetId: doelId,
        })),
      )
    }

    res.status(201).json({
      aantalVragen: bronVragen.length,
      aantalGeslotenVragen: bronGeslotenVragen.length,
    })
  },
)

export default router
