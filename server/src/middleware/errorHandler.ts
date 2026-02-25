import { Request, Response, NextFunction } from 'express'

export class AppError extends Error {
  statusCode: number

  constructor(statusCode: number, message: string) {
    super(message)
    this.statusCode = statusCode
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class ValidationError extends AppError {
  details: { veld: string; melding: string }[]

  constructor(details: { veld: string; melding: string }[]) {
    super(400, 'Validatiefout')
    this.details = details
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ValidationError) {
    res.status(400).json({
      error: err.message,
      details: err.details,
    })
    return
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message })
    return
  }

  // MySQL duplicate entry (ER_DUP_ENTRY)
  if ('code' in err && (err as any).code === 'ER_DUP_ENTRY') {
    res.status(409).json({ error: 'Record bestaat al' })
    return
  }

  console.error('Onverwachte fout:', err)
  res.status(500).json({ error: 'Interne serverfout' })
}
