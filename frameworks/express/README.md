# PushFlo + Express.js Example

A REST API backend demonstrating PushFlo integration with Express.js and TypeScript.

## What You'll Learn

- Setting up PushFlo server SDK in Express
- Creating REST endpoints for publishing messages
- Managing channels programmatically
- Input validation with Zod

## Prerequisites

- Node.js 18+
- PushFlo API keys from [console.pushflo.dev](https://console.pushflo.dev)

## Quick Start

```bash
# Clone this example
npx degit PushFlo/pushflo-examples/frameworks/express my-express-api
cd my-express-api

# Install dependencies
npm install

# Copy environment template
cp env.example .env

# Add your API keys to .env
# PUSHFLO_SECRET_KEY=sec_xxxxxxxxxxxxx
# PUSHFLO_PUBLISH_KEY=pub_xxxxxxxxxxxxx

# Start development server
npm run dev
```

The server runs at [http://localhost:3000](http://localhost:3000).

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/channels` | List all channels |
| POST | `/channels` | Create a new channel |
| GET | `/channels/:slug` | Get channel details |
| DELETE | `/channels/:slug` | Delete a channel |
| POST | `/channels/:slug/messages` | Publish a message |
| GET | `/channels/:slug/messages` | Get message history |

## Usage Examples

### Publish a Message

```bash
curl -X POST http://localhost:3000/channels/notifications/messages \
  -H "Content-Type: application/json" \
  -d '{
    "content": {"type": "alert", "message": "Hello from Express!"},
    "eventType": "notification"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "msg_xxx123",
    "channelSlug": "notifications",
    "eventType": "notification",
    "delivered": 3,
    "createdAt": "2025-01-26T12:00:00.000Z"
  }
}
```

### Create a Channel

```bash
curl -X POST http://localhost:3000/channels \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Channel",
    "slug": "my-channel",
    "description": "Channel for updates"
  }'
```

### List Channels

```bash
curl http://localhost:3000/channels
```

### Get Message History

```bash
curl http://localhost:3000/channels/notifications/messages?page=1&pageSize=20
```

## How It Works

### Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│   Your App      │─────►│   Express API   │─────►│   PushFlo       │
│   (Frontend)    │ HTTP │   (This Example)│ REST │   Edge Network  │
│                 │      │                 │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
                                                          │
                                                          ▼
                                                   ┌─────────────────┐
                                                   │   Subscribers   │
                                                   │   (WebSocket)   │
                                                   └─────────────────┘
```

1. Your frontend or other services call this Express API
2. The API publishes messages to PushFlo using the secret key
3. PushFlo broadcasts to all WebSocket subscribers

### Key Files

| File | Description |
|------|-------------|
| `src/server.ts` | Main Express application |
| `env.example` | Environment variable template |

### Code Highlights

**Initialize PushFlo Client:**
```typescript
import { PushFloServer } from '@pushflodev/sdk/server'

const pushflo = new PushFloServer({
  secretKey: process.env.PUSHFLO_SECRET_KEY,
})
```

**Publish a Message:**
```typescript
const result = await pushflo.publish('my-channel', {
  text: 'Hello!',
  userId: 123,
}, {
  eventType: 'chat.message',
})

console.log(`Delivered to ${result.delivered} clients`)
```

**Create a Channel:**
```typescript
const channel = await pushflo.createChannel({
  name: 'Notifications',
  slug: 'notifications',
  description: 'System notifications',
})
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PUSHFLO_SECRET_KEY` | Yes | Secret key for publishing |
| `PUSHFLO_BASE_URL` | No | Custom API URL |
| `PORT` | No | Server port (default: 3000) |

## Project Structure

```
frameworks/express/
├── src/
│   └── server.ts         # Main Express application
├── test/
│   └── smoke.test.ts     # Smoke tests
├── package.json
├── tsconfig.json
└── env.example
```

## Troubleshooting

### "PUSHFLO_SECRET_KEY environment variable is required"

Create a `.env` file with your secret key:

```bash
cp env.example .env
# Edit .env and add your keys
```

### Channel not found errors

Make sure the channel exists before publishing. Create it first:

```bash
curl -X POST http://localhost:3000/channels \
  -H "Content-Type: application/json" \
  -d '{"name": "My Channel", "slug": "my-channel"}'
```

## Next Steps

- [React frontend](../react-vite) - Connect a React app
- [Presence tracking](../../core/presence) - Show online users
- [Chat application](../../use-cases/chat-app) - Full chat example

## License

MIT
