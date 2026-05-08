import { type Request, type Response, type NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = 'social-app-secret-key-2024'

export interface AuthUser {
  id: string
  username: string
  email: string
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: '未提供认证令牌' })
    return
  }

  const token = authHeader.substring(7)
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser
    req.user = decoded
    next()
  } catch {
    res.status(401).json({ success: false, error: '令牌无效或已过期' })
  }
}

export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthUser
      req.user = decoded
    } catch {
      // ignore
    }
  }
  next()
}

export { JWT_SECRET }
