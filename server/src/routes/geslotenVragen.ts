import { Router } from 'express'
import { db } from '../db/index.js'
import { geslotenVragen, vragenSets } from '../db/schema.js'
import { eq, and } from 'drizzle-orm'
import { validateBody } from '../middleware/validateBody.js'
import {
  createGeslotenVraagSchema,
  updateGeslotenVraagSchema,
} from '../validation/schemas.js'
import { AppError } from '../middleware/errorHandler.js'

const router: Router = Router({ mergeParams: true })

// Helper: controleer of set bestaat en van de gebruiker is
async function checkSetOwnership(setId: number, userId: number) {
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

// Maak nieuwe gesloten vraag
router.post(
  '/',
  validateBody(createGeslotenVraagSchema),
  async (req, res) => {
    const params = req.params as Record<string, string>
    const setId = parseInt(params.setId, 10)
    await checkSetOwnership(setId, req.userId!)

    const result = await db
      .insert(geslotenVragen)
      .values({ ...req.body, vragenSetId: setId })
      .$returningId()
    const [vraag] = await db
      .select()
      .from(geslotenVragen)
      .where(eq(geslotenVragen.id, result[0].id))
    res.status(201).json(vraag)
  },
)

// Lijst gesloten vragen
router.get('/', async (req, res) => {
  const params = req.params as Record<string, string>
  const setId = parseInt(params.setId, 10)
  await checkSetOwnership(setId, req.userId!)

  const result = await db
    .select()
    .from(geslotenVragen)
    .where(eq(geslotenVragen.vragenSetId, setId))
    .orderBy(geslotenVragen.createdAt)
  res.json(result)
})

// Update gesloten vraag
router.put(
  '/:id',
  validateBody(updateGeslotenVraagSchema),
  async (req, res) => {
    const params = req.params as Record<string, string>
    const setId = parseInt(params.setId, 10)
    await checkSetOwnership(setId, req.userId!)

    const id = parseInt(params.id, 10)
    const [existing] = await db
      .select()
      .from(geslotenVragen)
      .where(
        and(eq(geslotenVragen.id, id), eq(geslotenVragen.vragenSetId, setId)),
      )
    if (!existing) {
      throw new AppError(404, 'Gesloten vraag niet gevonden')
    }

    await db
      .update(geslotenVragen)
      .set(req.body)
      .where(eq(geslotenVragen.id, id))
    const [vraag] = await db
      .select()
      .from(geslotenVragen)
      .where(eq(geslotenVragen.id, id))
    res.json(vraag)
  },
)

// Verwijder gesloten vraag
router.delete('/:id', async (req, res) => {
  const params = req.params as Record<string, string>
  const setId = parseInt(params.setId, 10)
  await checkSetOwnership(setId, req.userId!)

  const id = parseInt(params.id, 10)
  const [existing] = await db
    .select()
    .from(geslotenVragen)
    .where(
      and(eq(geslotenVragen.id, id), eq(geslotenVragen.vragenSetId, setId)),
    )
  if (!existing) {
    throw new AppError(404, 'Gesloten vraag niet gevonden')
  }

  await db.delete(geslotenVragen).where(eq(geslotenVragen.id, id))
  res.status(204).end()
})

export default router
