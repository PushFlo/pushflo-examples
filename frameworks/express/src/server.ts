/**
 * PushFlo Express.js Example
 *
 * A REST API backend that demonstrates:
 * - Publishing messages to PushFlo channels
 * - Managing channels via the API
 * - Input validation with Zod
 */

import 'dotenv/config'
import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import { z } from 'zod'
import { PushFloServer } from '@pushflo/sdk/server'

// Validate environment
const secretKey = process.env.PUSHFLO_SECRET_KEY
const publishKey = process.env.PUSHFLO_PUBLISH_KEY

if (!secretKey) {
  console.error('PUSHFLO_SECRET_KEY environment variable is required')
  console.error('Get your key at https://console.pushflo.dev/credentials')
  process.exit(1)
}

// Initialize PushFlo client
const pushflo = new PushFloServer({
  secretKey,
  publishKey: publishKey || '',
  baseUrl: process.env.PUSHFLO_BASE_URL,
})

// Create Express app
const app = express()
app.use(cors())
app.use(express.json())

// Request validation schemas
const publishMessageSchema = z.object({
  content: z.record(z.unknown()),
  eventType: z.string().optional().default('message'),
  clientId: z.string().optional().default('express-server'),
})

const createChannelSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
  isPrivate: z.boolean().optional().default(false),
})

// Error handling middleware
function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// Routes

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

/**
 * GET /channels
 * List all channels
 */
app.get(
  '/channels',
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await pushflo.listChannels()
    res.json({
      success: true,
      data: result.channels,
      pagination: result.pagination,
    })
  })
)

/**
 * POST /channels
 * Create a new channel
 */
app.post(
  '/channels',
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = createChannelSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: parsed.error.errors[0]?.message || 'Invalid input',
      })
    }

    const channel = await pushflo.createChannel(parsed.data)
    res.status(201).json({ success: true, data: channel })
  })
)

/**
 * GET /channels/:slug
 * Get channel details
 */
app.get(
  '/channels/:slug',
  asyncHandler(async (req: Request, res: Response) => {
    const channel = await pushflo.getChannel(req.params.slug)
    res.json({ success: true, data: channel })
  })
)

/**
 * DELETE /channels/:slug
 * Delete a channel
 */
app.delete(
  '/channels/:slug',
  asyncHandler(async (req: Request, res: Response) => {
    await pushflo.deleteChannel(req.params.slug)
    res.status(204).send()
  })
)

/**
 * POST /channels/:slug/messages
 * Publish a message to a channel
 */
app.post(
  '/channels/:slug/messages',
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = publishMessageSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: parsed.error.errors[0]?.message || 'Invalid input',
      })
    }

    const { content, eventType, clientId } = parsed.data

    const result = await pushflo.publish(req.params.slug, content, {
      eventType,
      clientId,
    })

    res.status(201).json({
      success: true,
      data: {
        id: result.id,
        channelSlug: req.params.slug,
        eventType,
        delivered: result.delivered,
        createdAt: new Date().toISOString(),
      },
    })
  })
)

/**
 * GET /channels/:slug/messages
 * Get message history for a channel
 */
app.get(
  '/channels/:slug/messages',
  asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1
    const pageSize = Math.min(parseInt(req.query.pageSize as string) || 50, 100)

    const result = await pushflo.getMessageHistory(req.params.slug, {
      page,
      pageSize,
    })

    res.json({
      success: true,
      data: result.messages,
      pagination: result.pagination,
    })
  })
)

// Error handling
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err.message)

  // Handle PushFlo errors
  if (err.message.includes('not found')) {
    return res.status(404).json({ success: false, error: err.message })
  }

  res.status(500).json({ success: false, error: 'Internal server error' })
})

// Start server
const PORT = parseInt(process.env.PORT || '3000')

app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`)
  console.log('')
  console.log('Endpoints:')
  console.log('  GET  /health                     - Health check')
  console.log('  GET  /channels                   - List channels')
  console.log('  POST /channels                   - Create channel')
  console.log('  GET  /channels/:slug             - Get channel')
  console.log('  DELETE /channels/:slug           - Delete channel')
  console.log('  POST /channels/:slug/messages    - Publish message')
  console.log('  GET  /channels/:slug/messages    - Get message history')
})

export default app
