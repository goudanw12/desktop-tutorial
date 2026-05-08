import { Router, type Request, type Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import db from '../database.js'
import { authMiddleware, JWT_SECRET } from '../middleware/auth.js'

const router = Router()

router.post('/register', (req: Request, res: Response): void => {
  const { username, email, password } = req.body

  if (!username || !email || !password) {
    res.status(400).json({ success: false, error: '用户名、邮箱和密码不能为空' })
    return
  }

  const existingUser = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username)
  if (existingUser) {
    res.status(409).json({ success: false, error: '邮箱或用户名已存在' })
    return
  }

  const id = crypto.randomUUID()
  const passwordHash = bcrypt.hashSync(password, 10)

  db.prepare(`
    INSERT INTO users (id, username, email, password_hash)
    VALUES (?, ?, ?, ?)
  `).run(id, username, email, passwordHash)

  const token = jwt.sign({ id, username, email }, JWT_SECRET, { expiresIn: '7d' })

  const user = db.prepare('SELECT id, username, email, avatar, bio, is_verified, is_private, theme, created_at FROM users WHERE id = ?').get(id)

  res.status(201).json({ success: true, data: { token, user } })
})

router.post('/login', (req: Request, res: Response): void => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400).json({ success: false, error: '邮箱和密码不能为空' })
    return
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any
  if (!user) {
    res.status(401).json({ success: false, error: '邮箱或密码错误' })
    return
  }

  const isValid = bcrypt.compareSync(password, user.password_hash)
  if (!isValid) {
    res.status(401).json({ success: false, error: '邮箱或密码错误' })
    return
  }

  const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '7d' })

  const { password_hash, ...userWithoutPassword } = user

  res.json({ success: true, data: { token, user: userWithoutPassword } })
})

router.get('/me', authMiddleware, (req: Request, res: Response): void => {
  const user = db.prepare('SELECT id, username, email, phone, avatar, bio, is_verified, is_private, theme, created_at, updated_at FROM users WHERE id = ?').get(req.user!.id)

  if (!user) {
    res.status(404).json({ success: false, error: '用户不存在' })
    return
  }

  res.json({ success: true, data: user })
})

export default router
