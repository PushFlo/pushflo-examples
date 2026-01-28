/**
 * Mock PushFlo Server
 * Implements the PushFlo API for CI testing
 */

import express, { Request, Response, NextFunction } from 'express'
import { WebSocketServer, WebSocket } from 'ws'
import { createServer } from 'http'
import { v4 as uuidv4 } from 'uuid'

const app = express()
app.use(express.json())

// Enable CORS for all origins (testing purposes)
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (_req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})

// In-memory storage
interface Channel {
  id: string
  name: string
  slug: string
  description: string | null
  isPrivate: boolean
  metadata: Record<string, unknown> | null
  messageCount: number
  createdAt: string
  updatedAt: string
}

interface Message {
  id: string
  channelSlug: string
  eventType: string
  clientId: string
  content: Record<string, unknown>
  createdAt: string
}

interface ConnectedClient {
  ws: WebSocket
  clientId: string
  channels: Set<string>
}

const channels: Map<string, Channel> = new Map()
const messages: Map<string, Message[]> = new Map() // channelSlug -> messages
const connectedClients: Map<WebSocket, ConnectedClient> = new Map()

// Seed some default data
channels.set('notifications', {
  id: uuidv4(),
  name: 'Notifications',
  slug: 'notifications',
  description: 'User notifications channel',
  isPrivate: false,
  metadata: null,
  messageCount: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

channels.set('chat', {
  id: uuidv4(),
  name: 'Chat',
  slug: 'chat',
  description: 'General chat channel',
  isPrivate: false,
  metadata: null,
  messageCount: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

// Helper functions
function success<T>(data: T, status = 200) {
  return { status, body: { success: true, data } }
}

function error(message: string, status = 400) {
  return { status, body: { success: false, error: message } }
}

function paginate<T>(items: T[], page = 1, pageSize = 25) {
  const total = items.length
  const totalPages = Math.ceil(total / pageSize)
  const start = (page - 1) * pageSize
  const data = items.slice(start, start + pageSize)

  return {
    data,
    pagination: { page, pageSize, total, totalPages },
  }
}

// Auth middleware (accepts any key starting with pub_, sec_, or mgmt_)
function authenticate(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization
  if (!auth) {
    const result = error('Missing authorization header', 401)
    return res.status(result.status).json(result.body)
  }

  const [type, token] = auth.split(' ')
  if (type !== 'Bearer' || !token) {
    const result = error('Invalid authorization format', 401)
    return res.status(result.status).json(result.body)
  }

  // Accept test keys or any properly formatted key
  if (
    !token.startsWith('pub_') &&
    !token.startsWith('sec_') &&
    !token.startsWith('mgmt_')
  ) {
    const result = error('Invalid API key format', 401)
    return res.status(result.status).json(result.body)
  }

  next()
}

// Require write access (sec_ or mgmt_ keys)
function requireWriteAccess(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization
  const token = auth?.split(' ')[1] || ''

  if (token.startsWith('pub_')) {
    const result = error('Publish key does not have write access', 403)
    return res.status(result.status).json(result.body)
  }

  next()
}

// Routes

// POST /api/v1/auth/token - Generate connection token
app.post('/api/v1/auth/token', (req: Request, res: Response) => {
  const { publishKey, clientId } = req.body

  if (!publishKey) {
    const result = error('publishKey is required')
    return res.status(result.status).json(result.body)
  }

  const token = `mock_token_${uuidv4()}`
  const assignedClientId = clientId || `client_${uuidv4().slice(0, 8)}`

  const result = success({
    token,
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
    endpoint: `ws://localhost:${PORT}/ws`,
    clientId: assignedClientId,
  })

  res.status(result.status).json(result.body)
})

// GET /api/v1/channels - List channels
app.get('/api/v1/channels', authenticate, (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1
  const pageSize = Math.min(parseInt(req.query.pageSize as string) || 25, 100)

  const channelList = Array.from(channels.values())
  const { data, pagination } = paginate(channelList, page, pageSize)

  res.json({ success: true, data, pagination })
})

// POST /api/v1/channels - Create channel
app.post(
  '/api/v1/channels',
  authenticate,
  requireWriteAccess,
  (req: Request, res: Response) => {
    const { name, slug, description, isPrivate, metadata } = req.body

    if (!name || !slug) {
      const result = error('name and slug are required')
      return res.status(result.status).json(result.body)
    }

    if (channels.has(slug)) {
      const result = error('Channel with this slug already exists', 409)
      return res.status(result.status).json(result.body)
    }

    const channel: Channel = {
      id: uuidv4(),
      name,
      slug,
      description: description || null,
      isPrivate: isPrivate || false,
      metadata: metadata || null,
      messageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    channels.set(slug, channel)
    messages.set(slug, [])

    const result = success(channel, 201)
    res.status(result.status).json(result.body)
  }
)

// GET /api/v1/channels/:slug - Get channel
app.get('/api/v1/channels/:slug', authenticate, (req: Request, res: Response) => {
  const channel = channels.get(req.params.slug)

  if (!channel) {
    const result = error('Channel not found', 404)
    return res.status(result.status).json(result.body)
  }

  const result = success(channel)
  res.status(result.status).json(result.body)
})

// PATCH /api/v1/channels/:slug - Update channel
app.patch(
  '/api/v1/channels/:slug',
  authenticate,
  requireWriteAccess,
  (req: Request, res: Response) => {
    const channel = channels.get(req.params.slug)

    if (!channel) {
      const result = error('Channel not found', 404)
      return res.status(result.status).json(result.body)
    }

    const { name, description, isPrivate, metadata } = req.body

    if (name !== undefined) channel.name = name
    if (description !== undefined) channel.description = description
    if (isPrivate !== undefined) channel.isPrivate = isPrivate
    if (metadata !== undefined) channel.metadata = metadata
    channel.updatedAt = new Date().toISOString()

    const result = success(channel)
    res.status(result.status).json(result.body)
  }
)

// DELETE /api/v1/channels/:slug - Delete channel
app.delete(
  '/api/v1/channels/:slug',
  authenticate,
  requireWriteAccess,
  (req: Request, res: Response) => {
    const channel = channels.get(req.params.slug)

    if (!channel) {
      const result = error('Channel not found', 404)
      return res.status(result.status).json(result.body)
    }

    channels.delete(req.params.slug)
    messages.delete(req.params.slug)

    res.status(204).send()
  }
)

// GET /api/v1/channels/:slug/messages - Get message history
app.get(
  '/api/v1/channels/:slug/messages',
  authenticate,
  (req: Request, res: Response) => {
    const channel = channels.get(req.params.slug)

    if (!channel) {
      const result = error('Channel not found', 404)
      return res.status(result.status).json(result.body)
    }

    const page = parseInt(req.query.page as string) || 1
    const pageSize = Math.min(parseInt(req.query.pageSize as string) || 50, 100)

    const channelMessages = messages.get(req.params.slug) || []
    const { data, pagination } = paginate(
      [...channelMessages].reverse(),
      page,
      pageSize
    )

    res.json({ success: true, data, pagination })
  }
)

// POST /api/v1/channels/:slug/messages - Publish message
app.post(
  '/api/v1/channels/:slug/messages',
  authenticate,
  requireWriteAccess,
  (req: Request, res: Response) => {
    const channel = channels.get(req.params.slug)

    if (!channel) {
      const result = error('Channel not found', 404)
      return res.status(result.status).json(result.body)
    }

    const { eventType, clientId, content } = req.body

    if (!clientId || !content) {
      const result = error('clientId and content are required')
      return res.status(result.status).json(result.body)
    }

    const message: Message = {
      id: `msg_${uuidv4().slice(0, 12)}`,
      channelSlug: req.params.slug,
      eventType: eventType || 'message',
      clientId,
      content,
      createdAt: new Date().toISOString(),
    }

    // Store message
    if (!messages.has(req.params.slug)) {
      messages.set(req.params.slug, [])
    }
    messages.get(req.params.slug)!.push(message)
    channel.messageCount++

    // Broadcast to WebSocket clients
    let delivered = 0
    for (const [, client] of connectedClients) {
      if (client.channels.has(req.params.slug)) {
        client.ws.send(
          JSON.stringify({
            type: 'message',
            channel: req.params.slug,
            eventType: message.eventType,
            messageId: message.id,
            clientId: message.clientId,
            data: message.content,
            timestamp: Date.parse(message.createdAt),
          })
        )
        delivered++
      }
    }

    const result = success(
      {
        id: message.id,
        channelSlug: message.channelSlug,
        eventType: message.eventType,
        clientId: message.clientId,
        createdAt: message.createdAt,
        delivered,
      },
      201
    )

    res.status(result.status).json(result.body)
  }
)

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Create HTTP server
const server = createServer(app)

// WebSocket server
const wss = new WebSocketServer({ server, path: '/ws' })

wss.on('connection', (ws: WebSocket, req) => {
  // Extract token from query string
  const url = new URL(req.url || '', `http://localhost`)
  const token = url.searchParams.get('token')

  if (!token || !token.startsWith('mock_token_')) {
    ws.close(4001, 'Invalid token')
    return
  }

  const clientId = `client_${uuidv4().slice(0, 8)}`
  const client: ConnectedClient = {
    ws,
    clientId,
    channels: new Set(),
  }

  connectedClients.set(ws, client)

  // Send connected message
  ws.send(JSON.stringify({ type: 'connected', clientId }))

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString())

      switch (msg.type) {
        case 'subscribe': {
          if (msg.channel && channels.has(msg.channel)) {
            client.channels.add(msg.channel)
            ws.send(JSON.stringify({ type: 'subscribed', channel: msg.channel }))
          } else if (msg.channel) {
            // Auto-create channel for testing
            const newChannel: Channel = {
              id: uuidv4(),
              name: msg.channel,
              slug: msg.channel,
              description: null,
              isPrivate: false,
              metadata: null,
              messageCount: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
            channels.set(msg.channel, newChannel)
            messages.set(msg.channel, [])
            client.channels.add(msg.channel)
            ws.send(JSON.stringify({ type: 'subscribed', channel: msg.channel }))
          }
          break
        }

        case 'unsubscribe': {
          if (msg.channel) {
            client.channels.delete(msg.channel)
            ws.send(JSON.stringify({ type: 'unsubscribed', channel: msg.channel }))
          }
          break
        }

        case 'ping': {
          ws.send(JSON.stringify({ type: 'pong' }))
          break
        }

        case 'ack': {
          // Receipt acknowledged - could store this for testing
          break
        }

        default:
          ws.send(JSON.stringify({ type: 'error', error: 'Unknown message type' }))
      }
    } catch (err) {
      ws.send(JSON.stringify({ type: 'error', error: 'Invalid message format' }))
    }
  })

  ws.on('close', () => {
    connectedClients.delete(ws)
  })
})

// Start server
const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
  console.log(`Mock PushFlo server running on http://localhost:${PORT}`)
  console.log(`WebSocket endpoint: ws://localhost:${PORT}/ws`)
  console.log('\nPre-configured channels:')
  console.log('  - notifications')
  console.log('  - chat')
  console.log('\nTest credentials:')
  console.log('  Publish key: pub_test_key')
  console.log('  Secret key:  sec_test_key')
})

export { app, server, wss }
