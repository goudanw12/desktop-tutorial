import { Router, type Request, type Response } from 'express'
import db from '../database.js'

const router = Router()

router.get('/', (req: Request, res: Response): void => {
  const { q, type } = req.query
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 20
  const offset = (page - 1) * limit

  if (!q || typeof q !== 'string') {
    res.status(400).json({ success: false, error: '请提供搜索关键词' })
    return
  }

  const keyword = `%${q}%`
  const results: any = { users: [], posts: [], tags: [] }

  if (!type || type === 'user') {
    results.users = db.prepare(`
      SELECT id, username, avatar, bio, is_verified
      FROM users
      WHERE username LIKE ? OR bio LIKE ?
      LIMIT ?
    `).all(keyword, keyword, limit) as any[]
  }

  if (!type || type === 'post') {
    results.posts = db.prepare(`
      SELECT p.id, p.content, p.images, p.tags, p.like_count, p.comment_count, p.created_at,
        u.username, u.avatar, u.is_verified
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.content LIKE ? AND p.visibility = 'public'
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `).all(keyword, limit, offset) as any[]

    results.posts = results.posts.map((post: any) => ({
      ...post,
      images: JSON.parse(post.images || '[]'),
      tags: JSON.parse(post.tags || '[]'),
    }))
  }

  if (!type || type === 'tag') {
    const allPosts = db.prepare(`
      SELECT p.id, p.content, p.tags, p.like_count, p.created_at
      FROM posts p
      WHERE p.visibility = 'public'
    `).all() as any[]

    const tagMap = new Map<string, number>()
    for (const post of allPosts) {
      const tags: string[] = JSON.parse(post.tags || '[]')
      for (const tag of tags) {
        if (tag.toLowerCase().includes(q.toString().toLowerCase())) {
          tagMap.set(tag, (tagMap.get(tag) || 0) + 1)
        }
      }
    }

    results.tags = Array.from(tagMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }

  res.json({ success: true, data: results })
})

router.get('/suggestions', (req: Request, res: Response): void => {
  const { q } = req.query

  if (!q || typeof q !== 'string') {
    const users = db.prepare(`
      SELECT id, username, avatar, bio, is_verified
      FROM users
      ORDER BY RANDOM()
      LIMIT 5
    `).all()

    res.json({ success: true, data: { users } })
    return
  }

  const keyword = `${q}%`

  const users = db.prepare(`
    SELECT id, username, avatar, bio, is_verified
    FROM users
    WHERE username LIKE ?
    LIMIT 5
  `).all(keyword)

  res.json({ success: true, data: { users } })
})

export default router
