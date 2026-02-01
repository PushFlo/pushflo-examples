# PushFlo + Express.js Example

A REST API backend demonstrating PushFlo integration with Express.js and TypeScript.

## What You'll Learn

- Setting up PushFlo server SDK in Express
- Creating REST endpoints for publishing messages
- Fetching message history
- Input validation with Zod

## Prerequisites

- Node.js 18+
- PushFlo API keys from [console.pushflo.dev/credentials](https://console.pushflo.dev/credentials)

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

# Start development server
npm run dev
```

The server runs at [http://localhost:3000](http://localhost:3000).

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
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

### Get Message History

```bash
curl http://localhost:3000/channels/notifications/messages?page=1&pageSize=20
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "msg_xxx123",
      "eventType": "notification",
      "content": {"type": "alert", "message": "Hello!"},
      "createdAt": "2025-01-26T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "totalPages": 1
  }
}
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

**Get Message History:**
```typescript
const result = await pushflo.getMessageHistory('my-channel', {
  page: 1,
  pageSize: 20,
})

console.log(`Found ${result.pagination.total} messages`)
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

### Invalid channel slug

Channel slugs must be lowercase alphanumeric with hyphens only:
- ✅ `notifications`, `my-channel`, `user-123`
- ❌ `My Channel`, `user_123`, `ALERTS`

## Next Steps

- [React frontend](../react-vite) - Connect a React app
- [Next.js example](../nextjs) - Full-stack with Server Actions
- [Chat application](../../use-cases/chat-app) - Full chat example

## License

MIT
