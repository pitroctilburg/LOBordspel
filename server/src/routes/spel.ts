import { Router } from 'express'
import { db } from '../db/index.js'
import { vragenSets, vragen, geslotenVragen } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { AppError } from '../middleware/errorHandler.js'

const router = Router()

// Publieke route: haal volledige speldata op via shareToken
router.get('/:shareToken', async (req, res) => {
  const [set] = await db
    .select()
    .from(vragenSets)
    .where(eq(vragenSets.shareToken, req.params.shareToken))

  if (!set) {
    throw new AppError(404, 'Spel niet gevonden of link is ongeldig')
  }

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
    vragen: setVragen,
    geslotenVragen: setGeslotenVragen,
  })
})

export default router
