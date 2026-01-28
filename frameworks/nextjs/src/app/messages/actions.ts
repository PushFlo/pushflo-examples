'use server'

import { publishMessage } from '@/lib/pushflo-server'

/**
 * Server Action to publish a message to PushFlo
 * This runs on the server with access to the secret key
 */
export async function publishMessageAction(
  channel: string,
  contentJson: string,
  eventType: string
): Promise<{ id: string; delivered: number }> {
  // Validate channel
  if (!channel || typeof channel !== 'string') {
    throw new Error('Channel is required')
  }

  // Parse and validate content
  let content: Record<string, unknown>
  try {
    content = JSON.parse(contentJson)
  } catch {
    throw new Error('Invalid JSON content')
  }

  // Publish the message
  const result = await publishMessage(channel, content, eventType || 'message')

  return result
}
