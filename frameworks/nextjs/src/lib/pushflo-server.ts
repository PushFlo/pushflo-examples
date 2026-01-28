/**
 * PushFlo Server Client
 * Server-side client for publishing messages
 */

import { PushFloServer } from '@pushflodev/sdk/server'

// Create a singleton instance for server-side use
let serverClient: PushFloServer | null = null

export function getPushFloServer(): PushFloServer {
  if (!serverClient) {
    const secretKey = process.env.PUSHFLO_SECRET_KEY
    const baseUrl = process.env.PUSHFLO_BASE_URL

    if (!secretKey) {
      throw new Error(
        'PUSHFLO_SECRET_KEY environment variable is required. Get your key at https://console.pushflo.dev/credentials'
      )
    }

    serverClient = new PushFloServer({
      secretKey,
      baseUrl,
    })
  }

  return serverClient
}

/**
 * Publish a message to a channel
 * This is a convenience wrapper for server actions
 */
export async function publishMessage(
  channel: string,
  content: Record<string, unknown>,
  eventType = 'message'
): Promise<{ id: string; delivered: number }> {
  const server = getPushFloServer()

  const result = await server.publish(channel, content, {
    eventType,
  })

  return {
    id: result.id,
    delivered: result.delivered,
  }
}
