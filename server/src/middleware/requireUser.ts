import { Request, Response, NextFunction } from 'express'
import { db } from '../db/index.js'
import { users } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { AppError } from './errorHandler.js'

declare global {
  namespace Express {
    interface Request {
      userId?: number
    }
  }
}

export async function requireUser(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const header = req.headers['x-user-id']
  if (!header || typeof header !== 'string') {
    throw new AppError(401, 'X-User-Id header ontbreekt')
  }

  const userId = parseInt(header, 10)
  if (isNaN(userId)) {
    throw new AppError(401, 'Ongeldig X-User-Id')
  }

  const [user] = await db.select().from(users).where(eq(users.id, userId))
  if (!user) {
    throw new AppError(401, 'Gebruiker niet gevonden')
  }

  req.userId = userId
  next()
}
