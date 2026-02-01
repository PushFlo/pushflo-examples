# PushFlo + Next.js 14 Example

[![Open in CodeSandbox](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/github/PushFlo/pushflo-examples/tree/main/frameworks/nextjs)
[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/PushFlo/pushflo-examples/tree/main/frameworks/nextjs)

Real-time messaging with PushFlo using Next.js 14 App Router, Server Actions, and React hooks.

## What You'll Learn

- Setting up the PushFlo client SDK in a Next.js app
- Creating a custom React hook for WebSocket subscriptions
- Publishing messages securely via Server Actions
- Managing connection state in React components

## Prerequisites

- Node.js 18+
- PushFlo API keys from [console.pushflo.dev/credentials](https://console.pushflo.dev/credentials)

## Quick Start

```bash
# Clone this example
npx degit PushFlo/pushflo-examples/frameworks/nextjs my-pushflo-app
cd my-pushflo-app

# Install dependencies
npm install

# Copy environment template
cp env.example .env.local

# Add your API keys to .env.local
# PUSHFLO_SECRET_KEY=sec_xxxxxxxxxxxxx
# NEXT_PUBLIC_PUSHFLO_PUBLISH_KEY=pub_xxxxxxxxxxxxx

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and navigate to the Messages page.

## How It Works

### Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│   Browser       │◄────►│   PushFlo       │◄────►│   Next.js       │
│   (Subscribe)   │  WS  │   Edge Network  │ REST │   Server        │
│                 │      │                 │      │   (Publish)     │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

1. **Browser Client** - Connects via WebSocket using the publish key (`pub_xxx`)
2. **Server Actions** - Publish messages using the secret key (`sec_xxx`)
3. **PushFlo Edge** - Routes messages to all subscribers in real-time

### Key Files

| File | Description |
|------|-------------|
| `src/hooks/use-pushflo.ts` | Custom hook for PushFlo connection and subscriptions |
| `src/lib/pushflo-server.ts` | Server-side client singleton |
| `src/app/messages/page.tsx` | Real-time message display component |
| `src/app/messages/actions.ts` | Server Action for publishing messages |
| `src/components/` | Reusable UI components |

### The `usePushFlo` Hook

```tsx
'use client'

import { usePushFlo } from '@/hooks/use-pushflo'

export default function MyComponent() {
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

### Server Actions

```tsx
// src/app/messages/actions.ts
'use server'

import { publishMessage } from '@/lib/pushflo-server'

export async function publishMessageAction(
  channel: string,
  contentJson: string,
  eventType: string
) {
  const content = JSON.parse(contentJson)
  return await publishMessage(channel, content, eventType)
}
```

```tsx
// In a client component
import { publishMessageAction } from './actions'

async function handlePublish() {
  await publishMessageAction(
    'my-channel',
    JSON.stringify({ text: 'Hello!' }),
    'message'
  )
}
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PUSHFLO_SECRET_KEY` | Yes | Server-side secret key for publishing |
| `NEXT_PUBLIC_PUSHFLO_PUBLISH_KEY` | Yes | Client-side key for subscriptions |
| `PUSHFLO_BASE_URL` | No | Custom API URL (server-side) |
| `NEXT_PUBLIC_PUSHFLO_BASE_URL` | No | Custom API URL (client-side) |

## Project Structure

```
frameworks/nextjs/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Home page
│   │   ├── globals.css             # Global styles
│   │   ├── messages/
│   │   │   ├── page.tsx            # Real-time messages page
│   │   │   └── actions.ts          # Server Actions
│   │   └── api/
│   │       └── publish/
│   │           └── route.ts        # API Route alternative
│   ├── components/
│   │   ├── connection-status.tsx   # Connection state display
│   │   ├── message-list.tsx        # Message list component
│   │   └── publish-form.tsx        # Publish form component
│   ├── hooks/
│   │   └── use-pushflo.ts          # PushFlo React hook
│   └── lib/
│       └── pushflo-server.ts       # Server-side client
├── test/
│   └── smoke.test.ts               # Smoke tests
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── env.example
```

## Troubleshooting

### "NEXT_PUBLIC_PUSHFLO_PUBLISH_KEY is required"

Make sure your `.env.local` file exists and contains the publish key:

```bash
NEXT_PUBLIC_PUSHFLO_PUBLISH_KEY=pub_xxxxxxxxxxxxx
```

Restart the dev server after adding environment variables.

### Connection stuck on "Connecting..."

1. Check that your publish key is correct
2. Verify you have network access to api.pushflo.dev
3. Check browser console for error messages

### Server Action fails with "PUSHFLO_SECRET_KEY is required"

The secret key is only available on the server. Make sure:

1. `PUSHFLO_SECRET_KEY` is in your `.env.local`
2. You're using Server Actions or API Routes (not client-side code)

## Next Steps

- [Presence tracking](../../core/presence) - Show online users
- [Message history](../../core/history) - Load previous messages
- [Chat application](../../use-cases/chat-app) - Full chat example

## License

MIT
