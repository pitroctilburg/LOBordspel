import { Router } from 'express'
import path from 'path'
import fs from 'fs/promises'
import multer from 'multer'
import { db } from '../db/index.js'
import { spelSjablonen, themas, vragenSets, vragen } from '../db/schema.js'
import { eq, count, and } from 'drizzle-orm'
import { requireUser } from '../middleware/requireUser.js'
import { validateBody } from '../middleware/validateBody.js'
import {
  createSpelSjabloonSchema,
  updateSpelSjabloonSchema,
  createThemaSchema,
  updateThemaSchema,
} from '../validation/schemas.js'
import { AppError } from '../middleware/errorHandler.js'

const router: Router = Router()

router.use(requireUser)

const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'thema-afbeeldingen')

const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    await fs.mkdir(UPLOADS_DIR, { recursive: true })
    cb(null, UPLOADS_DIR)
  },
  filename: (_req, file, cb) => {
    const uniek = `${Date.now()}-${Math.round(Math.random() * 1e6)}`
    const ext = path.extname(file.originalname) || '.png'
    cb(null, `${uniek}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new AppError(400, 'Alleen afbeeldingen zijn toegestaan'))
    }
  },
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

async function getSjabloonMetThemas(id: number) {
  const [sjabloon] = await db
    .select()
    .from(spelSjablonen)
    .where(eq(spelSjablonen.id, id))
  if (!sjabloon) return null

  const sjabloonThemas = await db
    .select()
    .from(themas)
    .where(eq(themas.spelSjabloonId, id))
    .orderBy(themas.volgorde)

  return {
    ...sjabloon,
    themas: sjabloonThemas.map(themaToResponse),
  }
}

// Lijst alle spelsjablonen
router.get('/', async (_req, res) => {
  const alleSjablonen = await db.select().from(spelSjablonen).orderBy(spelSjablonen.naam)
  const result = await Promise.all(
    alleSjablonen.map(async (s) => {
      const sjabloonThemas = await db
        .select()
        .from(themas)
        .where(eq(themas.spelSjabloonId, s.id))
        .orderBy(themas.volgorde)
      return { ...s, themas: sjabloonThemas.map(themaToResponse) }
    }),
  )
  res.json(result)
})

// Detail spelsjabloon
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id as string, 10)
  const sjabloon = await getSjabloonMetThemas(id)
  if (!sjabloon) throw new AppError(404, 'Spelsjabloon niet gevonden')
  res.json(sjabloon)
})

// Nieuw spelsjabloon
router.post('/', validateBody(createSpelSjabloonSchema), async (req, res) => {
  const result = await db
    .insert(spelSjablonen)
    .values({ naam: req.body.naam })
    .$returningId()
  const sjabloon = await getSjabloonMetThemas(result[0].id)
  res.status(201).json(sjabloon)
})

// Update spelsjabloon
router.put('/:id', validateBody(updateSpelSjabloonSchema), async (req, res) => {
  const id = parseInt(req.params.id as string, 10)
  const [bestaand] = await db.select().from(spelSjablonen).where(eq(spelSjablonen.id, id))
  if (!bestaand) throw new AppError(404, 'Spelsjabloon niet gevonden')

  await db.update(spelSjablonen).set({ naam: req.body.naam }).where(eq(spelSjablonen.id, id))
  const sjabloon = await getSjabloonMetThemas(id)
  res.json(sjabloon)
})

// Verwijder spelsjabloon
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id as string, 10)
  const [bestaand] = await db.select().from(spelSjablonen).where(eq(spelSjablonen.id, id))
  if (!bestaand) throw new AppError(404, 'Spelsjabloon niet gevonden')

  const [gekoppeld] = await db
    .select({ count: count() })
    .from(vragenSets)
    .where(eq(vragenSets.spelSjabloonId, id))
  if (gekoppeld.count > 0) {
    throw new AppError(409, 'Kan sjabloon niet verwijderen: er zijn nog vragensets aan gekoppeld')
  }

  await db.delete(spelSjablonen).where(eq(spelSjablonen.id, id))
  res.status(204).end()
})

// --- Thema endpoints ---

// Thema toevoegen
router.post('/:id/themas', validateBody(createThemaSchema), async (req, res) => {
  const sjabloonId = parseInt(req.params.id as string, 10)
  const [sjabloon] = await db.select().from(spelSjablonen).where(eq(spelSjablonen.id, sjabloonId))
  if (!sjabloon) throw new AppError(404, 'Spelsjabloon niet gevonden')

  const bestaandeThemas = await db
    .select()
    .from(themas)
    .where(eq(themas.spelSjabloonId, sjabloonId))
  const volgorde = req.body.volgorde ?? bestaandeThemas.length

  const result = await db
    .insert(themas)
    .values({ ...req.body, volgorde, spelSjabloonId: sjabloonId })
    .$returningId()
  const [thema] = await db.select().from(themas).where(eq(themas.id, result[0].id))
  res.status(201).json(themaToResponse(thema))
})

// Thema bijwerken
router.put('/:sjabloonId/themas/:themaId', validateBody(updateThemaSchema), async (req, res) => {
  const sjabloonId = parseInt(req.params.sjabloonId as string, 10)
  const themaId = parseInt(req.params.themaId as string, 10)

  const [thema] = await db
    .select()
    .from(themas)
    .where(and(eq(themas.id, themaId), eq(themas.spelSjabloonId, sjabloonId)))
  if (!thema) throw new AppError(404, 'Thema niet gevonden')

  await db.update(themas).set(req.body).where(eq(themas.id, themaId))
  const [updated] = await db.select().from(themas).where(eq(themas.id, themaId))
  res.json(themaToResponse(updated))
})

// Thema verwijderen
router.delete('/:sjabloonId/themas/:themaId', async (req, res) => {
  const sjabloonId = parseInt(req.params.sjabloonId as string, 10)
  const themaId = parseInt(req.params.themaId as string, 10)

  const [thema] = await db
    .select()
    .from(themas)
    .where(and(eq(themas.id, themaId), eq(themas.spelSjabloonId, sjabloonId)))
  if (!thema) throw new AppError(404, 'Thema niet gevonden')

  const [gekoppeld] = await db
    .select({ count: count() })
    .from(vragen)
    .where(eq(vragen.themaId, themaId))
  if (gekoppeld.count > 0) {
    throw new AppError(409, 'Kan thema niet verwijderen: er zijn nog vragen aan gekoppeld')
  }

  await db.delete(themas).where(eq(themas.id, themaId))
  res.status(204).end()
})

// Afbeelding uploaden
router.post(
  '/:sjabloonId/themas/:themaId/afbeelding',
  upload.single('afbeelding'),
  async (req, res) => {
    const sjabloonId = parseInt(req.params.sjabloonId as string, 10)
    const themaId = parseInt(req.params.themaId as string, 10)

    const [thema] = await db
      .select()
      .from(themas)
      .where(and(eq(themas.id, themaId), eq(themas.spelSjabloonId, sjabloonId)))
    if (!thema) throw new AppError(404, 'Thema niet gevonden')
    if (!req.file) throw new AppError(400, 'Geen afbeelding geüpload')

    const afbeeldingPad = req.file.filename
    await db.update(themas).set({ afbeeldingPad }).where(eq(themas.id, themaId))
    const [updated] = await db.select().from(themas).where(eq(themas.id, themaId))
    res.json(themaToResponse(updated))
  },
)

export default router
