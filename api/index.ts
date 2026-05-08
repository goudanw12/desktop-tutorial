import type { VercelRequest, VercelResponse } from '@vercel/node'
import app from './app.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return new Promise((resolve, reject) => {
    const mockReq = req as any
    const mockRes = res as any

    mockRes.on('finish', resolve)
    mockRes.on('error', reject)

    app(mockReq, mockRes)
  })
}
