import { describe, it, expect } from 'vitest'

const BASE_URL = process.env.PUSHFLO_BASE_URL || 'http://localhost:3001'
const PUBLISH_KEY = process.env.PUSHFLO_PUBLISH_KEY || 'pub_test_key'
const SECRET_KEY = process.env.PUSHFLO_SECRET_KEY || 'sec_test_key'

describe('Hello World Example', () => {
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
        clientId: 'hello-world-test',
      }),
    })

    expect(response.ok).toBe(true)

    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data.token).toBeTruthy()
  })

  it('publishes hello message', async () => {
    const response = await fetch(`${BASE_URL}/api/v1/channels/hello/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SECRET_KEY}`,
      },
      body: JSON.stringify({
        eventType: 'hello',
        clientId: 'test-publisher',
        content: {
          greeting: 'Hello, World!',
          count: 1,
          timestamp: new Date().toISOString(),
        },
      }),
    })

    expect(response.ok).toBe(true)

    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data.id).toBeTruthy()
  })
})
