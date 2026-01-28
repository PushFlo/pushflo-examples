/**
 * PushFlo Message History - Server
 *
 * This script demonstrates:
 * 1. Publishing messages to build up history
 * 2. Fetching paginated message history using getMessageHistory()
 *
 * Run this to populate the channel with messages, then view history in index.html.
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

const CHANNEL = 'history-demo'

console.log('PushFlo Message History Demo')
console.log('============================')
console.log(`Channel: ${CHANNEL}`)
console.log('')

// Publish sample messages
async function publishSampleMessages(count = 5) {
  console.log(`Publishing ${count} sample messages...`)
  console.log('')

  for (let i = 1; i <= count; i++) {
    const content = {
      text: `Message #${i}`,
      author: 'demo-server',
      timestamp: new Date().toISOString(),
    }

    try {
      const result = await pushflo.publish(CHANNEL, content, {
        eventType: 'chat',
      })

      console.log(`[${i}/${count}] Published: "${content.text}" (id: ${result.id})`)

      // Small delay between messages
      if (i < count) {
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    } catch (error) {
      console.error(`[${i}/${count}] Error:`, error.message)
    }
  }

  console.log('')
}

// Fetch and display message history
async function fetchMessageHistory() {
  console.log('Fetching message history...')
  console.log('')

  try {
    // Fetch first page of messages
    const { messages, pagination } = await pushflo.getMessageHistory(CHANNEL, {
      pageSize: 10,
      page: 1,
    })

    console.log(`Found ${pagination.total} total messages`)
    console.log(`Showing page ${pagination.page} of ${pagination.totalPages}`)
    console.log('')

    if (messages.length === 0) {
      console.log('No messages found. Publishing some sample messages first...')
      await publishSampleMessages(10)
      return fetchMessageHistory()
    }

    console.log('Recent messages (newest first):')
    console.log('--------------------------------')

    for (const msg of messages) {
      const time = new Date(msg.timestamp).toLocaleTimeString()
      console.log(`[${time}] ${msg.content.text || JSON.stringify(msg.content)}`)
    }

    console.log('')

    // Demonstrate pagination
    if (pagination.totalPages > 1) {
      console.log('Fetching page 2...')
      const page2 = await pushflo.getMessageHistory(CHANNEL, {
        pageSize: 10,
        page: 2,
      })

      console.log(`Page 2 has ${page2.messages.length} messages`)
    }

    return { messages, pagination }
  } catch (error) {
    console.error('Error fetching history:', error.message)
    throw error
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2)

  if (args.includes('--publish')) {
    // Just publish messages
    const count = parseInt(args[args.indexOf('--publish') + 1]) || 5
    await publishSampleMessages(count)
  } else if (args.includes('--fetch')) {
    // Just fetch history
    await fetchMessageHistory()
  } else {
    // Default: publish a few messages then fetch history
    await publishSampleMessages(3)
    console.log('')
    await fetchMessageHistory()
  }

  console.log('')
  console.log('Done! Open index.html in a browser to see the interactive demo.')
}

main().catch(console.error)
