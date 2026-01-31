/**
 * PushFlo Message History - Web UI Server
 *
 * Serves the frontend and provides:
 * - /api/token - for WebSocket connection
 * - /api/history - proxy for message history (keeps secret key server-side)
 */

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const publishKey = process.env.PUSHFLO_PUBLISH_KEY
const secretKey = process.env.PUSHFLO_SECRET_KEY
const baseUrl = process.env.PUSHFLO_BASE_URL || 'https://api.pushflo.dev'

if (!publishKey || !secretKey) {
  console.error('Error: PUSHFLO_PUBLISH_KEY and PUSHFLO_SECRET_KEY are required')
  console.error('Get your keys at https://console.pushflo.dev/credentials')
  process.exit(1)
}

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, '..')))

// Token endpoint - for WebSocket connection
app.post('/api/token', (req, res) => {
  res.json({
    success: true,
    data: {
      token: publishKey,
      endpoint: baseUrl,
      clientId: req.body.clientId || `client_${Date.now()}`,
    }
  })
})

// History endpoint - proxy to PushFlo API (keeps secret key server-side)
app.get('/api/history/:channel', async (req, res) => {
  try {
    const { channel } = req.params
    const { page = 1, pageSize = 10 } = req.query

    const url = `${baseUrl}/api/v1/channels/${encodeURIComponent(channel)}/messages?page=${page}&pageSize=${pageSize}`

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json(data)
    }

    res.json(data)
  } catch (error) {
    console.error('History fetch error:', error.message)
    res.status(500).json({ success: false, error: 'Failed to fetch history' })
  }
})

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
  console.log(`History demo running at http://localhost:${PORT}`)
  console.log('')
  console.log('To populate messages, run in another terminal:')
  console.log('  npm run publish')
})
