import { Router, type Request, type Response } from 'express'
import crypto from 'crypto'
import db from '../database.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.get('/post/:postId', (req: Request, res: Response): void => {
  const { postId } = req.params
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 20
  const offset = (page - 1) * limit

  const comments = db.prepare(`
    SELECT c.*, u.username, u.avatar, u.is_verified
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.post_id = ?
    ORDER BY c.created_at DESC
    LIMIT ? OFFSET ?
  `).all(postId, limit, offset) as any[]

  const total = db.prepare('SELECT COUNT(*) as count FROM comments WHERE post_id = ?').get(postId) as { count: number }

  res.json({
    success: true,
    data: {
      comments,
      pagination: {
        page,
        limit,
        total: total.count,
        totalPages: Math.ceil(total.count / limit),
      },
    },
  })
})

router.post('/post/:postId', authMiddleware, (req: Request, res: Response): void => {
  const { postId } = req.params
  const { content } = req.body
  const userId = req.user!.id

  if (!content) {
    res.status(400).json({ success: false, error: '评论内容不能为空' })
    return
  }

  const post = db.prepare('SELECT id, user_id FROM posts WHERE id = ?').get(postId) as any
  if (!post) {
    res.status(404).json({ success: false, error: '动态不存在' })
    return
  }

  const id = crypto.randomUUID()
  db.prepare('INSERT INTO comments (id, post_id, user_id, content) VALUES (?, ?, ?, ?)').run(id, postId, userId, content)
  db.prepare('UPDATE posts SET comment_count = comment_count + 1 WHERE id = ?').run(postId)

  if (post.user_id !== userId) {
    db.prepare('INSERT INTO notifications (id, user_id, from_user_id, type, post_id, content) VALUES (?, ?, ?, ?, ?, ?)').run(
      crypto.randomUUID(), post.user_id, userId, 'comment', postId, '评论了你的动态'
    )
  }

  const comment = db.prepare(`
    SELECT c.*, u.username, u.avatar, u.is_verified
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.id = ?
  `).get(id)

  res.status(201).json({ success: true, data: comment })
})

router.delete('/:commentId', authMiddleware, (req: Request, res: Response): void => {
  const { commentId } = req.params
  const userId = req.user!.id

  const comment = db.prepare('SELECT id, post_id, user_id FROM comments WHERE id = ?').get(commentId) as any
  if (!comment) {
    res.status(404).json({ success: false, error: '评论不存在' })
    return
  }

  if (comment.user_id !== userId) {
    res.status(403).json({ success: false, error: '无权删除此评论' })
    return
  }

  db.prepare('DELETE FROM comments WHERE id = ?').run(commentId)
  db.prepare('UPDATE posts SET comment_count = MAX(0, comment_count - 1) WHERE id = ?').run(comment.post_id)

  res.json({ success: true, data: { message: '删除成功' } })
})

router.post('/:commentId/like', authMiddleware, (req: Request, res: Response): void => {
  const { commentId } = req.params
  const userId = req.user!.id

  const comment = db.prepare('SELECT id FROM comments WHERE id = ?').get(commentId)
  if (!comment) {
    res.status(404).json({ success: false, error: '评论不存在' })
    return
  }

  const existing = db.prepare('SELECT id FROM likes WHERE comment_id = ? AND user_id = ? AND type = \'comment\'').get(commentId, userId)
  if (existing) {
    res.status(409).json({ success: false, error: '已经点赞了' })
    return
  }

  const id = crypto.randomUUID()
  db.prepare('INSERT INTO likes (id, comment_id, user_id, type) VALUES (?, ?, ?, ?)').run(id, commentId, userId, 'comment')
  db.prepare('UPDATE comments SET like_count = like_count + 1 WHERE id = ?').run(commentId)

  res.json({ success: true, data: { message: '点赞成功' } })
})

export default router
