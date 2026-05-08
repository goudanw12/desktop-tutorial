import { Router, type Request, type Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import db from '../database.js'
import { authMiddleware, JWT_SECRET } from '../middleware/auth.js'

const router = Router()

const smsCodes = new Map<string, { code: string; expires: number }>()

function generateToken(user: any) {
  return jwt.sign({ id: user.id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
}

function sanitizeUser(user: any) {
  const { password_hash, ...rest } = user
  return rest
}

router.post('/register', (req: Request, res: Response): void => {
  const { username, email, password, phone } = req.body

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
    INSERT INTO users (id, username, email, password_hash, phone)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, username, email, passwordHash, phone || null)

  const token = generateToken({ id, username, email })
  const user = db.prepare('SELECT id, username, email, phone, avatar, bio, is_verified, is_private, theme, created_at FROM users WHERE id = ?').get(id)

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

  const token = generateToken(user)
  res.json({ success: true, data: { token, user: sanitizeUser(user) } })
})

router.post('/sms/send', (req: Request, res: Response): void => {
  const { phone } = req.body

  if (!phone || !/^1\d{10}$/.test(phone)) {
    res.status(400).json({ success: false, error: '请输入正确的手机号' })
    return
  }

  const code = String(Math.floor(100000 + Math.random() * 900000))
  smsCodes.set(phone, { code, expires: Date.now() + 5 * 60 * 1000 })

  console.log(`[SMS] 手机号 ${phone} 验证码: ${code}`)

  res.json({ success: true, data: { message: '验证码已发送' } })
})

router.post('/sms/login', (req: Request, res: Response): void => {
  const { phone, code } = req.body

  if (!phone || !code) {
    res.status(400).json({ success: false, error: '手机号和验证码不能为空' })
    return
  }

  const stored = smsCodes.get(phone)
  if (!stored || stored.code !== code || Date.now() > stored.expires) {
    res.status(401).json({ success: false, error: '验证码错误或已过期' })
    return
  }

  smsCodes.delete(phone)

  let user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone) as any

  if (!user) {
    const id = crypto.randomUUID()
    const username = `用户${phone.slice(-4)}`
    const email = `${phone}@phone.social`
    const passwordHash = bcrypt.hashSync(crypto.randomUUID(), 10)

    db.prepare(`
      INSERT INTO users (id, username, email, password_hash, phone)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, username, email, passwordHash, phone)

    user = db.prepare('SELECT * FROM users WHERE id = ?').get(id)
  }

  const token = generateToken(user)
  res.json({ success: true, data: { token, user: sanitizeUser(user) } })
})

router.post('/oauth/qq', (req: Request, res: Response): void => {
  const { qqOpenId, nickname, avatar } = req.body

  if (!qqOpenId) {
    res.status(400).json({ success: false, error: 'QQ授权信息无效' })
    return
  }

  let user = db.prepare('SELECT * FROM users WHERE email = ?').get(`qq_${qqOpenId}@qq.social`) as any

  if (!user) {
    const id = crypto.randomUUID()
    const username = nickname || `QQ用户${qqOpenId.slice(-4)}`
    const email = `qq_${qqOpenId}@qq.social`
    const passwordHash = bcrypt.hashSync(crypto.randomUUID(), 10)
    const userAvatar = avatar || `https://picsum.photos/seed/qq${qqOpenId}/200/200`

    db.prepare(`
      INSERT INTO users (id, username, email, password_hash, avatar)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, username, email, passwordHash, userAvatar)

    user = db.prepare('SELECT * FROM users WHERE id = ?').get(id)
  }

  const token = generateToken(user)
  res.json({ success: true, data: { token, user: sanitizeUser(user) } })
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

  if (idType === 'id_card' || !idType) {
    if (!/^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(idNumber)) {
      res.status(400).json({ success: false, error: '身份证号格式不正确' })
      return
    }
  }

  if (realName.length < 2) {
    res.status(400).json({ success: false, error: '姓名至少2个字符' })
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

  const isAutoApproved = realName.length >= 2 && idNumber.length >= 15

  const status = isAutoApproved ? 'approved' : 'pending'

  db.prepare(`
    INSERT INTO verifications (id, user_id, real_name, id_number, id_type, status, reviewed_at)
    VALUES (?, ?, ?, ?, ?, ?, ${isAutoApproved ? "datetime('now')" : 'NULL'})
  `).run(id, userId, realName, idNumber, idType || 'id_card', status)

  if (isAutoApproved) {
    db.prepare("UPDATE users SET is_verified = 1, updated_at = datetime('now') WHERE id = ?").run(userId)
  }

  res.status(201).json({
    success: true,
    data: {
      message: isAutoApproved ? '实名认证通过' : '认证申请已提交，等待审核',
      status,
      id,
    },
  })
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
