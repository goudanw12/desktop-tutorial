import { Router, type Request, type Response } from 'express'
import crypto from 'crypto'
import db from '../database.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.get('/', (req: Request, res: Response): void => {
  const stories = db.prepare(`
    SELECT s.*, u.username, u.avatar, u.is_verified
    FROM stories s
    JOIN users u ON s.user_id = u.id
    WHERE s.expires_at > datetime('now')
    ORDER BY s.created_at DESC
  `).all() as any[]

  const grouped = new Map<string, any>()
  for (const story of stories) {
    if (!grouped.has(story.user_id)) {
      grouped.set(story.user_id, {
        user: {
          id: story.user_id,
          username: story.username,
          avatar: story.avatar,
          is_verified: story.is_verified,
        },
        stories: [],
      })
    }
    grouped.get(story.user_id)!.stories.push({
      id: story.id,
      type: story.type,
      media_url: story.media_url,
      created_at: story.created_at,
      expires_at: story.expires_at,
    })
  }

  res.json({ success: true, data: Array.from(grouped.values()) })
})

router.post('/', authMiddleware, (req: Request, res: Response): void => {
  const { type, media_url } = req.body
  const userId = req.user!.id

  if (!media_url) {
    res.status(400).json({ success: false, error: '媒体URL不能为空' })
    return
  }

  const id = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  db.prepare('INSERT INTO stories (id, user_id, type, media_url, expires_at) VALUES (?, ?, ?, ?, ?)').run(id, userId, type || 'image', media_url, expiresAt)

  const story = db.prepare(`
    SELECT s.*, u.username, u.avatar, u.is_verified
    FROM stories s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ?
  `).get(id)

  res.status(201).json({ success: true, data: story })
})

router.get('/:userId', (req: Request, res: Response): void => {
  const { userId } = req.params

  const stories = db.prepare(`
    SELECT s.*, u.username, u.avatar, u.is_verified
    FROM stories s
    JOIN users u ON s.user_id = u.id
    WHERE s.user_id = ? AND s.expires_at > datetime('now')
    ORDER BY s.created_at ASC
  `).all(userId) as any[]

  if (stories.length === 0) {
    res.json({ success: true, data: [] })
    return
  }

  const user = {
    id: userId,
    username: stories[0].username,
    avatar: stories[0].avatar,
    is_verified: stories[0].is_verified,
  }

  const storiesList = stories.map(s => ({
    id: s.id,
    type: s.type,
    media_url: s.media_url,
    created_at: s.created_at,
    expires_at: s.expires_at,
  }))

  res.json({ success: true, data: { user, stories: storiesList } })
})

export default router
