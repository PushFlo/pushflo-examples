# PushFlo + React + Vite Example

[![Open in CodeSandbox](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/github/PushFlo/pushflo-examples/tree/main/frameworks/react-vite)
[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/PushFlo/pushflo-examples/tree/main/frameworks/react-vite)

A modern React application with Vite demonstrating real-time PushFlo subscriptions.

## What You'll Learn

- Creating a custom React hook for PushFlo WebSocket connections
- Managing connection state in React components
- Subscribing to channels and handling real-time messages
- Using Vite environment variables

## Prerequisites

- Node.js 18+
- PushFlo API keys from [console.pushflo.dev/credentials](https://console.pushflo.dev/credentials)

## Quick Start

```bash
# Clone this example
npx degit PushFlo/pushflo-examples/frameworks/react-vite my-react-app
cd my-react-app

# Install dependencies
npm install

# Copy environment template
cp env.example .env

# Add your API key to .env
# VITE_PUSHFLO_PUBLISH_KEY=pub_xxxxxxxxxxxxx

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to see the app.

## How It Works

### Architecture

```
┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │
│   React App     │◄────►│   PushFlo       │
│   (Browser)     │  WS  │   Edge Network  │
│                 │      │                 │
└─────────────────┘      └─────────────────┘
```

1. The `usePushFlo` hook initializes the PushFlo client
2. It automatically connects and manages WebSocket lifecycle
3. Use `subscribe()` to listen for messages on any channel
4. Messages are received in real-time via WebSocket

### Key Files

| File | Description |
|------|-------------|
| `src/hooks/usePushFlo.ts` | Custom hook for PushFlo connection |
| `src/components/ConnectionStatus.tsx` | Connection state display |
| `src/components/MessageList.tsx` | Real-time message display |
| `src/App.tsx` | Main application component |

### The `usePushFlo` Hook

```tsx
import { usePushFlo } from './hooks/usePushFlo'

function MyComponent() {
  const { connectionState, subscribe } = usePushFlo()

  useEffect(() => {
    if (connectionState !== 'connected') return

    const unsubscribe = subscribe('my-channel', (message) => {
      console.log('Received:', message)
    })

    return unsubscribe
  }, [connectionState, subscribe])

  return <div>State: {connectionState}</div>
}
```

### Hook API

```typescript
interface UsePushFloReturn {
  // Current connection state: 'disconnected' | 'connecting' | 'connected' | 'error'
  connectionState: ConnectionState

  // Connect to PushFlo (called automatically by default)
  connect: () => Promise<void>

  // Disconnect from PushFlo
  disconnect: () => void

  // Subscribe to a channel - returns unsubscribe function
  subscribe: (channel: string, onMessage: (message: Message) => void) => () => void

  // Direct access to PushFlo client instance
  client: PushFloClient | null
}
```

### Options

```tsx
const { connectionState } = usePushFlo({
  debug: true,        // Enable debug logging
  autoConnect: true,  // Auto-connect on mount (default: true)
})
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_PUSHFLO_PUBLISH_KEY` | Yes | Publish key for subscriptions |
| `VITE_PUSHFLO_BASE_URL` | No | Custom API URL |

## Project Structure

```
frameworks/react-vite/
├── src/
│   ├── main.tsx                    # React entry point
│   ├── App.tsx                     # Main application
│   ├── index.css                   # Styles
│   ├── vite-env.d.ts              # TypeScript env types
│   ├── hooks/
│   │   └── usePushFlo.ts          # PushFlo React hook
│   └── components/
│       ├── ConnectionStatus.tsx    # Status indicator
│       └── MessageList.tsx         # Message display
├── test/
│   └── smoke.test.ts               # Smoke tests
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── env.example
```

## Testing the Demo

The easiest way to test is using the PushFlo Console:

1. Make sure the channel exists in your [PushFlo dashboard](https://console.pushflo.dev/channels)
2. Go to the [PushFlo Console](https://console.pushflo.dev/console)
3. Select the same channel (e.g., `notifications`)
4. Send a test message and watch it appear instantly!

## Publishing Messages from Code

To publish messages programmatically, use your secret key:

```bash
# Using curl
curl -X POST https://api.pushflo.dev/api/v1/channels/notifications/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sec_xxxxxxxxxxxxx" \
  -d '{
    "eventType": "notification",
    "content": {"message": "Hello from server!"}
  }'
```

Or use the [Express example](../express) as your backend.

## Troubleshooting

### "VITE_PUSHFLO_PUBLISH_KEY is required"

Make sure your `.env` file exists and contains the publish key:

```bash
VITE_PUSHFLO_PUBLISH_KEY=pub_xxxxxxxxxxxxx
```

Restart the dev server after adding environment variables.

### Connection stuck on "Connecting..."

1. Check that your publish key is correct
2. Verify you have network access to api.pushflo.dev
3. Open browser console for error messages

### No messages appearing

1. Confirm you're subscribed to the correct channel
2. Make sure messages are being published to that channel
3. Check that the connection state is "Connected"

## Next Steps

- [Express backend](../express) - Set up a publishing server
- [Presence tracking](../../core/presence) - Show online users
- [Chat application](../../use-cases/chat-app) - Full chat example

## License

MIT
