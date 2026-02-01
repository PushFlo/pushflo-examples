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
- PushFlo API keys from [console.pushflo.dev/credentials](https://console.pushflo.dev/credentials)

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

### Terminal 1: Start the web UI

```bash
npm run serve
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

### Terminal 2: Publish some messages

```bash
# Publish 10 sample messages to create history
npm run publish
```

Then click "Load History" in the browser to see them!

## How It Works

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   server.js     │─────►│   PushFlo       │◄────►│   index.html    │
│   (Publisher)   │ REST │   Edge Network  │  WS  │   (Browser)     │
└─────────────────┘      └─────────────────┘      └────────▲────────┘
                                                           │
┌─────────────────┐                                        │
│   serve.js      │◄───────── /api/token ──────────────────┤
│   (Web Server)  │◄───────── /api/history ────────────────┘
└─────────────────┘
```

1. **Web Server** (`src/serve.js`):
   - Serves the HTML frontend
   - Provides `/api/token` for WebSocket connection
   - Provides `/api/history/:channel` proxy (keeps secret key server-side)

2. **Publisher** (`src/server.js`):
   - Uses the secret key to authenticate
   - Publishes sample messages to the `history-demo` channel
   - Can also fetch and display history from command line

3. **Browser** (`index.html`):
   - Fetches history via local `/api/history` endpoint
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
```

### Fetching History (Browser via proxy)

```javascript
// Fetch history via local server proxy
const response = await fetch('/api/history/history-demo?page=1&pageSize=10')
const { data, pagination } = await response.json()

// Display messages
for (const msg of data) {
  console.log(`[${msg.timestamp}] ${msg.content.text}`)
}
```

## Files

| File | Description |
|------|-------------|
| `src/serve.js` | Express server for web UI and API proxy |
| `src/server.js` | Node.js script that publishes messages |
| `index.html` | Browser page showing paginated history + real-time |
| `env.example` | Environment variable template |

## CLI Options

```bash
# Start the web UI server
npm run serve

# Publish 10 sample messages
npm run publish

# Publish N sample messages
npm start -- --publish 20

# Fetch and display history (CLI)
npm start -- --fetch

# Default: publish 3 messages then show history
npm start
```

## Troubleshooting

### Server shows "PUSHFLO_PUBLISH_KEY and PUSHFLO_SECRET_KEY are required"

Create a `.env` file with your keys:
```bash
cp env.example .env
# Edit .env and add your keys
```

### No messages in history

1. Make sure you've published some messages first:
   ```bash
   npm run publish
   ```
2. Check that the channel name matches (`history-demo`)
3. Verify your keys are correct

### History API returns error

Make sure your `PUSHFLO_SECRET_KEY` is valid - the history API requires server authentication.

## Next Steps

- [Hello World](../hello-world) - Simplest pub/sub example
- [Presence tracking](../presence) - Show online users
- [Vanilla JS](../vanilla-js) - Browser-only subscriber

## License

MIT
