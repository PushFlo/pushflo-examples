/**
 * PushFlo Express.js Example
 *
 * A REST API backend that demonstrates:
 * - Publishing messages to PushFlo channels
 * - Fetching message history
 * - Input validation with Zod
 */

import 'dotenv/config'
import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import { z } from 'zod'
import { PushFloServer } from '@pushflodev/sdk/server'

// Validate environment
const secretKey = process.env.PUSHFLO_SECRET_KEY

if (!secretKey) {
  console.error('PUSHFLO_SECRET_KEY environment variable is required')
  console.error('Get your key at https://console.pushflo.dev/credentials')
  process.exit(1)
}

// Initialize PushFlo client
const pushflo = new PushFloServer({
  secretKey,
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
})

const channelSlugSchema = z.string().min(1).max(50).regex(/^[a-z0-9-]+$/, {
  message: 'Channel slug must be lowercase alphanumeric with hyphens only',
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
 * POST /channels/:slug/messages
 * Publish a message to a channel
 */
app.post(
  '/channels/:slug/messages',
  asyncHandler(async (req: Request, res: Response) => {
    // Validate channel slug
    const slugResult = channelSlugSchema.safeParse(req.params.slug)
    if (!slugResult.success) {
      return res.status(400).json({
        success: false,
        error: slugResult.error.errors[0]?.message || 'Invalid channel slug',
      })
    }

    // Validate request body
    const bodyResult = publishMessageSchema.safeParse(req.body)
    if (!bodyResult.success) {
      return res.status(400).json({
        success: false,
        error: bodyResult.error.errors[0]?.message || 'Invalid input',
      })
    }

    const { content, eventType } = bodyResult.data

    const result = await pushflo.publish(req.params.slug, content, {
      eventType,
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
    // Validate channel slug
    const slugResult = channelSlugSchema.safeParse(req.params.slug)
    if (!slugResult.success) {
      return res.status(400).json({
        success: false,
        error: slugResult.error.errors[0]?.message || 'Invalid channel slug',
      })
    }

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
  console.log('  POST /channels/:slug/messages    - Publish message')
  console.log('  GET  /channels/:slug/messages    - Get message history')
  console.log('')
  console.log('Example - publish a message:')
  console.log(`  curl -X POST http://localhost:${PORT}/channels/notifications/messages \\`)
  console.log('    -H "Content-Type: application/json" \\')
  console.log('    -d \'{"content": {"text": "Hello!"}, "eventType": "greeting"}\'')
})

export default app
