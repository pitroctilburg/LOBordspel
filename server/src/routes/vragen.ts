import { Router } from 'express'
import { db } from '../db/index.js'
import { vragen, vragenSets, themas } from '../db/schema.js'
import { eq, and } from 'drizzle-orm'
import { validateBody } from '../middleware/validateBody.js'
import { createVraagSchema, updateVraagSchema } from '../validation/schemas.js'
import { AppError } from '../middleware/errorHandler.js'

const router: Router = Router({ mergeParams: true })

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

async function validateThemaBelongsToSet(themaId: number, setId: number) {
  const [set] = await db.select().from(vragenSets).where(eq(vragenSets.id, setId))
  if (!set) throw new AppError(404, 'Vragenset niet gevonden')

  const [thema] = await db.select().from(themas).where(eq(themas.id, themaId))
  if (!thema) throw new AppError(400, 'Thema niet gevonden')
  if (thema.spelSjabloonId !== set.spelSjabloonId) {
    throw new AppError(400, 'Thema hoort niet bij het spelsjabloon van deze vragenset')
  }
}

router.post('/', validateBody(createVraagSchema), async (req, res) => {
  const params = req.params as Record<string, string>
  const setId = parseInt(params.setId, 10)
  await checkSetOwnership(setId, req.userId!)
  await validateThemaBelongsToSet(req.body.themaId, setId)

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

router.get('/', async (req, res) => {
  const params = req.params as Record<string, string>
  const setId = parseInt(params.setId, 10)
  await checkSetOwnership(setId, req.userId!)

  const conditions = [eq(vragen.vragenSetId, setId)]
  if (req.query.themaId) {
    conditions.push(eq(vragen.themaId, parseInt(req.query.themaId as string, 10)))
  }

  const result = await db
    .select()
    .from(vragen)
    .where(and(...conditions))
    .orderBy(vragen.createdAt)
  res.json(result)
})

router.put('/:id', validateBody(updateVraagSchema), async (req, res) => {
  const params = req.params as Record<string, string>
  const setId = parseInt(params.setId, 10)
  await checkSetOwnership(setId, req.userId!)
  await validateThemaBelongsToSet(req.body.themaId, setId)

  const id = parseInt(params.id, 10)
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

router.delete('/:id', async (req, res) => {
  const params = req.params as Record<string, string>
  const setId = parseInt(params.setId, 10)
  await checkSetOwnership(setId, req.userId!)

  const id = parseInt(params.id, 10)
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
