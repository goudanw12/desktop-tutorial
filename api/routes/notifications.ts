import { Router, type Request, type Response } from 'express'
import db from '../database.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.get('/', authMiddleware, (req: Request, res: Response): void => {
  const userId = req.user!.id
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 20
  const offset = (page - 1) * limit

  const notifications = db.prepare(`
    SELECT n.*, u.username as from_username, u.avatar as from_avatar
    FROM notifications n
    LEFT JOIN users u ON n.from_user_id = u.id
    WHERE n.user_id = ?
    ORDER BY n.created_at DESC
    LIMIT ? OFFSET ?
  `).all(userId, limit, offset) as any[]

  const total = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ?').get(userId) as { count: number }
  const unreadCount = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0').get(userId) as { count: number }

  res.json({
    success: true,
    data: {
      notifications,
      unreadCount: unreadCount.count,
      pagination: {
        page,
        limit,
        total: total.count,
        totalPages: Math.ceil(total.count / limit),
      },
    },
  })
})

router.put('/read', authMiddleware, (req: Request, res: Response): void => {
  const { notificationIds } = req.body
  const userId = req.user!.id

  if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
    res.status(400).json({ success: false, error: '请提供通知ID列表' })
    return
  }

  const placeholders = notificationIds.map(() => '?').join(',')
  db.prepare(`UPDATE notifications SET is_read = 1 WHERE user_id = ? AND id IN (${placeholders})`).run(userId, ...notificationIds)

  res.json({ success: true, data: { message: '标记已读成功' } })
})

router.put('/read-all', authMiddleware, (req: Request, res: Response): void => {
  const userId = req.user!.id

  db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0').run(userId)

  res.json({ success: true, data: { message: '全部标记已读成功' } })
})

export default router
