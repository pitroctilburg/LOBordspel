import { Router } from 'express'
import crypto from 'crypto'
import { db } from '../db/index.js'
import { vragenSets, vragen, geslotenVragen } from '../db/schema.js'
import { eq, count, and } from 'drizzle-orm'
import { requireUser } from '../middleware/requireUser.js'
import { validateBody } from '../middleware/validateBody.js'
import {
  createVragenSetSchema,
  updateVragenSetSchema,
} from '../validation/schemas.js'
import { AppError } from '../middleware/errorHandler.js'
import vragenRouter from './vragen.js'
import geslotenVragenRouter from './geslotenVragen.js'

const router = Router()

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
  const result = await db
    .insert(vragenSets)
    .values({ label: req.body.label, userId: req.userId! })
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

// Detail vragenset met tellingen
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

  res.json({
    ...set,
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
    const id = parseInt(req.params.id, 10)
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

// Genereer shareToken
router.post('/:id/share', async (req, res) => {
  const id = parseInt(req.params.id, 10)
  await getOwnedSet(id, req.userId!)
  const shareToken = crypto.randomBytes(16).toString('hex')
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

export default router
