import { Router } from 'express'
import { db } from '../db/index.js'
import { users } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { validateBody } from '../middleware/validateBody.js'
import { createUserSchema } from '../validation/schemas.js'
import { AppError } from '../middleware/errorHandler.js'

const router = Router()

// Registreer nieuwe gebruiker
router.post('/', validateBody(createUserSchema), async (req, res) => {
  const result = await db.insert(users).values(req.body).$returningId()
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, result[0].id))
  res.status(201).json(user)
})

// Lijst alle gebruikers (voor login-picker)
router.get('/', async (_req, res) => {
  const result = await db.select().from(users).orderBy(users.naam)
  res.json(result)
})

// Gebruiker detail
router.get('/:id', async (req, res) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, parseInt(req.params.id, 10)))
  if (!user) {
    throw new AppError(404, 'Gebruiker niet gevonden')
  }
  res.json(user)
})

export default router
