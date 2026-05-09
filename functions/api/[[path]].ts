import type { PagesFunction } from '@cloudflare/workers-types'

// 简单的内存存储（实际应该用 D1 数据库）
const users = new Map()
const posts = new Map()
const messages = new Map()

export const onRequest: PagesFunction = async (context) => {
  const { request } = context
  const url = new URL(request.url)
  const path = url.pathname

  // CORS 头
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers })
  }

  // 健康检查
  if (path === '/api/health') {
    return new Response(JSON.stringify({ success: true, message: 'ok' }), { headers })
  }

  // 登录
  if (path === '/api/auth/login' && request.method === 'POST') {
    const body = await request.json()
    const { username, password } = body as any
    
    // 简单验证
    if (username === 'alice_wang' && password === '123456') {
      return new Response(JSON.stringify({
        success: true,
        token: 'mock-token-' + Date.now(),
        user: { id: '1', username: 'alice_wang', avatar: 'https://picsum.photos/seed/alice/200/200' }
      }), { headers })
    }
    
    return new Response(JSON.stringify({ success: false, error: '用户名或密码错误' }), { 
      headers,
      status: 401 
    })
  }

  // 获取帖子列表
  if (path === '/api/posts' && request.method === 'GET') {
    const postsList = Array.from(posts.values())
    return new Response(JSON.stringify({ success: true, posts: postsList }), { headers })
  }

  // 创建帖子
  if (path === '/api/posts' && request.method === 'POST') {
    const body = await request.json()
    const post = {
      id: Date.now().toString(),
      ...(body as any),
      created_at: new Date().toISOString()
    }
    posts.set(post.id, post)
    return new Response(JSON.stringify({ success: true, post }), { headers })
  }

  // 获取消息
  if (path === '/api/chats' && request.method === 'GET') {
    const chatsList = Array.from(messages.values())
    return new Response(JSON.stringify({ success: true, chats: chatsList }), { headers })
  }

  // 默认响应
  return new Response(JSON.stringify({ success: false, error: 'API not found' }), { 
    headers,
    status: 404 
  })
}
