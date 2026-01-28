# PushFlo Hello World

The simplest possible PushFlo example: a Node.js publisher and an HTML subscriber.

## What You'll Learn

- Publishing messages from Node.js
- Subscribing to messages in the browser
- Basic WebSocket connection flow
- Real-time message delivery

## Prerequisites

- Node.js 18+
- PushFlo API keys from [console.pushflo.dev](https://console.pushflo.dev)

## Quick Start

```bash
# Clone this example
npx degit PushFlo/pushflo-examples/core/hello-world my-hello-world
cd my-hello-world

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

### Terminal 2: Start the publisher

```bash
# Publish messages
npm start
```

Watch messages appear in real-time in your browser!

## How It Works

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│   publisher.js  │─────►│   PushFlo       │◄────►│   index.html    │
│   (Node.js)     │ REST │   Edge Network  │  WS  │   (Browser)     │
│                 │      │                 │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

1. **Publisher** (`src/publisher.js`):
   - Uses the secret key to authenticate
   - Publishes "Hello, World!" messages every 3 seconds
   - Sends to the `hello` channel

2. **Subscriber** (`index.html`):
   - Gets a connection token using the publish key
   - Connects via WebSocket
   - Subscribes to the `hello` channel
   - Displays messages in real-time

## Key Code

### Publishing (Node.js)

```javascript
import { PushFloServer } from '@pushflodev/sdk/server'

const pushflo = new PushFloServer({
  secretKey: process.env.PUSHFLO_SECRET_KEY,
})

await pushflo.publish('hello', {
  greeting: 'Hello, World!',
  timestamp: new Date().toISOString(),
})
```

### Subscribing (Browser)

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
    ws.send(JSON.stringify({ type: 'subscribe', channel: 'hello' }))
  }

  if (msg.type === 'message') {
    console.log('Received:', msg.data)
  }
}
```

## Files

| File | Description |
|------|-------------|
| `src/publisher.js` | Node.js script that publishes messages |
| `index.html` | Browser page that receives messages |
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

### Publisher shows "PUSHFLO_SECRET_KEY is required"

Create a `.env` file with your secret key:
```bash
cp env.example .env
# Edit .env and add your keys
```

### No messages appearing

1. Make sure both the publisher and subscriber are running
2. Check that both are using the `hello` channel
3. Verify your API keys are correct

## Next Steps

- [Presence tracking](../presence) - Show online users
- [Message history](../history) - Load previous messages
- [Chat application](../../use-cases/chat-app) - Full chat example

## License

MIT
