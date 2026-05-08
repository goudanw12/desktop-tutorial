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

router.post('/change-password', authMiddleware, (req: Request, res: Response): void => {
  const { currentPassword, newPassword } = req.body
  const userId = req.user!.id

  if (!currentPassword || !newPassword) {
    res.status(400).json({ success: false, error: '当前密码和新密码不能为空' })
    return
  }

  const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(userId) as any
  if (!user) {
    res.status(404).json({ success: false, error: '用户不存在' })
    return
  }

  const isValid = bcrypt.compareSync(currentPassword, user.password_hash)
  if (!isValid) {
    res.status(401).json({ success: false, error: '当前密码错误' })
    return
  }

  const newPasswordHash = bcrypt.hashSync(newPassword, 10)
  db.prepare("UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?").run(newPasswordHash, userId)

  res.json({ success: true, data: { message: '密码修改成功' } })
})

router.post('/verify', authMiddleware, (req: Request, res: Response): void => {
  const { realName, idNumber, idType } = req.body
  const userId = req.user!.id

  if (!realName || !idNumber) {
    res.status(400).json({ success: false, error: '姓名和证件号不能为空' })
    return
  }

  const existing = db.prepare('SELECT id, status FROM verifications WHERE user_id = ? ORDER BY submitted_at DESC LIMIT 1').get(userId) as any
  if (existing && existing.status === 'pending') {
    res.status(400).json({ success: false, error: '已有认证申请正在审核中' })
    return
  }
  if (existing && existing.status === 'approved') {
    res.status(400).json({ success: false, error: '已完成实名认证' })
    return
  }

  const id = crypto.randomUUID()
  db.prepare(`
    INSERT INTO verifications (id, user_id, real_name, id_number, id_type, status)
    VALUES (?, ?, ?, ?, ?, 'pending')
  `).run(id, userId, realName, idNumber, idType || 'id_card')

  res.status(201).json({ success: true, data: { message: '认证申请已提交', id } })
})

router.get('/verify', authMiddleware, (req: Request, res: Response): void => {
  const userId = req.user!.id

  const verification = db.prepare('SELECT id, real_name, id_type, status, reason, submitted_at, reviewed_at FROM verifications WHERE user_id = ? ORDER BY submitted_at DESC LIMIT 1').get(userId)

  if (!verification) {
    res.json({ success: true, data: null })
    return
  }

  res.json({ success: true, data: verification })
})

export default router
