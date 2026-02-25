import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { errorHandler } from './middleware/errorHandler.js'
import usersRouter from './routes/users.js'
import vragensetsRouter from './routes/vragensets.js'
import spelRouter from './routes/spel.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

// Routes
app.use('/api/users', usersRouter)
app.use('/api/vragensets', vragensetsRouter)
app.use('/api/spel', spelRouter)

// Centraal error handling (moet na alle routes)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server draait op http://localhost:${PORT}`)
})
