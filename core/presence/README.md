# PushFlo Presence Tracking

Track online users in real-time using PushFlo. This example demonstrates presence tracking with a Node.js server that simulates users joining and leaving a channel, and a browser client that displays the online user list.

## What You'll Learn

- Publishing presence events (join/leave) from Node.js
- Subscribing to presence updates in the browser
- Tracking online users per channel
- Real-time UI updates when users connect/disconnect
- Periodic state synchronization for late joiners

## Prerequisites

- Node.js 18+
- PushFlo API keys from [console.pushflo.dev](https://console.pushflo.dev)

## Quick Start

```bash
# Clone this example
npx degit PushFlo/pushflo-examples/core/presence my-presence
cd my-presence

# Install dependencies
npm install

# Copy environment template
cp env.example .env

# Add your API keys to .env
# PUSHFLO_SECRET_KEY=sec_xxxxxxxxxxxxx
# PUSHFLO_PUBLISH_KEY=pub_xxxxxxxxxxxxx
```

### Terminal 1: Start the subscriber (browser)

```bash
# Serve the HTML file
npm run serve
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

**Important:** Edit `index.html` and replace `YOUR_PUBLISH_KEY_HERE` with your actual publish key.

### Terminal 2: Start the presence server

```bash
# Simulate user presence
npm start
```

Watch users join and leave in real-time in your browser!

## How It Works

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│   server.js     │─────►│   PushFlo       │◄────►│   index.html    │
│   (Node.js)     │ REST │   Edge Network  │  WS  │   (Browser)     │
│                 │      │                 │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

1. **Server** (`src/server.js`):
   - Uses the secret key to authenticate
   - Tracks online users in a Map
   - Publishes `user:join` events when users connect
   - Publishes `user:leave` events when users disconnect
   - Publishes `presence:state` periodically for new subscribers

2. **Subscriber** (`index.html`):
   - Gets a connection token using the publish key
   - Connects via WebSocket
   - Subscribes to the `presence:lobby` channel
   - Displays online users with avatars and join times
   - Updates UI in real-time as users join/leave

## Event Types

| Event | Description |
|-------|-------------|
| `user:join` | User connected to the channel |
| `user:leave` | User disconnected from the channel |
| `presence:state` | Full state sync (all online users) |

## Key Code

### Publishing Presence Events (Node.js)

```javascript
import { PushFloServer } from '@pushflodev/sdk/server'

const pushflo = new PushFloServer({
  secretKey: process.env.PUSHFLO_SECRET_KEY,
})

// User joined
await pushflo.publish('presence:lobby', {
  userId: 'user_1',
  userName: 'Alice',
  onlineUsers: [...allOnlineUsers],
}, {
  eventType: 'user:join',
})

// User left
await pushflo.publish('presence:lobby', {
  userId: 'user_1',
  userName: 'Alice',
  onlineUsers: [...remainingUsers],
}, {
  eventType: 'user:leave',
})
```

### Subscribing to Presence (Browser)

```javascript
// Get token
const { data: { token, endpoint } } = await fetch('/api/v1/auth/token', {
  method: 'POST',
  body: JSON.stringify({ publishKey: 'pub_xxx' }),
}).then(r => r.json())

// Connect WebSocket
const ws = new WebSocket(`${endpoint}?token=${token}`)

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data)

  if (msg.type === 'connected') {
    ws.send(JSON.stringify({ type: 'subscribe', channel: 'presence:lobby' }))
  }

  if (msg.type === 'message') {
    switch (msg.eventType) {
      case 'user:join':
        addUserToList(msg.data)
        break
      case 'user:leave':
        removeUserFromList(msg.data)
        break
      case 'presence:state':
        syncUserList(msg.data.onlineUsers)
        break
    }
  }
}
```

## Files

| File | Description |
|------|-------------|
| `src/server.js` | Node.js script that simulates user presence |
| `index.html` | Browser page that displays online users |
| `env.example` | Environment variable template |

## Troubleshooting

### Browser shows "Please edit index.html and add your PUBLISH_KEY"

Open `index.html` and find this line:
```javascript
const PUBLISH_KEY = 'YOUR_PUBLISH_KEY_HERE'
```

Replace it with your actual publish key:
```javascript
const PUBLISH_KEY = 'pub_xxxxxxxxxxxxx'
```

### Server shows "PUSHFLO_SECRET_KEY is required"

Create a `.env` file with your secret key:
```bash
cp env.example .env
# Edit .env and add your keys
```

### Users not appearing

1. Make sure both the server and subscriber are running
2. Check that both are using the `presence:lobby` channel
3. Verify your API keys are correct

## Next Steps

- [Hello World](../hello-world) - Simplest pub/sub example
- [Vanilla JS](../vanilla-js) - Single HTML file example
- [React + Vite](../../frameworks/react-vite) - Modern React setup

## License

MIT
