import { describe, it, expect } from 'vitest'

const BASE_URL = process.env.PUSHFLO_BASE_URL || 'http://localhost:3001'
const PUBLISH_KEY = process.env.PUSHFLO_PUBLISH_KEY || 'pub_test_key'

describe('Vanilla JS Example', () => {
  it('mock server health check', async () => {
    const response = await fetch(`${BASE_URL}/health`)
    expect(response.ok).toBe(true)
  })

  it('generates token for browser connection', async () => {
    const response = await fetch(`${BASE_URL}/api/v1/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        publishKey: PUBLISH_KEY,
        clientId: 'vanilla-js-test',
      }),
    })

    expect(response.ok).toBe(true)

    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data.token).toBeTruthy()
    expect(data.data.endpoint).toBeTruthy()
    expect(data.data.clientId).toBe('vanilla-js-test')
  })

  it('lists available channels', async () => {
    const response = await fetch(`${BASE_URL}/api/v1/channels`, {
      headers: { Authorization: `Bearer ${PUBLISH_KEY}` },
    })

    expect(response.ok).toBe(true)

    const data = await response.json()
    expect(data.success).toBe(true)
    expect(Array.isArray(data.data)).toBe(true)
  })

  it('can get notifications channel', async () => {
    const response = await fetch(`${BASE_URL}/api/v1/channels/notifications`, {
      headers: { Authorization: `Bearer ${PUBLISH_KEY}` },
    })

    expect(response.ok).toBe(true)

    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data.slug).toBe('notifications')
  })
})
