# PushFlo Mock Server

A mock implementation of the PushFlo API for testing examples without requiring real API keys.

## Features

- Full REST API matching PushFlo OpenAPI spec
- WebSocket server for real-time subscriptions
- In-memory storage (resets on restart)
- Pre-configured test channels
- No authentication required beyond key format validation

## Quick Start

```bash
npm install
npm run build
npm start
```

The server runs on `http://localhost:3001` by default.

## Test Credentials

Use these credentials in your examples when testing against the mock server:

```bash
PUSHFLO_PUBLISH_KEY=pub_test_key
PUSHFLO_SECRET_KEY=sec_test_key
PUSHFLO_BASE_URL=http://localhost:3001
```

## Pre-configured Channels

The mock server starts with these channels:

- `notifications` - User notifications channel
- `chat` - General chat channel

New channels are auto-created when subscribing via WebSocket.

## API Endpoints

### Authentication

- `POST /api/v1/auth/token` - Generate connection token

### Channels

- `GET /api/v1/channels` - List channels
- `POST /api/v1/channels` - Create channel (requires `sec_` key)
- `GET /api/v1/channels/:slug` - Get channel
- `PATCH /api/v1/channels/:slug` - Update channel (requires `sec_` key)
- `DELETE /api/v1/channels/:slug` - Delete channel (requires `sec_` key)

### Messages

- `GET /api/v1/channels/:slug/messages` - Get message history
- `POST /api/v1/channels/:slug/messages` - Publish message (requires `sec_` key)

### Health

- `GET /health` - Health check endpoint

## WebSocket Protocol

Connect to `ws://localhost:3001/ws?token=<token>` where token is obtained from `/api/v1/auth/token`.

### Messages

**Subscribe to channel:**
```json
{ "type": "subscribe", "channel": "my-channel" }
```

**Unsubscribe from channel:**
```json
{ "type": "unsubscribe", "channel": "my-channel" }
```

**Ping (heartbeat):**
```json
{ "type": "ping" }
```

**Acknowledge message:**
```json
{ "type": "ack", "messageId": "msg_xxx" }
```

### Server Messages

**Connected:**
```json
{ "type": "connected", "clientId": "client_xxx" }
```

**Subscribed:**
```json
{ "type": "subscribed", "channel": "my-channel" }
```

**Message received:**
```json
{
  "type": "message",
  "channel": "my-channel",
  "eventType": "custom-event",
  "messageId": "msg_xxx",
  "clientId": "server",
  "data": { ... },
  "timestamp": 1706000000000
}
```

## Docker

```bash
# Build
docker build -t pushflo-mock .

# Run
docker run -p 3001:3001 pushflo-mock
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |

## Development

```bash
# Run with hot reload
npm run dev
```
