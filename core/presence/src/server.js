/**
 * PushFlo Presence Tracking - Simulator
 *
 * Simulates users joining and leaving a channel.
 * Run "npm run serve" first to start the web UI.
 */

import 'dotenv/config'
import { PushFloServer } from '@pushflodev/sdk/server'

const secretKey = process.env.PUSHFLO_SECRET_KEY

if (!secretKey) {
  console.error('Error: PUSHFLO_SECRET_KEY is required')
  console.error('Get your key at https://console.pushflo.dev/credentials')
  process.exit(1)
}

const pushflo = new PushFloServer({
  secretKey,
  baseUrl: process.env.PUSHFLO_BASE_URL,
})

const CHANNEL = 'presence-lobby'

const SIMULATED_USERS = [
  { id: 'user_1', name: 'Alice', avatar: 'A' },
  { id: 'user_2', name: 'Bob', avatar: 'B' },
  { id: 'user_3', name: 'Charlie', avatar: 'C' },
  { id: 'user_4', name: 'Diana', avatar: 'D' },
  { id: 'user_5', name: 'Eve', avatar: 'E' },
]

const onlineUsers = new Map()

console.log('PushFlo Presence Simulator')
console.log('==========================')
console.log(`Channel: ${CHANNEL}`)
console.log('')
console.log('Simulating users joining and leaving...')
console.log('Press Ctrl+C to stop')
console.log('')

async function userJoin(user) {
  if (onlineUsers.has(user.id)) return

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

async function userLeave(user) {
  if (!onlineUsers.has(user.id)) return

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

function simulateActivity() {
  const randomUser = SIMULATED_USERS[Math.floor(Math.random() * SIMULATED_USERS.length)]

  if (onlineUsers.has(randomUser.id)) {
    if (Math.random() < 0.3) {
      userLeave(randomUser)
    }
  } else {
    if (Math.random() < 0.7) {
      userJoin(randomUser)
    }
  }
}

async function initialize() {
  await userJoin(SIMULATED_USERS[0])
  await userJoin(SIMULATED_USERS[1])
  await publishPresenceState()

  setInterval(simulateActivity, 4000)
  setInterval(publishPresenceState, 30000)
}

initialize()
