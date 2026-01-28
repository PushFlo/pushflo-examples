import { describe, it, expect, beforeAll, afterAll } from 'vitest'

const BASE_URL = process.env.PUSHFLO_BASE_URL || 'http://localhost:3001'
const PUBLISH_KEY = process.env.PUSHFLO_PUBLISH_KEY || 'pub_test_key'
const SECRET_KEY = process.env.PUSHFLO_SECRET_KEY || 'sec_test_key'

describe('Next.js PushFlo Integration', () => {
  // Test that the mock server is reachable
  it('mock server health check', async () => {
    const response = await fetch(`${BASE_URL}/health`)
    expect(response.ok).toBe(true)

    const data = await response.json()
    expect(data.status).toBe('ok')
  })

  // Test token generation
  it('generates connection token', async () => {
    const response = await fetch(`${BASE_URL}/api/v1/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        publishKey: PUBLISH_KEY,
        clientId: 'test-client',
      }),
    })

    expect(response.ok).toBe(true)

    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data.token).toBeTruthy()
    expect(data.data.clientId).toBe('test-client')
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

  // Test message publishing
  it('publishes a message', async () => {
    const response = await fetch(`${BASE_URL}/api/v1/channels/notifications/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SECRET_KEY}`,
      },
      body: JSON.stringify({
        eventType: 'test',
        clientId: 'test-client',
        content: { message: 'Hello from test!' },
      }),
    })

    expect(response.ok).toBe(true)

    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data.id).toBeTruthy()
    expect(data.data.channelSlug).toBe('notifications')
  })

  // Test message history
  it('retrieves message history', async () => {
    const response = await fetch(`${BASE_URL}/api/v1/channels/notifications/messages`, {
      headers: { Authorization: `Bearer ${PUBLISH_KEY}` },
    })

    expect(response.ok).toBe(true)

    const data = await response.json()
    expect(data.success).toBe(true)
    expect(Array.isArray(data.data)).toBe(true)
  })

  // Test publish key cannot publish (403)
  it('publish key cannot publish messages', async () => {
    const response = await fetch(`${BASE_URL}/api/v1/channels/notifications/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PUBLISH_KEY}`,
      },
      body: JSON.stringify({
        eventType: 'test',
        clientId: 'test-client',
        content: { message: 'Should fail' },
      }),
    })

    expect(response.status).toBe(403)
  })
})
