import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import './database.js'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import postRoutes from './routes/posts.js'
import commentRoutes from './routes/comments.js'
import chatRoutes from './routes/chats.js'
import notificationRoutes from './routes/notifications.js'
import searchRoutes from './routes/search.js'
import storyRoutes from './routes/stories.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app: express.Application = express()

app.use(cors())

app.use((req: Request, res: Response, next: NextFunction): void => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  res.removeHeader('X-Powered-By')
  next()
})

const apiRequestCounts = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000
const MAX_REQUESTS_PER_MINUTE = 60

app.use((req: Request, res: Response, next: NextFunction): void => {
  if (req.path.startsWith('/api/')) {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown'
    const now = Date.now()
    const record = apiRequestCounts.get(clientIp)

    if (!record || now > record.resetTime) {
      apiRequestCounts.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    } else {
      record.count++
      if (record.count > MAX_REQUESTS_PER_MINUTE) {
        res.status(429).json({ success: false, error: '请求过于频繁，请稍后再试' })
        return
      }
    }
  }
  next()
})

app.use((req: Request, res: Response, next: NextFunction): void => {
  if (req.path.startsWith('/api/')) {
    const suspiciousPatterns = [
      /(\.\.\/|\.\.\\)/,
      /<script[\s>]/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /union\s+select/i,
      /drop\s+table/i,
      /insert\s+into/i,
      /delete\s+from/i,
      /update\s+.*\s+set/i,
      /exec\s*\(/i,
      /eval\s*\(/i,
    ]

    const checkValue = (val: any): boolean => {
      if (typeof val === 'string') {
        for (const pattern of suspiciousPatterns) {
          if (pattern.test(val)) return true
        }
      }
      return false
    }

    const url = req.originalUrl
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(url)) {
        res.status(400).json({ success: false, error: '请求包含非法内容' })
        return
      }
    }

    if (req.body && typeof req.body === 'object') {
      for (const val of Object.values(req.body)) {
        if (checkValue(val)) {
          res.status(400).json({ success: false, error: '请求包含非法内容' })
          return
        }
      }
    }

    if (req.query) {
      for (const val of Object.values(req.query)) {
        if (checkValue(val)) {
          res.status(400).json({ success: false, error: '请求包含非法内容' })
          return
        }
      }
    }
  }
  next()
})

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/chats', chatRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/search', searchRoutes)
app.use('/api/stories', storyRoutes)

app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error.message === '只支持 jpg, jpeg, png, gif, webp 格式的图片') {
    res.status(400).json({
      success: false,
      error: error.message,
    })
    return
  }
  console.error('[Server Error]', error.message)
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
