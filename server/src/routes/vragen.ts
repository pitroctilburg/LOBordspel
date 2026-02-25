import { Router } from 'express'
import { db } from '../db/index.js'
import { vragen, vragenSets } from '../db/schema.js'
import { eq, and } from 'drizzle-orm'
import { validateBody } from '../middleware/validateBody.js'
import { createVraagSchema, updateVraagSchema } from '../validation/schemas.js'
import { AppError } from '../middleware/errorHandler.js'

const router = Router({ mergeParams: true })

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

// Maak nieuwe vraag
router.post('/', validateBody(createVraagSchema), async (req, res) => {
  const setId = parseInt(req.params.setId, 10)
  await checkSetOwnership(setId, req.userId!)

  const result = await db
    .insert(vragen)
    .values({ ...req.body, vragenSetId: setId })
    .$returningId()
  const [vraag] = await db
    .select()
    .from(vragen)
    .where(eq(vragen.id, result[0].id))
  res.status(201).json(vraag)
})

// Lijst vragen, optioneel gefilterd op competentie
router.get('/', async (req, res) => {
  const setId = parseInt(req.params.setId, 10)
  await checkSetOwnership(setId, req.userId!)

  const conditions = [eq(vragen.vragenSetId, setId)]
  if (req.query.competentie) {
    conditions.push(
      eq(vragen.competentie, req.query.competentie as any),
    )
  }

  const result = await db
    .select()
    .from(vragen)
    .where(and(...conditions))
    .orderBy(vragen.createdAt)
  res.json(result)
})

// Update vraag
router.put('/:id', validateBody(updateVraagSchema), async (req, res) => {
  const setId = parseInt(req.params.setId, 10)
  await checkSetOwnership(setId, req.userId!)

  const id = parseInt(req.params.id, 10)
  const [existing] = await db
    .select()
    .from(vragen)
    .where(and(eq(vragen.id, id), eq(vragen.vragenSetId, setId)))
  if (!existing) {
    throw new AppError(404, 'Vraag niet gevonden')
  }

  await db.update(vragen).set(req.body).where(eq(vragen.id, id))
  const [vraag] = await db.select().from(vragen).where(eq(vragen.id, id))
  res.json(vraag)
})

// Verwijder vraag
router.delete('/:id', async (req, res) => {
  const setId = parseInt(req.params.setId, 10)
  await checkSetOwnership(setId, req.userId!)

  const id = parseInt(req.params.id, 10)
  const [existing] = await db
    .select()
    .from(vragen)
    .where(and(eq(vragen.id, id), eq(vragen.vragenSetId, setId)))
  if (!existing) {
    throw new AppError(404, 'Vraag niet gevonden')
  }

  await db.delete(vragen).where(eq(vragen.id, id))
  res.status(204).end()
})

export default router
