import { NextRequest, NextResponse } from 'next/server'
import { publishMessage } from '@/lib/pushflo-server'

/**
 * API Route to publish a message to PushFlo
 * Alternative to Server Actions for non-React clients
 *
 * POST /api/publish
 * Body: { channel: string, content: object, eventType?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { channel, content, eventType } = body

    // Validate input
    if (!channel || typeof channel !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Channel is required' },
        { status: 400 }
      )
    }

    if (!content || typeof content !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Content must be a JSON object' },
        { status: 400 }
      )
    }

    // Publish the message
    const result = await publishMessage(channel, content, eventType || 'message')

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Publish error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to publish message',
      },
      { status: 500 }
    )
  }
}
