import { describe, it, expect } from 'vitest'

const BASE_URL = process.env.PUSHFLO_BASE_URL || 'http://localhost:3001'
const PUBLISH_KEY = process.env.PUSHFLO_PUBLISH_KEY || 'pub_test_key'
const SECRET_KEY = process.env.PUSHFLO_SECRET_KEY || 'sec_test_key'

describe('Express PushFlo Integration', () => {
  // Test mock server is reachable
  it('mock server health check', async () => {
    const response = await fetch(`${BASE_URL}/health`)
    expect(response.ok).toBe(true)

    const data = await response.json()
    expect(data.status).toBe('ok')
  })

  // Test channel listing
  it('lists channels', async () => {
    const response = await fetch(`${BASE_URL}/api/v1/channels`, {
      headers: { Authorization: `Bearer ${PUBLISH_KEY}` },
    })

    expect(response.ok).toBe(true)

    const data = await response.json()
    expect(data.success).toBe(true)
    expect(Array.isArray(data.data)).toBe(true)
  })

  // Test channel creation
  it('creates a channel', async () => {
    const slug = `test-channel-${Date.now()}`

    const response = await fetch(`${BASE_URL}/api/v1/channels`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SECRET_KEY}`,
      },
      body: JSON.stringify({
        name: 'Test Channel',
        slug,
        description: 'A test channel',
      }),
    })

    expect(response.ok).toBe(true)

    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data.slug).toBe(slug)
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
    const response = await fetch(`${BASE_URL}/api/v1/channels/chat/messages`, {
      headers: { Authorization: `Bearer ${PUBLISH_KEY}` },
    })

    expect(response.ok).toBe(true)

    const data = await response.json()
    expect(data.success).toBe(true)
    expect(Array.isArray(data.data)).toBe(true)
  })
})
