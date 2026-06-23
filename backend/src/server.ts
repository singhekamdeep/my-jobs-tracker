import express from 'express'
import cors from 'cors'
import { prisma } from './db/db.js'
import { ENV } from './db/env.js'
import cookieParser from 'cookie-parser'
import authRouter from './routes/auth.route.js'
import applicationRouter from './routes/application.route.js'
import { errorMiddleware } from './middleware/error.middleware.js'
import { rateLimitMiddleware } from './middleware/rateLimit.middleware.js'

const PORT = ENV.PORT

const app = express()
app.use(express.json({ limit: '10mb' }))
app.use(cookieParser())
const allowedOrigins = [ENV.CLIENT_URL, 'http://127.0.0.1:5173', 'http://localhost:5173']
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) { callback(null, true); return; }
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) { callback(null, true); return; }
    if (allowedOrigins.includes(origin)) { callback(null, true); return; }
    if (origin.startsWith('chrome-extension://')) { callback(null, true); return; }
    console.warn('⚠️ CORS Blocked Origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}
app.use(cors(corsOptions))

// Global rate limiting
app.use(rateLimitMiddleware)

// Routes
app.use('/api/auth', authRouter)
app.use('/api/applications', applicationRouter)

// Health check
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    data: { status: 'ok', uptime: process.uptime() },
    error: null,
    meta: null,
  })
})

// Global error handler (must be after all routes)
app.use(errorMiddleware)

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`)

  try {
    await prisma.$connect()
    console.log('Database connected successfully')
  } catch (error) {
    console.log('Error connecting Database', error)
  }
})