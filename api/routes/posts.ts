import { Router, type Request, type Response } from 'express'
import crypto from 'crypto'
import db from '../database.js'
import { authMiddleware, optionalAuth } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'

const router = Router()

router.get('/feed', optionalAuth, (req: Request, res: Response): void => {
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 20
  const offset = (page - 1) * limit
  const userId = req.user?.id

  let posts: any[]
  let totalResult: { count: number }

  if (userId) {
    posts = db.prepare(`
      SELECT p.*, u.username, u.avatar, u.is_verified,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ? AND type = 'post') as is_liked,
        (SELECT COUNT(*) FROM bookmarks WHERE post_id = p.id AND user_id = ?) as is_bookmarked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.visibility = 'public' OR p.user_id = ?
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `).all(userId, userId, userId, limit, offset) as any[]

    totalResult = db.prepare(`
      SELECT COUNT(*) as count FROM posts WHERE visibility = 'public' OR user_id = ?
    `).get(userId) as { count: number }
  } else {
    posts = db.prepare(`
      SELECT p.*, u.username, u.avatar, u.is_verified
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.visibility = 'public'
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset) as any[]

    totalResult = db.prepare(`
      SELECT COUNT(*) as count FROM posts WHERE visibility = 'public'
    `).get() as { count: number }
  }

  const postsWithParsed = posts.map(post => ({
    ...post,
    images: JSON.parse(post.images || '[]'),
    tags: JSON.parse(post.tags || '[]'),
    is_liked: !!post.is_liked,
    is_bookmarked: !!post.is_bookmarked,
  }))

  res.json({
    success: true,
    data: {
      posts: postsWithParsed,
      pagination: {
        page,
        limit,
        total: totalResult.count,
        totalPages: Math.ceil(totalResult.count / limit),
      },
    },
  })
})

router.get('/:postId', optionalAuth, (req: Request, res: Response): void => {
  const { postId } = req.params
  const userId = req.user?.id

  let post: any
  if (userId) {
    post = db.prepare(`
      SELECT p.*, u.username, u.avatar, u.is_verified,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ? AND type = 'post') as is_liked,
        (SELECT COUNT(*) FROM bookmarks WHERE post_id = p.id AND user_id = ?) as is_bookmarked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `).get(userId, userId, postId) as any
  } else {
    post = db.prepare(`
      SELECT p.*, u.username, u.avatar, u.is_verified
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `).get(postId) as any
  }

  if (!post) {
    res.status(404).json({ success: false, error: '动态不存在' })
    return
  }

  post.images = JSON.parse(post.images || '[]')
  post.tags = JSON.parse(post.tags || '[]')
  post.is_liked = !!post.is_liked
  post.is_bookmarked = !!post.is_bookmarked

  res.json({ success: true, data: post })
})

router.post('/', authMiddleware, upload.array('images', 9), (req: Request, res: Response): void => {
  const { content, tags, location, visibility } = req.body
  const userId = req.user!.id

  if (!content && (!req.files || (req.files as Express.Multer.File[]).length === 0)) {
    res.status(400).json({ success: false, error: '内容或图片不能同时为空' })
    return
  }

  const id = crypto.randomUUID()
  const images = (req.files as Express.Multer.File[] || []).map(f => `/uploads/${f.filename}`)
  const parsedTags = tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : []

  db.prepare(`
    INSERT INTO posts (id, user_id, content, images, tags, location, visibility)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, userId, content || '', JSON.stringify(images), JSON.stringify(parsedTags), location || null, visibility || 'public')

  const post = db.prepare(`
    SELECT p.*, u.username, u.avatar, u.is_verified
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.id = ?
  `).get(id) as any

  post.images = JSON.parse(post.images || '[]')
  post.tags = JSON.parse(post.tags || '[]')
  post.is_liked = false
  post.is_bookmarked = false

  res.status(201).json({ success: true, data: post })
})

router.delete('/:postId', authMiddleware, (req: Request, res: Response): void => {
  const { postId } = req.params
  const userId = req.user!.id

  const post = db.prepare('SELECT id, user_id FROM posts WHERE id = ?').get(postId) as any
  if (!post) {
    res.status(404).json({ success: false, error: '动态不存在' })
    return
  }

  if (post.user_id !== userId) {
    res.status(403).json({ success: false, error: '无权删除此动态' })
    return
  }

  db.prepare('DELETE FROM posts WHERE id = ?').run(postId)

  res.json({ success: true, data: { message: '删除成功' } })
})

router.post('/:postId/like', authMiddleware, (req: Request, res: Response): void => {
  const { postId } = req.params
  const userId = req.user!.id

  const post = db.prepare('SELECT id, user_id FROM posts WHERE id = ?').get(postId) as any
  if (!post) {
    res.status(404).json({ success: false, error: '动态不存在' })
    return
  }

  const existing = db.prepare('SELECT id FROM likes WHERE post_id = ? AND user_id = ? AND type = \'post\'').get(postId, userId)
  if (existing) {
    res.status(409).json({ success: false, error: '已经点赞了' })
    return
  }

  const id = crypto.randomUUID()
  db.prepare('INSERT INTO likes (id, post_id, user_id, type) VALUES (?, ?, ?, ?)').run(id, postId, userId, 'post')
  db.prepare('UPDATE posts SET like_count = like_count + 1 WHERE id = ?').run(postId)

  if (post.user_id !== userId) {
    db.prepare('INSERT INTO notifications (id, user_id, from_user_id, type, post_id, content) VALUES (?, ?, ?, ?, ?, ?)').run(
      crypto.randomUUID(), post.user_id, userId, 'like', postId, '赞了你的动态'
    )
  }

  res.json({ success: true, data: { message: '点赞成功' } })
})

router.delete('/:postId/like', authMiddleware, (req: Request, res: Response): void => {
  const { postId } = req.params
  const userId = req.user!.id

  const result = db.prepare('DELETE FROM likes WHERE post_id = ? AND user_id = ? AND type = \'post\'').run(postId, userId)
  if (result.changes === 0) {
    res.status(404).json({ success: false, error: '未点赞' })
    return
  }

  db.prepare('UPDATE posts SET like_count = MAX(0, like_count - 1) WHERE id = ?').run(postId)

  res.json({ success: true, data: { message: '取消点赞成功' } })
})

router.post('/:postId/bookmark', authMiddleware, (req: Request, res: Response): void => {
  const { postId } = req.params
  const userId = req.user!.id

  const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(postId)
  if (!post) {
    res.status(404).json({ success: false, error: '动态不存在' })
    return
  }

  const existing = db.prepare('SELECT id FROM bookmarks WHERE post_id = ? AND user_id = ?').get(postId, userId)
  if (existing) {
    res.status(409).json({ success: false, error: '已经收藏了' })
    return
  }

  const id = crypto.randomUUID()
  db.prepare('INSERT INTO bookmarks (id, post_id, user_id) VALUES (?, ?, ?)').run(id, postId, userId)

  res.json({ success: true, data: { message: '收藏成功' } })
})

router.delete('/:postId/bookmark', authMiddleware, (req: Request, res: Response): void => {
  const { postId } = req.params
  const userId = req.user!.id

  const result = db.prepare('DELETE FROM bookmarks WHERE post_id = ? AND user_id = ?').run(postId, userId)
  if (result.changes === 0) {
    res.status(404).json({ success: false, error: '未收藏' })
    return
  }

  res.json({ success: true, data: { message: '取消收藏成功' } })
})

export default router
