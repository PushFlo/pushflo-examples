# PushFlo Vanilla JS Example

[![Open in CodeSandbox](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/github/PushFlo/pushflo-examples/tree/main/core/vanilla-js)
[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/PushFlo/pushflo-examples/tree/main/core/vanilla-js)

A single HTML file demonstrating PushFlo real-time subscriptions with no build tools or framework dependencies.

## What You'll Learn

- Connecting to PushFlo with plain JavaScript
- WebSocket connection lifecycle
- Subscribing to channels dynamically
- Handling real-time messages

## Prerequisites

- A web browser
- PushFlo API keys from [console.pushflo.dev](https://console.pushflo.dev)

## Quick Start

### Option 1: Open directly

1. Download `index.html`
2. Edit and add your publish key:
   ```javascript
   const CONFIG = {
     publishKey: 'pub_xxxxxxxxxxxxx',  // Replace with your key
     ...
   }
   ```
3. Open `index.html` in a browser

### Option 2: Use a local server

```bash
# Clone this example
npx degit PushFlo/pushflo-examples/core/vanilla-js my-vanilla-app
cd my-vanilla-app

# Edit index.html and add your publish key

# Start local server
npm start
# or
npx serve .
```

Open [http://localhost:8080](http://localhost:8080)

## How It Works

The entire example is in a single `index.html` file:

### 1. Configuration

```javascript
const CONFIG = {
  publishKey: 'pub_xxxxxxxxxxxxx',
  baseUrl: 'https://api.pushflo.dev',
  debug: true,
}
```

### 2. Get Connection Token

```javascript
const response = await fetch(`${CONFIG.baseUrl}/api/v1/auth/token`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    publishKey: CONFIG.publishKey,
    clientId: 'my-client-id',
  }),
})

const { data } = await response.json()
// data.token - JWT for WebSocket auth
// data.endpoint - WebSocket URL
```

### 3. Connect WebSocket

```javascript
const wsUrl = `${data.endpoint}?token=${data.token}`
const ws = new WebSocket(wsUrl)

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data)

  switch (msg.type) {
    case 'connected':
      // Ready to subscribe
      ws.send(JSON.stringify({ type: 'subscribe', channel: 'my-channel' }))
      break

    case 'message':
      // Handle incoming message
      console.log(msg.eventType, msg.data)
      break
  }
}
```

### 4. Message Types

| Type | Description |
|------|-------------|
| `connected` | Successfully authenticated |
| `subscribed` | Subscribed to a channel |
| `unsubscribed` | Unsubscribed from a channel |
| `message` | Received a message |
| `pong` | Heartbeat response |
| `error` | Server error |

### 5. Message Format

```javascript
{
  type: 'message',
  channel: 'notifications',
  eventType: 'user.signup',
  messageId: 'msg_xxx',
  clientId: 'server',
  data: { ... },
  timestamp: 1706000000000
}
```

## Features

- **No build step** - Just HTML and vanilla JavaScript
- **No dependencies** - Uses native `fetch` and `WebSocket`
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

### Express backend

See the [Express example](../../frameworks/express) for a full publishing backend.

## Files

| File | Description |
|------|-------------|
| `index.html` | Complete example (HTML + CSS + JS) |
| `env.example` | Reference for environment variables |

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

Toggle debug logging:

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

Requires native `fetch` and `WebSocket` support.

## Troubleshooting

### "Setup Required" error

Edit `index.html` and replace `YOUR_PUBLISH_KEY_HERE`:

```javascript
const CONFIG = {
  publishKey: 'pub_xxxxxxxxxxxxx',  // Your actual key
  ...
}
```

### Connection keeps disconnecting

1. Check your network connection
2. Verify the publish key is valid
3. Check browser console for errors

### No messages appearing

1. Confirm you're on the correct channel
2. Make sure messages are being published
3. Check the connection status indicator

## Next Steps

- [Presence tracking](../presence) - Show online users
- [Message history](../history) - Load previous messages
- [Chat application](../../use-cases/chat-app) - Full chat example

## License

MIT
