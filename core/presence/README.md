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
- PushFlo API keys from [console.pushflo.dev/credentials](https://console.pushflo.dev/credentials)

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

### Run the example

This example requires two terminals.

**Terminal 1 - Start the web UI:**

```bash
npm run serve
```

**Terminal 2 - Start the presence simulator:**

```bash
npm start
```

Open [http://localhost:8080](http://localhost:8080) in your browser and watch users join and leave in real-time!

## How It Works

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   server.js     │─────►│   PushFlo       │◄────►│   index.html    │
│   (Simulator)   │ REST │   Edge Network  │  WS  │   (Browser)     │
└─────────────────┘      └─────────────────┘      └────────┬────────┘
                                                           │
┌─────────────────┐                                        │
│   serve.js      │◄───────── /api/token (get WS token) ───┘
│   (Web Server)  │
└─────────────────┘
```

1. **Web Server** (`src/serve.js` - run with `npm run serve`):
   - Serves the web UI (index.html) on port 8080
   - Provides `/api/token` endpoint for WebSocket authentication

2. **Presence Simulator** (`src/server.js` - run with `npm start`):
   - Uses the secret key to publish events
   - Tracks simulated users in a Map
   - Publishes `user:join` events when users connect
   - Publishes `user:leave` events when users disconnect
   - Publishes `presence:state` periodically for new subscribers

3. **Browser Client** (`index.html`):
   - Gets a connection token from the local server
   - Connects via WebSocket to PushFlo
   - Subscribes to the `presence-lobby` channel
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
await pushflo.publish('presence-lobby', {
  userId: 'user_1',
  userName: 'Alice',
  onlineUsers: [...allOnlineUsers],
}, {
  eventType: 'user:join',
})

// User left
await pushflo.publish('presence-lobby', {
  userId: 'user_1',
  userName: 'Alice',
  onlineUsers: [...remainingUsers],
}, {
  eventType: 'user:leave',
})
```

### Subscribing to Presence (Browser)

```javascript
// Get token from backend (backend uses secret key)
const { data: { token, endpoint } } = await fetch('/api/token', {
  method: 'POST',
}).then(r => r.json())

// Connect WebSocket
const ws = new WebSocket(`${endpoint}?token=${token}`)

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data)

  if (msg.type === 'connected') {
    ws.send(JSON.stringify({ type: 'subscribe', channel: 'presence-lobby' }))
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
| `src/serve.js` | Express server for the web UI and token endpoint (`npm run serve`) |
| `src/server.js` | Presence simulator that publishes join/leave events (`npm start`) |
| `index.html` | Browser page that displays online users |
| `env.example` | Environment variable template |

## Troubleshooting

### Server shows "PUSHFLO_SECRET_KEY is required"

Create a `.env` file with your secret key:
```bash
cp env.example .env
# Edit .env and add your keys
```

### Users not appearing

1. Make sure both terminals are running (`npm run serve` and `npm start`)
2. Check that both are using the `presence-lobby` channel
3. Verify your API keys are correct

## Next Steps

- [Hello World](../hello-world) - Simplest pub/sub example
- [Vanilla JS](../vanilla-js) - Single HTML file example
- [React + Vite](../../frameworks/react-vite) - Modern React setup

## License

MIT
