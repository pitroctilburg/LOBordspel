import 'dotenv/config'
import path from 'path'
import express from 'express'
import cors from 'cors'
import { errorHandler } from './middleware/errorHandler.js'
import usersRouter from './routes/users.js'
import vragensetsRouter from './routes/vragensets.js'
import spelRouter from './routes/spel.js'
import adminRouter from './routes/admin.js'
import spelsjablonenRouter from './routes/spelsjablonen.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())
// __dirname = server/dist bij productie, server/src bij dev (tsx)
// uploads/ staat naast src/ en dist/, dus één niveau omhoog
const SERVER_ROOT = path.resolve(__dirname, '..')
app.use('/uploads', express.static(path.join(SERVER_ROOT, 'uploads')))

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

// Routes
app.use('/api/users', usersRouter)
app.use('/api/vragensets', vragensetsRouter)
app.use('/api/spelsjablonen', spelsjablonenRouter)
app.use('/api/spel', spelRouter)
app.use('/api/admin', adminRouter)

// Centraal error handling (moet na alle routes)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server draait op http://localhost:${PORT}`)
})
