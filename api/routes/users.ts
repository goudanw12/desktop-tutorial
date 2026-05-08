import { Router, type Request, type Response } from 'express'
import crypto from 'crypto'
import db from '../database.js'
import { authMiddleware } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'

const router = Router()

router.get('/:userId', (req: Request, res: Response): void => {
  const { userId } = req.params

  const user = db.prepare('SELECT id, username, email, phone, avatar, bio, is_verified, is_private, theme, created_at FROM users WHERE id = ?').get(userId) as any
  if (!user) {
    res.status(404).json({ success: false, error: '用户不存在' })
    return
  }

  const postCount = db.prepare('SELECT COUNT(*) as count FROM posts WHERE user_id = ?').get(userId) as { count: number }
  const followerCount = db.prepare('SELECT COUNT(*) as count FROM follows WHERE following_id = ?').get(userId) as { count: number }
  const followingCount = db.prepare('SELECT COUNT(*) as count FROM follows WHERE follower_id = ?').get(userId) as { count: number }

  res.json({
    success: true,
    data: {
      ...user,
      postCount: postCount.count,
      followerCount: followerCount.count,
      followingCount: followingCount.count,
    },
  })
})

router.put('/profile', authMiddleware, upload.single('avatar'), (req: Request, res: Response): void => {
  const { username, phone, avatar, bio, is_private, theme } = req.body

  if (username) {
    const existing = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(username, req.user!.id)
    if (existing) {
      res.status(409).json({ success: false, error: '用户名已存在' })
      return
    }
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user!.id) as any
  if (!user) {
    res.status(404).json({ success: false, error: '用户不存在' })
    return
  }

  const updates: string[] = []
  const values: any[] = []

  if (username !== undefined) { updates.push('username = ?'); values.push(username) }
  if (phone !== undefined) { updates.push('phone = ?'); values.push(phone) }
  if (req.file) {
    updates.push('avatar = ?')
    values.push(`/uploads/${req.file.filename}`)
  } else if (avatar !== undefined) { updates.push('avatar = ?'); values.push(avatar) }
  if (bio !== undefined) { updates.push('bio = ?'); values.push(bio) }
  if (is_private !== undefined) { updates.push('is_private = ?'); values.push(is_private) }
  if (theme !== undefined) { updates.push('theme = ?'); values.push(theme) }

  if (updates.length === 0) {
    res.status(400).json({ success: false, error: '没有提供更新字段' })
    return
  }

  updates.push("updated_at = datetime('now')")
  values.push(req.user!.id)

  db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values)

  const updatedUser = db.prepare('SELECT id, username, email, phone, avatar, bio, is_verified, is_private, theme, created_at, updated_at FROM users WHERE id = ?').get(req.user!.id)

  res.json({ success: true, data: updatedUser })
})

router.post('/:userId/follow', authMiddleware, (req: Request, res: Response): void => {
  const { userId } = req.params
  const currentUserId = req.user!.id

  if (userId === currentUserId) {
    res.status(400).json({ success: false, error: '不能关注自己' })
    return
  }

  const targetUser = db.prepare('SELECT id FROM users WHERE id = ?').get(userId)
  if (!targetUser) {
    res.status(404).json({ success: false, error: '用户不存在' })
    return
  }

  const existing = db.prepare('SELECT id FROM follows WHERE follower_id = ? AND following_id = ?').get(currentUserId, userId)
  if (existing) {
    res.status(409).json({ success: false, error: '已经关注了该用户' })
    return
  }

  const id = crypto.randomUUID()
  db.prepare('INSERT INTO follows (id, follower_id, following_id) VALUES (?, ?, ?)').run(id, currentUserId, userId)

  db.prepare('INSERT INTO notifications (id, user_id, from_user_id, type, content) VALUES (?, ?, ?, ?, ?)').run(
    crypto.randomUUID(), userId, currentUserId, 'follow', '关注了你'
  )

  res.json({ success: true, data: { message: '关注成功' } })
})

router.delete('/:userId/follow', authMiddleware, (req: Request, res: Response): void => {
  const { userId } = req.params
  const currentUserId = req.user!.id

  const result = db.prepare('DELETE FROM follows WHERE follower_id = ? AND following_id = ?').run(currentUserId, userId)
  if (result.changes === 0) {
    res.status(404).json({ success: false, error: '未关注该用户' })
    return
  }

  res.json({ success: true, data: { message: '取消关注成功' } })
})

router.get('/:userId/followers', (req: Request, res: Response): void => {
  const { userId } = req.params
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 20
  const offset = (page - 1) * limit

  const followers = db.prepare(`
    SELECT u.id, u.username, u.avatar, u.bio, u.is_verified, f.created_at as followed_at
    FROM follows f
    JOIN users u ON f.follower_id = u.id
    WHERE f.following_id = ?
    ORDER BY f.created_at DESC
    LIMIT ? OFFSET ?
  `).all(userId, limit, offset)

  const total = db.prepare('SELECT COUNT(*) as count FROM follows WHERE following_id = ?').get(userId) as { count: number }

  res.json({
    success: true,
    data: {
      followers,
      pagination: {
        page,
        limit,
        total: total.count,
        totalPages: Math.ceil(total.count / limit),
      },
    },
  })
})

router.get('/:userId/following', (req: Request, res: Response): void => {
  const { userId } = req.params
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 20
  const offset = (page - 1) * limit

  const following = db.prepare(`
    SELECT u.id, u.username, u.avatar, u.bio, u.is_verified, f.created_at as followed_at
    FROM follows f
    JOIN users u ON f.following_id = u.id
    WHERE f.follower_id = ?
    ORDER BY f.created_at DESC
    LIMIT ? OFFSET ?
  `).all(userId, limit, offset)

  const total = db.prepare('SELECT COUNT(*) as count FROM follows WHERE follower_id = ?').get(userId) as { count: number }

  res.json({
    success: true,
    data: {
      following,
      pagination: {
        page,
        limit,
        total: total.count,
        totalPages: Math.ceil(total.count / limit),
      },
    },
  })
})

router.get('/:userId/posts', (req: Request, res: Response): void => {
  const { userId } = req.params
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 20
  const offset = (page - 1) * limit

  const posts = db.prepare(`
    SELECT p.*, u.username, u.avatar, u.is_verified
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.user_id = ?
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `).all(userId, limit, offset) as any[]

  const total = db.prepare('SELECT COUNT(*) as count FROM posts WHERE user_id = ?').get(userId) as { count: number }

  const postsWithParsed = posts.map(post => ({
    ...post,
    images: JSON.parse(post.images || '[]'),
    tags: JSON.parse(post.tags || '[]'),
  }))

  res.json({
    success: true,
    data: {
      posts: postsWithParsed,
      pagination: {
        page,
        limit,
        total: total.count,
        totalPages: Math.ceil(total.count / limit),
      },
    },
  })
})

export default router
