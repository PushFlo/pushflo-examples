/**
 * PushFlo Presence Tracking - Server
 *
 * This script simulates users joining and leaving a channel,
 * publishing presence events that browsers can subscribe to.
 * Run this alongside the subscriber (index.html) to see real-time presence.
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

const CHANNEL = 'presence:lobby'

// Simulated users
const SIMULATED_USERS = [
  { id: 'user_1', name: 'Alice', avatar: 'A' },
  { id: 'user_2', name: 'Bob', avatar: 'B' },
  { id: 'user_3', name: 'Charlie', avatar: 'C' },
  { id: 'user_4', name: 'Diana', avatar: 'D' },
  { id: 'user_5', name: 'Eve', avatar: 'E' },
]

// Track online users
const onlineUsers = new Map()

console.log('PushFlo Presence Tracking Server')
console.log('=================================')
console.log(`Channel: ${CHANNEL}`)
console.log('')
console.log('Simulating users joining and leaving...')
console.log('Press Ctrl+C to stop')
console.log('')

/**
 * Publish a user join event
 */
async function userJoin(user) {
  if (onlineUsers.has(user.id)) {
    return // Already online
  }

  onlineUsers.set(user.id, {
    ...user,
    joinedAt: new Date().toISOString(),
  })

  try {
    const result = await pushflo.publish(CHANNEL, {
      userId: user.id,
      userName: user.name,
      avatar: user.avatar,
      onlineUsers: Array.from(onlineUsers.values()),
    }, {
      eventType: 'user:join',
    })

    console.log(`[JOIN] ${user.name} joined (${onlineUsers.size} online, delivered to ${result.delivered} clients)`)
  } catch (error) {
    console.error(`[ERROR] Failed to publish join event:`, error.message)
  }
}

/**
 * Publish a user leave event
 */
async function userLeave(user) {
  if (!onlineUsers.has(user.id)) {
    return // Not online
  }

  onlineUsers.delete(user.id)

  try {
    const result = await pushflo.publish(CHANNEL, {
      userId: user.id,
      userName: user.name,
      onlineUsers: Array.from(onlineUsers.values()),
    }, {
      eventType: 'user:leave',
    })

    console.log(`[LEAVE] ${user.name} left (${onlineUsers.size} online, delivered to ${result.delivered} clients)`)
  } catch (error) {
    console.error(`[ERROR] Failed to publish leave event:`, error.message)
  }
}

/**
 * Publish current presence state (for new subscribers)
 */
async function publishPresenceState() {
  try {
    const result = await pushflo.publish(CHANNEL, {
      onlineUsers: Array.from(onlineUsers.values()),
    }, {
      eventType: 'presence:state',
    })

    console.log(`[STATE] Published presence state (${onlineUsers.size} online, delivered to ${result.delivered} clients)`)
  } catch (error) {
    console.error(`[ERROR] Failed to publish state:`, error.message)
  }
}

/**
 * Simulate random user activity
 */
function simulateActivity() {
  const randomUser = SIMULATED_USERS[Math.floor(Math.random() * SIMULATED_USERS.length)]

  if (onlineUsers.has(randomUser.id)) {
    // 30% chance to leave if online
    if (Math.random() < 0.3) {
      userLeave(randomUser)
    }
  } else {
    // 70% chance to join if offline
    if (Math.random() < 0.7) {
      userJoin(randomUser)
    }
  }
}

// Start with some users online
async function initialize() {
  // Add first 2 users
  await userJoin(SIMULATED_USERS[0])
  await userJoin(SIMULATED_USERS[1])

  // Publish initial state
  await publishPresenceState()

  // Simulate activity every 4 seconds
  setInterval(simulateActivity, 4000)

  // Publish full state every 30 seconds (for late joiners)
  setInterval(publishPresenceState, 30000)
}

initialize()
