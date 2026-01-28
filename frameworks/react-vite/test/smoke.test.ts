import { describe, it, expect } from 'vitest'

const BASE_URL = process.env.VITE_PUSHFLO_BASE_URL || 'http://localhost:3001'
const PUBLISH_KEY = process.env.VITE_PUSHFLO_PUBLISH_KEY || 'pub_test_key'

describe('React Vite PushFlo Integration', () => {
  // Test mock server is reachable
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
        clientId: 'react-vite-test',
      }),
    })

    expect(response.ok).toBe(true)

    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data.token).toBeTruthy()
    expect(data.data.endpoint).toBeTruthy()
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

  // Test channel retrieval
  it('gets channel details', async () => {
    const response = await fetch(`${BASE_URL}/api/v1/channels/notifications`, {
      headers: { Authorization: `Bearer ${PUBLISH_KEY}` },
    })

    expect(response.ok).toBe(true)

    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data.slug).toBe('notifications')
  })
})
