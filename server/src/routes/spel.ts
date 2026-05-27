import { Router } from 'express'
import { db } from '../db/index.js'
import { vragenSets, vragen, geslotenVragen, spelSjablonen, themas } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { AppError } from '../middleware/errorHandler.js'

const router: Router = Router()

router.get('/:shareToken', async (req, res) => {
  const [set] = await db
    .select()
    .from(vragenSets)
    .where(eq(vragenSets.shareToken, req.params.shareToken))

  if (!set) {
    throw new AppError(404, 'Spel niet gevonden of link is ongeldig')
  }

  const [sjabloon] = await db
    .select()
    .from(spelSjablonen)
    .where(eq(spelSjablonen.id, set.spelSjabloonId))

  const sjabloonThemas = await db
    .select()
    .from(themas)
    .where(eq(themas.spelSjabloonId, set.spelSjabloonId))
    .orderBy(themas.volgorde)

  const setVragen = await db
    .select()
    .from(vragen)
    .where(eq(vragen.vragenSetId, set.id))

  const setGeslotenVragen = await db
    .select()
    .from(geslotenVragen)
    .where(eq(geslotenVragen.vragenSetId, set.id))

  res.json({
    ...set,
    spelSjabloon: {
      ...sjabloon,
      themas: sjabloonThemas.map((t) => ({
        id: t.id,
        titel: t.titel,
        kleur: t.kleur,
        afbeeldingUrl: t.afbeeldingPad ? `/uploads/thema-afbeeldingen/${t.afbeeldingPad}` : null,
        volgorde: t.volgorde,
        spelSjabloonId: t.spelSjabloonId,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
    },
    vragen: setVragen,
    geslotenVragen: setGeslotenVragen,
  })
})

export default router
