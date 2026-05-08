import { Router, type Request, type Response } from 'express'
import crypto from 'crypto'
import db from '../database.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.get('/', authMiddleware, (req: Request, res: Response): void => {
  const userId = req.user!.id

  const chats = db.prepare(`
    SELECT c.*,
      (SELECT content FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
      (SELECT created_at FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_at,
      (SELECT COUNT(*) FROM messages WHERE chat_id = c.id AND is_read = 0 AND sender_id != ?) as unread_count,
      (SELECT COUNT(*) FROM chat_hide WHERE chat_id = c.id AND user_id = ?) as is_hidden
    FROM chats c
    JOIN chat_members cm ON c.id = cm.chat_id
    WHERE cm.user_id = ? AND NOT EXISTS (SELECT 1 FROM chat_hide WHERE chat_id = c.id AND user_id = ?)
    ORDER BY c.updated_at DESC
  `).all(userId, userId, userId, userId) as any[]

  const chatsWithMembers = chats.map(chat => {
    const members = db.prepare(`
      SELECT u.id, u.username, u.avatar, u.is_verified, cm.role
      FROM chat_members cm
      JOIN users u ON cm.user_id = u.id
      WHERE cm.chat_id = ?
    `).all(chat.id)

    return {
      ...chat,
      members,
    }
  })

  res.json({ success: true, data: chatsWithMembers })
})

router.post('/', authMiddleware, (req: Request, res: Response): void => {
  const { type, name, memberIds } = req.body
  const userId = req.user!.id

  if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
    res.status(400).json({ success: false, error: '至少需要一个成员' })
    return
  }

  const chatType = type || 'private'

  if (chatType === 'private') {
    const otherUserId = memberIds[0]
    const existingChat = db.prepare(`
      SELECT c.id FROM chats c
      JOIN chat_members cm1 ON c.id = cm1.chat_id AND cm1.user_id = ?
      JOIN chat_members cm2 ON c.id = cm2.chat_id AND cm2.user_id = ?
      WHERE c.type = 'private'
    `).get(userId, otherUserId) as any

    if (existingChat) {
      const chat = db.prepare('SELECT * FROM chats WHERE id = ?').get(existingChat.id) as any
      const members = db.prepare(`
        SELECT u.id, u.username, u.avatar, u.is_verified, cm.role
        FROM chat_members cm
        JOIN users u ON cm.user_id = u.id
        WHERE cm.chat_id = ?
      `).all(existingChat.id)

      res.json({ success: true, data: { ...chat, members } })
      return
    }
  }

  const chatId = crypto.randomUUID()
  db.prepare('INSERT INTO chats (id, type, name) VALUES (?, ?, ?)').run(chatId, chatType, name || null)

  const allMemberIds = [userId, ...memberIds.filter((id: string) => id !== userId)]
  const insertMember = db.prepare('INSERT INTO chat_members (id, chat_id, user_id, role) VALUES (?, ?, ?, ?)')

  const insertTransaction = db.transaction(() => {
    insertMember.run(crypto.randomUUID(), chatId, userId, 'admin')
    for (const memberId of memberIds.filter((id: string) => id !== userId)) {
      insertMember.run(crypto.randomUUID(), chatId, memberId, 'member')
    }
  })
  insertTransaction()

  const chat = db.prepare('SELECT * FROM chats WHERE id = ?').get(chatId) as any
  const members = db.prepare(`
    SELECT u.id, u.username, u.avatar, u.is_verified, cm.role
    FROM chat_members cm
    JOIN users u ON cm.user_id = u.id
    WHERE cm.chat_id = ?
  `).all(chatId)

  res.status(201).json({ success: true, data: { ...chat, members } })
})

router.get('/:chatId/messages', authMiddleware, (req: Request, res: Response): void => {
  const { chatId } = req.params
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 20
  const offset = (page - 1) * limit

  const isMember = db.prepare('SELECT id FROM chat_members WHERE chat_id = ? AND user_id = ?').get(chatId, req.user!.id)
  if (!isMember) {
    res.status(403).json({ success: false, error: '不是该聊天的成员' })
    return
  }

  const messages = db.prepare(`
    SELECT m.*, u.username, u.avatar
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.chat_id = ?
    ORDER BY m.created_at DESC
    LIMIT ? OFFSET ?
  `).all(chatId, limit, offset) as any[]

  const total = db.prepare('SELECT COUNT(*) as count FROM messages WHERE chat_id = ?').get(chatId) as { count: number }

  res.json({
    success: true,
    data: {
      messages: messages.reverse(),
      pagination: {
        page,
        limit,
        total: total.count,
        totalPages: Math.ceil(total.count / limit),
      },
    },
  })
})

router.post('/:chatId/messages', authMiddleware, (req: Request, res: Response): void => {
  const { chatId } = req.params
  const { type, content } = req.body
  const userId = req.user!.id

  if (!content) {
    res.status(400).json({ success: false, error: '消息内容不能为空' })
    return
  }

  const isMember = db.prepare('SELECT id FROM chat_members WHERE chat_id = ? AND user_id = ?').get(chatId, userId)
  if (!isMember) {
    res.status(403).json({ success: false, error: '不是该聊天的成员' })
    return
  }

  const id = crypto.randomUUID()
  db.prepare('INSERT INTO messages (id, chat_id, sender_id, type, content) VALUES (?, ?, ?, ?, ?)').run(id, chatId, userId, type || 'text', content)
  db.prepare("UPDATE chats SET updated_at = datetime('now') WHERE id = ?").run(chatId)

  const message = db.prepare(`
    SELECT m.*, u.username, u.avatar
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.id = ?
  `).get(id)

  res.status(201).json({ success: true, data: message })
})

router.post('/:chatId/read', authMiddleware, (req: Request, res: Response): void => {
  const { chatId } = req.params
  const userId = req.user!.id

  const isMember = db.prepare('SELECT id FROM chat_members WHERE chat_id = ? AND user_id = ?').get(chatId, userId)
  if (!isMember) {
    res.status(403).json({ success: false, error: '不是该聊天的成员' })
    return
  }

  db.prepare(`
    UPDATE messages
    SET is_read = 1
    WHERE chat_id = ? AND sender_id != ? AND is_read = 0
  `).run(chatId, userId)

  res.json({ success: true, data: { marked: true } })
})

router.delete('/:chatId/messages/:messageId', authMiddleware, (req: Request, res: Response): void => {
  const { chatId, messageId } = req.params
  const userId = req.user!.id

  const isMember = db.prepare('SELECT id FROM chat_members WHERE chat_id = ? AND user_id = ?').get(chatId, userId)
  if (!isMember) {
    res.status(403).json({ success: false, error: '不是该聊天的成员' })
    return
  }

  const message = db.prepare('SELECT id, sender_id FROM messages WHERE id = ? AND chat_id = ?').get(messageId, chatId) as any
  if (!message) {
    res.status(404).json({ success: false, error: '消息不存在' })
    return
  }

  if (message.sender_id !== userId) {
    res.status(403).json({ success: false, error: '无权删除此消息' })
    return
  }

  db.prepare('DELETE FROM messages WHERE id = ?').run(messageId)

  res.json({ success: true, data: { message: '删除成功' } })
})

router.post('/:chatId/hide', authMiddleware, (req: Request, res: Response): void => {
  const { chatId } = req.params
  const userId = req.user!.id

  const isMember = db.prepare('SELECT id FROM chat_members WHERE chat_id = ? AND user_id = ?').get(chatId, userId)
  if (!isMember) {
    res.status(403).json({ success: false, error: '不是该聊天的成员' })
    return
  }

  const existing = db.prepare('SELECT id FROM chat_hide WHERE chat_id = ? AND user_id = ?').get(chatId, userId)
  if (existing) {
    res.json({ success: true, data: { message: '已经隐藏了' } })
    return
  }

  db.prepare('INSERT INTO chat_hide (id, chat_id, user_id) VALUES (?, ?, ?)').run(crypto.randomUUID(), chatId, userId)

  res.json({ success: true, data: { message: '隐藏成功' } })
})

router.delete('/:chatId/hide', authMiddleware, (req: Request, res: Response): void => {
  const { chatId } = req.params
  const userId = req.user!.id

  const result = db.prepare('DELETE FROM chat_hide WHERE chat_id = ? AND user_id = ?').run(chatId, userId)
  if (result.changes === 0) {
    res.status(404).json({ success: false, error: '未隐藏此聊天' })
    return
  }

  res.json({ success: true, data: { message: '取消隐藏成功' } })
})

export default router
