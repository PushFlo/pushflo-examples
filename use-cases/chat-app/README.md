# PushFlo Chat Application

A full-featured real-time chat application demonstrating PushFlo's capabilities. This example shows how to build a modern chat experience with multiple rooms, user presence, and instant message delivery.

## Features

- **Multiple Chat Rooms**: Switch between different topic channels (General, Random, Tech)
- **Real-time Messaging**: Messages appear instantly for all users in the room
- **User Nicknames**: Choose your display name when joining
- **User Presence**: See who's online in each room
- **Room Switching**: Change rooms without page reload
- **Message Timestamps**: See when each message was sent
- **Clean, Modern UI**: Discord-inspired dark theme design
- **Responsive Layout**: Works on desktop and mobile devices

## Prerequisites

- Node.js 18+
- A PushFlo account with API keys from [console.pushflo.dev](https://console.pushflo.dev)

## Quick Start

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**

   Copy the example environment file and add your PushFlo keys:

   ```bash
   cp env.example .env
   ```

   Edit `.env` with your credentials:

   ```
   PUSHFLO_SECRET_KEY=sec_your_secret_key_here
   PUSHFLO_PUBLISH_KEY=pub_your_publish_key_here
   ```

3. **Start the server**

   ```bash
   npm run dev
   ```

4. **Open in browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Architecture

### Server (`src/server.js`)

The Express server handles:

- **Static file serving**: Serves the chat UI files
- **Message publishing**: Receives messages from clients and publishes them to PushFlo channels
- **User presence**: Tracks which users are in which rooms
- **Room management**: Provides list of available chat rooms

Key endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/config` | GET | Returns client configuration (publish key) |
| `/api/rooms` | GET | Lists available chat rooms |
| `/api/rooms/:id/messages` | POST | Send a message to a room |
| `/api/rooms/:id/join` | POST | Notify room of user joining |
| `/api/rooms/:id/leave` | POST | Notify room of user leaving |
| `/api/rooms/:id/users` | GET | Get list of users in a room |
| `/health` | GET | Health check |

### Client (`public/app.js`)

The browser client handles:

- **PushFlo connection**: Establishes WebSocket connection for real-time updates
- **Channel subscription**: Subscribes to chat room channels
- **UI updates**: Renders messages and user list in real-time
- **Message sending**: Posts messages to the server for publishing

### Data Flow

```
┌─────────────┐      POST /messages      ┌─────────────┐
│   Browser   │ ─────────────────────────▶   Express   │
│   Client    │                          │   Server    │
└─────────────┘                          └──────┬──────┘
       ▲                                        │
       │                                        │ publish()
       │                                        ▼
       │                                 ┌─────────────┐
       │◀────────── WebSocket ───────────│   PushFlo   │
       │         (real-time)             │   Service   │
       │                                 └─────────────┘
```

1. User types a message and hits Enter
2. Client POSTs the message to the Express server
3. Server publishes the message to PushFlo
4. PushFlo broadcasts the message to all subscribed clients
5. Each client's callback receives the message and updates the UI

## Channel Naming Convention

Chat rooms use the pattern `chat-{roomId}`:

- `chat-general` - General discussion room
- `chat-random` - Random topics room
- `chat-tech` - Technology discussion room

## Event Types

| Event Type | Description | Payload |
|------------|-------------|---------|
| `chat.message` | A chat message | `{ nickname, text, timestamp }` |
| `user.joined` | User joined room | `{ nickname, timestamp, users }` |
| `user.left` | User left room | `{ nickname, timestamp, users }` |

## Customization

### Adding More Rooms

Edit the `rooms` array in `src/server.js`:

```javascript
const rooms = [
  { id: 'general', name: 'General', description: 'General discussion' },
  { id: 'random', name: 'Random', description: 'Random topics' },
  { id: 'tech', name: 'Tech', description: 'Technology discussion' },
  // Add your custom rooms here
  { id: 'gaming', name: 'Gaming', description: 'Video games chat' },
];
```

### Styling

Modify `public/styles.css` to customize the look. The CSS uses CSS custom properties (variables) for easy theming:

```css
:root {
  --primary-color: #5865f2;
  --bg-dark: #1e1f22;
  --text-primary: #f2f3f5;
  /* ... */
}
```

### Message Validation

Adjust validation rules in `src/server.js`:

```javascript
if (text.length > 1000) {  // Change max message length
  return res.status(400).json({
    success: false,
    error: 'Message is too long',
  });
}
```

## Testing

Run the smoke tests:

```bash
# Start the server first
npm run dev

# In another terminal, run tests
npm test
```

## Production Considerations

For production deployment, consider:

1. **Persistent user storage**: Replace in-memory `roomUsers` Map with Redis or a database
2. **Authentication**: Add user authentication instead of simple nicknames
3. **Rate limiting**: Prevent message spam with rate limiting middleware
4. **Input sanitization**: The example escapes HTML, but consider additional sanitization
5. **HTTPS**: Use HTTPS in production for secure WebSocket connections
6. **Horizontal scaling**: Use Redis pub/sub for multi-instance deployments

## Related Examples

- [Express Framework Example](../../frameworks/express/) - Basic Express.js integration
- [React Hooks Example](../../frameworks/react/) - React with usePushFlo hook

## Resources

- [PushFlo Documentation](https://pushflo.dev/docs)
- [PushFlo SDK Reference](https://github.com/PushFlo/pushflo-sdk)
- [PushFlo Console](https://console.pushflo.dev)

## License

MIT
