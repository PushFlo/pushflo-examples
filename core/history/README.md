# PushFlo Message History

Demonstrates loading paginated message history from a channel, combined with real-time updates.

## What You'll Learn

- Fetching message history from a channel
- Implementing pagination (load more messages)
- Displaying messages in chronological order
- Combining historical messages with real-time updates
- Using `PushFloServer.getMessageHistory()` method

## Prerequisites

- Node.js 18+
- PushFlo API keys from [console.pushflo.dev](https://console.pushflo.dev)

## Quick Start

```bash
# Clone this example
npx degit PushFlo/pushflo-examples/core/history my-history-app
cd my-history-app

# Install dependencies
npm install

# Copy environment template
cp env.example .env

# Add your API keys to .env
# PUSHFLO_SECRET_KEY=sec_xxxxxxxxxxxxx
# PUSHFLO_PUBLISH_KEY=pub_xxxxxxxxxxxxx
```

### Terminal 1: Publish some messages

```bash
# Publish 20 sample messages to create history
npm start -- --publish 20
```

### Terminal 2: View in browser

```bash
# Serve the HTML file
npm run serve
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

**Important:** Edit `index.html` and replace both `YOUR_SECRET_KEY_HERE` and `YOUR_PUBLISH_KEY_HERE` with your actual keys.

## How It Works

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│   server.js     │─────►│   PushFlo       │◄────►│   index.html    │
│   (Node.js)     │ REST │   Edge Network  │  WS  │   (Browser)     │
│                 │      │                 │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
     │                          │                        │
     │ publish()                │                        │
     │                          │                        │ GET /messages
     │                          │◄───────────────────────│ (history)
     │                          │                        │
     │                          │────────────────────────► WebSocket
     │                          │                        │ (real-time)
```

1. **Server** (`src/server.js`):
   - Uses the secret key to authenticate
   - Publishes sample messages to the `history-demo` channel
   - Demonstrates fetching history with `getMessageHistory()`

2. **Browser** (`index.html`):
   - Fetches paginated history via REST API
   - Connects via WebSocket for real-time updates
   - Shows historical messages marked as "HISTORY"
   - Shows new messages marked as "LIVE"

## Key Code

### Fetching History (Node.js)

```javascript
import { PushFloServer } from '@pushflodev/sdk/server'

const pushflo = new PushFloServer({
  secretKey: process.env.PUSHFLO_SECRET_KEY,
})

// Fetch first page of messages
const { messages, pagination } = await pushflo.getMessageHistory('history-demo', {
  pageSize: 10,
  page: 1,
})

console.log(`Found ${pagination.total} total messages`)
console.log(`Page ${pagination.page} of ${pagination.totalPages}`)

// Fetch next page
if (pagination.page < pagination.totalPages) {
  const page2 = await pushflo.getMessageHistory('history-demo', {
    pageSize: 10,
    page: 2,
  })
}
```

### Fetching History (Browser)

```javascript
// Fetch history via REST API
const response = await fetch(`${BASE_URL}/api/v1/channels/history-demo/messages?page=1&pageSize=10`, {
  headers: {
    'Authorization': `Bearer ${SECRET_KEY}`,
  },
})

const { data: { messages, pagination } } = await response.json()

// Display messages
for (const msg of messages) {
  console.log(`[${msg.timestamp}] ${msg.content.text}`)
}

// Load more if available
if (pagination.page < pagination.totalPages) {
  // Fetch page 2...
}
```

### Message History Options

```javascript
await pushflo.getMessageHistory(channel, {
  page: 1,           // Page number (1-indexed)
  pageSize: 10,      // Items per page (default: 20)
  eventType: 'chat', // Filter by event type
  after: 1704067200000,  // Messages after timestamp
  before: 1704153600000, // Messages before timestamp
})
```

## Files

| File | Description |
|------|-------------|
| `src/server.js` | Node.js script that publishes messages and fetches history |
| `index.html` | Browser page showing paginated history + real-time updates |
| `env.example` | Environment variable template |
| `test/smoke.test.js` | Basic smoke tests |

## Troubleshooting

### "Please edit index.html and add your SECRET_KEY"

Open `index.html` and find these lines:
```javascript
const PUBLISH_KEY = 'YOUR_PUBLISH_KEY_HERE'
const SECRET_KEY = 'YOUR_SECRET_KEY_HERE'
```

Replace them with your actual keys.

### No messages in history

1. Make sure you've published some messages first:
   ```bash
   npm start -- --publish 20
   ```
2. Check that the channel name matches (`history-demo`)
3. Verify your SECRET_KEY is correct

### Publisher shows "PUSHFLO_SECRET_KEY is required"

Create a `.env` file with your secret key:
```bash
cp env.example .env
# Edit .env and add your keys
```

## CLI Options

```bash
# Publish N sample messages
npm start -- --publish 20

# Fetch and display history
npm start -- --fetch

# Default: publish 3 messages then show history
npm start
```

## Next Steps

- [Hello World](../hello-world) - Simplest pub/sub example
- [Vanilla JS](../vanilla-js) - Single HTML file example
- [React + Vite](../../frameworks/react-vite) - Modern React setup

## License

MIT
