import { Router, type Request, type Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import db from '../database.js'
import { authMiddleware, JWT_SECRET } from '../middleware/auth.js'

const router = Router()

const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()
const registerAttempts = new Map<string, { count: number; lastAttempt: number }>()
const BLOCK_DURATION = 15 * 60 * 1000
const MAX_LOGIN_ATTEMPTS = 5
const MAX_REGISTER_ATTEMPTS = 3

function isBlocked(map: Map<string, { count: number; lastAttempt: number }>, key: string, maxAttempts: number): boolean {
  const record = map.get(key)
  if (!record) return false
  if (Date.now() - record.lastAttempt > BLOCK_DURATION) {
    map.delete(key)
    return false
  }
  return record.count >= maxAttempts
}

function recordAttempt(map: Map<string, { count: number; lastAttempt: number }>, key: string): void {
  const record = map.get(key)
  if (record && Date.now() - record.lastAttempt > BLOCK_DURATION) {
    map.set(key, { count: 1, lastAttempt: Date.now() })
  } else if (record) {
    record.count++
    record.lastAttempt = Date.now()
  } else {
    map.set(key, { count: 1, lastAttempt: Date.now() })
  }
}

function clearAttempts(map: Map<string, { count: number; lastAttempt: number }>, key: string): void {
  map.delete(key)
}

function sanitizeInput(input: string): string {
  return input.replace(/[<>'"&\\]/g, '').trim().slice(0, 100)
}

function generateToken(user: any) {
  return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' })
}

function sanitizeUser(user: any) {
  const { password_hash, email, phone, ...rest } = user
  return rest
}

function generateUniqueUsername(): string {
  const prefixes = ['星', '月', '风', '云', '雪', '花', '海', '山', '光', '影', '梦', '灵', '辰', '夜', '晨']
  const suffixes = ['旅人', '行者', '探索者', '守望者', '追梦人', '漫步者', '冒险家', '观察者', '创造者', '思考者']
  let username = ''
  let attempts = 0
  while (attempts < 20) {
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]
    const num = Math.floor(Math.random() * 9000) + 1000
    username = `${prefix}${suffix}${num}`
    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username)
    if (!existing) return username
    attempts++
  }
  return `用户${Date.now().toString(36)}`
}

router.get('/check-username', (req: Request, res: Response): void => {
  const { username } = req.query
  if (!username || typeof username !== 'string') {
    res.json({ success: true, data: { available: false } })
    return
  }
  const clean = sanitizeInput(username)
  if (clean.length < 2 || clean.length > 20) {
    res.json({ success: true, data: { available: false } })
    return
  }
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(clean)
  res.json({ success: true, data: { available: !existing } })
})

router.post('/register', (req: Request, res: Response): void => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown'

  if (isBlocked(registerAttempts, clientIp, MAX_REGISTER_ATTEMPTS)) {
    res.status(429).json({ success: false, error: '注册请求过于频繁，请15分钟后再试' })
    return
  }

  const { username, password } = req.body

  if (!password) {
    res.status(400).json({ success: false, error: '密码不能为空' })
    return
  }

  if (typeof password !== 'string' || password.length < 6) {
    res.status(400).json({ success: false, error: '密码不能少于6位' })
    return
  }

  if (password.length > 128) {
    res.status(400).json({ success: false, error: '密码过长' })
    return
  }

  const finalUsername = username ? sanitizeInput(String(username)) : generateUniqueUsername()

  if (finalUsername.length < 2 || finalUsername.length > 20) {
    res.status(400).json({ success: false, error: '用户名需要2-20个字符' })
    return
  }

  if (!/^[a-zA-Z0-9\u4e00-\u9fa5_]+$/.test(finalUsername)) {
    res.status(400).json({ success: false, error: '用户名只能包含中文、字母、数字和下划线' })
    return
  }

  const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(finalUsername)
  if (existingUser) {
    recordAttempt(registerAttempts, clientIp)
    res.status(409).json({ success: false, error: '用户名已存在，请换一个' })
    return
  }

  const id = crypto.randomUUID()
  const passwordHash = bcrypt.hashSync(password, 12)
  const email = `${id}@auto.social`

  db.prepare(`
    INSERT INTO users (id, username, email, password_hash)
    VALUES (?, ?, ?, ?)
  `).run(id, finalUsername, email, passwordHash)

  const token = generateToken({ id, username: finalUsername })
  const user = db.prepare('SELECT id, username, email, phone, avatar, bio, is_verified, is_private, theme, created_at FROM users WHERE id = ?').get(id)

  clearAttempts(registerAttempts, clientIp)

  res.status(201).json({ success: true, data: { token, user } })
})

router.post('/login', (req: Request, res: Response): void => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown'

  if (isBlocked(loginAttempts, clientIp, MAX_LOGIN_ATTEMPTS)) {
    res.status(429).json({ success: false, error: '登录失败次数过多，请15分钟后再试' })
    return
  }

  const { username, password } = req.body

  if (!username || !password) {
    res.status(400).json({ success: false, error: '用户名和密码不能为空' })
    return
  }

  if (typeof password !== 'string' || password.length < 6) {
    res.status(400).json({ success: false, error: '用户名或密码错误' })
    return
  }

  const cleanUsername = sanitizeInput(String(username))

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(cleanUsername) as any
  if (!user) {
    recordAttempt(loginAttempts, clientIp)
    res.status(401).json({ success: false, error: '用户名或密码错误' })
    return
  }

  const isValid = bcrypt.compareSync(password, user.password_hash)
  if (!isValid) {
    recordAttempt(loginAttempts, clientIp)
    res.status(401).json({ success: false, error: '用户名或密码错误' })
    return
  }

  clearAttempts(loginAttempts, clientIp)

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
    const username = nickname ? sanitizeInput(String(nickname)) : `QQ用户${qqOpenId.slice(-4)}`
    const email = `qq_${qqOpenId}@qq.social`
    const passwordHash = bcrypt.hashSync(crypto.randomUUID(), 12)
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

  if (typeof newPassword !== 'string' || newPassword.length < 6) {
    res.status(400).json({ success: false, error: '新密码不能少于6位' })
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

  const newPasswordHash = bcrypt.hashSync(newPassword, 12)
  db.prepare("UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?").run(newPasswordHash, userId)

  res.json({ success: true, data: { message: '密码修改成功' } })
})

function validateIdCard(idNumber: string): boolean {
  if (!/^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(idNumber)) {
    return false
  }
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
  let sum = 0
  for (let i = 0; i < 17; i++) {
    sum += parseInt(idNumber[i]) * weights[i]
  }
  const checkChar = checkCodes[sum % 11]
  return idNumber[17].toUpperCase() === checkChar
}

router.post('/verify', authMiddleware, (req: Request, res: Response): void => {
  const { realName, idNumber, idType } = req.body
  const userId = req.user!.id

  if (!realName || !idNumber) {
    res.status(400).json({ success: false, error: '姓名和证件号不能为空' })
    return
  }

  if (realName.length < 2) {
    res.status(400).json({ success: false, error: '姓名至少2个字符' })
    return
  }

  if (idType === 'id_card' || !idType) {
    if (!validateIdCard(idNumber)) {
      res.status(400).json({ success: false, error: '身份证号不正确，请核对后重新输入' })
      return
    }
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

  res.status(201).json({
    success: true,
    data: {
      message: '认证申请已提交，等待人工审核',
      status: 'pending',
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

router.get('/verify/pending', authMiddleware, (req: Request, res: Response): void => {
  const adminUser = db.prepare('SELECT is_verified FROM users WHERE id = ?').get(req.user!.id) as any
  if (!adminUser?.is_verified) {
    res.status(403).json({ success: false, error: '无权访问' })
    return
  }

  const pending = db.prepare(`
    SELECT v.id, v.user_id, v.real_name, v.id_number, v.id_type, v.status, v.submitted_at, u.username
    FROM verifications v
    JOIN users u ON v.user_id = u.id
    WHERE v.status = 'pending'
    ORDER BY v.submitted_at ASC
  `).all()

  res.json({ success: true, data: pending })
})

router.post('/verify/:id/review', authMiddleware, (req: Request, res: Response): void => {
  const adminUser = db.prepare('SELECT is_verified FROM users WHERE id = ?').get(req.user!.id) as any
  if (!adminUser?.is_verified) {
    res.status(403).json({ success: false, error: '无权操作' })
    return
  }

  const { action, reason } = req.body
  if (!action || !['approve', 'reject'].includes(action)) {
    res.status(400).json({ success: false, error: '操作无效' })
    return
  }

  const verification = db.prepare('SELECT * FROM verifications WHERE id = ?').get(req.params.id) as any
  if (!verification) {
    res.status(404).json({ success: false, error: '认证记录不存在' })
    return
  }
  if (verification.status !== 'pending') {
    res.status(400).json({ success: false, error: '该认证已处理' })
    return
  }

  if (action === 'approve') {
    db.prepare("UPDATE verifications SET status = 'approved', reviewed_at = datetime('now') WHERE id = ?").run(req.params.id)
    db.prepare("UPDATE users SET is_verified = 1, updated_at = datetime('now') WHERE id = ?").run(verification.user_id)
    res.json({ success: true, data: { message: '认证已通过' } })
  } else {
    db.prepare("UPDATE verifications SET status = 'rejected', reason = ?, reviewed_at = datetime('now') WHERE id = ?").run(reason || '信息不符', req.params.id)
    res.json({ success: true, data: { message: '认证已拒绝' } })
  }
})

export default router
