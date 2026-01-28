/**
 * PushFlo Hello World - Publisher
 *
 * This script publishes messages to the 'hello' channel every 3 seconds.
 * Run this alongside the subscriber (index.html) to see real-time messaging.
 */

import 'dotenv/config'
import { PushFloServer } from '@pushflodev/sdk/server'

// Check for required environment variables
const secretKey = process.env.PUSHFLO_SECRET_KEY

if (!secretKey) {
  console.error('Error: PUSHFLO_SECRET_KEY is required')
  console.error('Get your key at https://console.pushflo.dev/credentials')
  process.exit(1)
}

// Initialize PushFlo server client
const pushflo = new PushFloServer({
  secretKey,
  baseUrl: process.env.PUSHFLO_BASE_URL,
})

const CHANNEL = 'hello'
let messageCount = 0

console.log('PushFlo Hello World Publisher')
console.log('==============================')
console.log(`Channel: ${CHANNEL}`)
console.log('')
console.log('Publishing messages every 3 seconds...')
console.log('Press Ctrl+C to stop')
console.log('')

// Publish a message every 3 seconds
async function publishMessage() {
  messageCount++

  const content = {
    greeting: 'Hello, World!',
    count: messageCount,
    timestamp: new Date().toISOString(),
  }

  try {
    const result = await pushflo.publish(CHANNEL, content, {
      eventType: 'hello',
    })

    console.log(`[${messageCount}] Published: "Hello, World!" (delivered to ${result.delivered} clients)`)
  } catch (error) {
    console.error(`[${messageCount}] Error:`, error.message)
  }
}

// Start publishing
publishMessage()
setInterval(publishMessage, 3000)
