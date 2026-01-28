import { describe, it, expect } from 'vitest'

const BASE_URL = process.env.PUSHFLO_BASE_URL || 'http://localhost:3001'
const PUBLISH_KEY = process.env.PUSHFLO_PUBLISH_KEY || 'pub_test_key'
const SECRET_KEY = process.env.PUSHFLO_SECRET_KEY || 'sec_test_key'

describe('Chat App Example', () => {
  it('mock server health check', async () => {
    const response = await fetch(`${BASE_URL}/health`)
    expect(response.ok).toBe(true)
  })

  it('generates token for subscriber', async () => {
    const response = await fetch(`${BASE_URL}/api/v1/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        publishKey: PUBLISH_KEY,
        clientId: 'chat-test',
      }),
    })

    expect(response.ok).toBe(true)

    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data.token).toBeTruthy()
  })

  it('publishes chat message', async () => {
    const response = await fetch(`${BASE_URL}/api/v1/channels/chat:general/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SECRET_KEY}`,
      },
      body: JSON.stringify({
        eventType: 'chat.message',
        clientId: 'test-server',
        content: {
          nickname: 'TestUser',
          text: 'Hello, World!',
          timestamp: new Date().toISOString(),
        },
      }),
    })

    expect(response.ok).toBe(true)

    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data.id).toBeTruthy()
  })

  it('publishes user joined event', async () => {
    const response = await fetch(`${BASE_URL}/api/v1/channels/chat:general/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SECRET_KEY}`,
      },
      body: JSON.stringify({
        eventType: 'user.joined',
        clientId: 'test-server',
        content: {
          nickname: 'NewUser',
          timestamp: new Date().toISOString(),
        },
      }),
    })

    expect(response.ok).toBe(true)

    const data = await response.json()
    expect(data.success).toBe(true)
  })

  it('publishes user left event', async () => {
    const response = await fetch(`${BASE_URL}/api/v1/channels/chat:general/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SECRET_KEY}`,
      },
      body: JSON.stringify({
        eventType: 'user.left',
        clientId: 'test-server',
        content: {
          nickname: 'LeavingUser',
          timestamp: new Date().toISOString(),
        },
      }),
    })

    expect(response.ok).toBe(true)

    const data = await response.json()
    expect(data.success).toBe(true)
  })
})
