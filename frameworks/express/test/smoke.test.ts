import { describe, it, expect } from 'vitest'

const BASE_URL = process.env.PUSHFLO_BASE_URL || 'http://localhost:3001'
const SECRET_KEY = process.env.PUSHFLO_SECRET_KEY || 'sec_test_key'

describe('Express PushFlo Integration', () => {
  // Test mock server is reachable
  it('mock server health check', async () => {
    const response = await fetch(`${BASE_URL}/health`)
    expect(response.ok).toBe(true)

    const data = await response.json()
    expect(data.status).toBe('ok')
  })

  // Test message publishing
  it('publishes a message', async () => {
    const response = await fetch(`${BASE_URL}/api/v1/channels/chat/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SECRET_KEY}`,
      },
      body: JSON.stringify({
        eventType: 'chat.message',
        clientId: 'express-test',
        content: {
          text: 'Hello from Express test!',
          timestamp: Date.now(),
        },
      }),
    })

    expect(response.ok).toBe(true)

    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data.id).toBeTruthy()
  })

  // Test message history
  it('retrieves message history', async () => {
    const response = await fetch(
      `${BASE_URL}/api/v1/channels/chat/messages?page=1&pageSize=10`,
      {
        headers: { Authorization: `Bearer ${SECRET_KEY}` },
      }
    )

    expect(response.ok).toBe(true)

    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data).toBeDefined()
  })
})
