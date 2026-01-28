# PushFlo Examples

[![CI](https://github.com/PushFlo/pushflo-examples/actions/workflows/ci.yml/badge.svg)](https://github.com/PushFlo/pushflo-examples/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Official examples and starter templates for [PushFlo](https://pushflo.dev) - real-time messaging built on Cloudflare's edge network.

## Quick Start

```bash
# Clone a specific example
npx degit PushFlo/pushflo-examples/frameworks/nextjs my-app
cd my-app
npm install
npm run dev
```

## Examples

### Core Examples

Fundamental patterns for PushFlo integration.

| Example | Description | Stack |
|---------|-------------|-------|
| [hello-world](./core/hello-world) | Minimal pub/sub example | Node.js + HTML |
| [presence](./core/presence) | Track online users per channel | Node.js |
| [history](./core/history) | Paginated message history | Node.js |
| [dashboard-demo](./core/dashboard-demo) | Connection stats visualization | Chart.js |

### Framework Templates

Production-ready starter templates.

| Framework | Description | Features |
|-----------|-------------|----------|
| [Next.js](./frameworks/nextjs) | Next.js 14 App Router | TypeScript, Server Actions, Hooks |
| [Express](./frameworks/express) | Express.js REST API | TypeScript, Publish endpoints |
| [React + Vite](./frameworks/react-vite) | Modern React setup | TypeScript, Hooks, Fast HMR |
| [Vanilla JS](./frameworks/vanilla-js) | No build tools | CDN SDK, Single HTML file |

### Use Cases

Real-world application examples.

| Use Case | Description | Features |
|----------|-------------|----------|
| [Chat App](./use-cases/chat-app) | Multi-room chat | Rooms, User list, Typing indicators |
| [Notifications](./use-cases/notifications) | Toast notification system | Auto-dismiss, Queue, Persistence |
| [Live Feed](./use-cases/live-feed) | Activity feed / timeline | Infinite scroll, Real-time updates |
| [IoT Dashboard](./use-cases/iot-dashboard) | Sensor monitoring | Simulated sensors, Charts |

### API Collections

Import into your favorite API client.

| Client | File |
|--------|------|
| [Postman](./postman/PushFlo.postman_collection.json) | Postman Collection |
| [Insomnia](./insomnia/pushflo-collection.yaml) | Insomnia Collection |

## Getting Your API Keys

1. Sign up at [console.pushflo.dev](https://console.pushflo.dev)
2. Create a new organization
3. Go to **Credentials** and create an API key
4. Copy your `pub_xxx` (publish key) and `sec_xxx` (secret key)

## Example Structure

Each example follows a consistent structure:

```
example-name/
├── README.md           # Purpose, quickstart, prerequisites
├── env.example         # Environment variable template
├── package.json        # Dependencies
├── src/                # Source code
└── test/
    └── smoke.test.ts   # CI smoke test
```

## Environment Variables

All examples use these environment variables:

```bash
# Required for publishing (server-side)
PUSHFLO_SECRET_KEY=sec_xxxxxxxxxxxxx

# Required for subscribing (client-side)
PUSHFLO_PUBLISH_KEY=pub_xxxxxxxxxxxxx

# Framework-specific prefixes
NEXT_PUBLIC_PUSHFLO_PUBLISH_KEY=pub_xxxxxxxxxxxxx  # Next.js
VITE_PUSHFLO_PUBLISH_KEY=pub_xxxxxxxxxxxxx          # Vite
```

## Running Examples Locally

### Prerequisites

- Node.js 18+
- npm or pnpm
- PushFlo API keys

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/PushFlo/pushflo-examples.git
   cd examples
   ```

2. Navigate to an example:
   ```bash
   cd frameworks/nextjs
   ```

3. Copy environment template:
   ```bash
   cp env.example .env.local
   ```

4. Add your API keys to `.env.local`

5. Install dependencies and run:
   ```bash
   npm install
   npm run dev
   ```

## Running Tests

Each example includes smoke tests that run against the mock server:

```bash
# Start mock server
cd shared/mock-server
npm install
npm start &

# Run tests for an example
cd frameworks/nextjs
npm test
```

## Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Adding a New Example

1. Create a new directory under the appropriate category
2. Include README, env.example, package.json, and smoke tests
3. Ensure it runs in under 60 seconds
4. Add entry to this README

## Links

- [PushFlo Documentation](https://docs.pushflo.dev)
- [PushFlo Console](https://console.pushflo.dev)
- [API Reference](https://console.pushflo.dev/api-reference)
- [@pushflodev/sdk on npm](https://www.npmjs.com/package/@pushflodev/sdk)

## License

MIT - see [LICENSE](./LICENSE)
