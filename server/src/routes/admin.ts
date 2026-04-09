import { Router, type Router as ExpressRouter } from 'express'

const router: ExpressRouter = Router()

// POST /api/admin/login — verifieer het beheerderswachtwoord
router.post('/login', (req, res) => {
  const { wachtwoord } = req.body as { wachtwoord?: string }
  const correct = process.env.ADMIN_PASSWORD

  if (!correct) {
    res.status(500).json({ error: 'ADMIN_PASSWORD is niet ingesteld op de server' })
    return
  }

  if (!wachtwoord || wachtwoord !== correct) {
    res.status(401).json({ error: 'Ongeldig wachtwoord' })
    return
  }

  res.json({ ok: true })
})

export default router
