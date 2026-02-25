import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { ValidationError } from './errorHandler.js'

export function validateBody(schema: z.ZodType) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      const details = result.error.issues.map((e) => ({
        veld: e.path.join('.'),
        melding: e.message,
      }))
      next(new ValidationError(details))
      return
    }

    req.body = result.data
    next()
  }
}
