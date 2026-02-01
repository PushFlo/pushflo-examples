# PushFlo Vanilla JS Example

A simple HTML/JavaScript example demonstrating PushFlo real-time subscriptions with minimal dependencies.

## What You'll Learn

- Connecting to PushFlo with plain JavaScript
- WebSocket connection lifecycle
- Subscribing to channels dynamically
- Handling real-time messages

## Prerequisites

- Node.js 18+
- PushFlo API keys from [console.pushflo.dev/credentials](https://console.pushflo.dev/credentials)

## Quick Start

```bash
# Clone this example
npx degit PushFlo/pushflo-examples/core/vanilla-js my-vanilla-app
cd my-vanilla-app

# Install dependencies
npm install

# Copy environment template
cp env.example .env

# Add your PUSHFLO_PUBLISH_KEY to .env

# Start the server
npm start
```

Open [http://localhost:8080](http://localhost:8080)

## How It Works

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   serve.js      │      │   PushFlo       │◄────►│   index.html    │
│   (Web Server)  │      │   Edge Network  │  WS  │   (Browser)     │
└────────▲────────┘      └─────────────────┘      └────────┬────────┘
         │                                                  │
         └────────────── /api/token ────────────────────────┘
```

1. **Web Server** (`src/serve.js`):
   - Serves the HTML frontend
   - Provides `/api/token` endpoint using the publish key from `.env`

2. **Browser** (`index.html`):
   - Gets connection token from local server
   - Connects to PushFlo WebSocket
   - Subscribes to channels and displays messages

### Message Types

| Type | Description |
|------|-------------|
| `connected` | Successfully authenticated |
| `subscribed` | Subscribed to a channel |
| `unsubscribed` | Unsubscribed from a channel |
| `message` | Received a message |
| `pong` | Heartbeat response |
| `error` | Server error |

### Message Format

```javascript
{
  type: 'message',
  channel: 'notifications',
  message: {
    id: 'msg_xxx',
    eventType: 'user.signup',
    clientId: 'server',
    content: { ... },
    timestamp: 1706000000000
  }
}
```

## Features

- **Minimal setup** - Just configure `.env` and run
- **No build step** - Plain HTML and JavaScript
- **Auto-reconnect** - Reconnects automatically on disconnect
- **Channel switching** - Change channels without reconnecting
- **Debug logging** - Console logs for development

## Publishing Messages

This example only subscribes. To publish messages, use:

### curl

```bash
curl -X POST https://api.pushflo.dev/api/v1/channels/notifications/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sec_xxxxxxxxxxxxx" \
  -d '{
    "eventType": "test",
    "clientId": "curl",
    "content": {"message": "Hello from curl!"}
  }'
```

## Files

| File | Description |
|------|-------------|
| `src/serve.js` | Express server for web UI and token endpoint |
| `index.html` | Complete frontend (HTML + CSS + JS) |
| `env.example` | Environment variable template |

## Customization

### Styling

All CSS is in the `<style>` tag. Modify colors using CSS variables:

```css
:root {
  --primary: #3b82f6;
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --gray: #6b7280;
}
```

### Debug Mode

Toggle debug logging in `index.html`:

```javascript
const CONFIG = {
  debug: false,  // Disable console logs
}
```

## Browser Support

- Chrome 63+
- Firefox 57+
- Safari 11+
- Edge 79+

## Troubleshooting

### Server shows "PUSHFLO_PUBLISH_KEY is required"

Create a `.env` file with your publish key:
```bash
cp env.example .env
# Edit .env and add your key
```

### Connection keeps disconnecting

1. Check your network connection
2. Verify the publish key is valid
3. Check browser console for errors

### No messages appearing

1. Confirm you're on the correct channel
2. Make sure messages are being published to that channel
3. Check the connection status indicator

## Next Steps

- [Hello World](../hello-world) - Simple publisher + subscriber
- [Presence tracking](../presence) - Show online users
- [Message history](../history) - Load previous messages

## License

MIT
