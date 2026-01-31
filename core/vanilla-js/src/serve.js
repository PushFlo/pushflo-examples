/**
 * PushFlo Vanilla JS - Web Server
 *
 * Serves the frontend and provides a token endpoint.
 */

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const publishKey = process.env.PUSHFLO_PUBLISH_KEY
const baseUrl = process.env.PUSHFLO_BASE_URL || 'https://api.pushflo.dev'

if (!publishKey) {
  console.error('Error: PUSHFLO_PUBLISH_KEY is required')
  console.error('Get your key at https://console.pushflo.dev/credentials')
  process.exit(1)
}

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, '..')))

// Token endpoint - returns connection info for WebSocket
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

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
  console.log(`Vanilla JS demo running at http://localhost:${PORT}`)
})
