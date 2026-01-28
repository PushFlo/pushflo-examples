/**
 * PushFlo Chat Application - Express Server
 *
 * A real-time chat server that demonstrates:
 * - Publishing messages to PushFlo channels (chat rooms)
 * - Serving static files for the chat UI
 * - Managing user presence
 */

import 'dotenv/config';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { PushFloServer } from '@pushflodev/sdk/server';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Validate environment
const secretKey = process.env.PUSHFLO_SECRET_KEY;
const publishKey = process.env.PUSHFLO_PUBLISH_KEY;

if (!secretKey) {
  console.error('PUSHFLO_SECRET_KEY environment variable is required');
  console.error('Get your key at https://console.pushflo.dev/credentials');
  process.exit(1);
}

if (!publishKey) {
  console.error('PUSHFLO_PUBLISH_KEY environment variable is required');
  console.error('Get your key at https://console.pushflo.dev/credentials');
  process.exit(1);
}

// Initialize PushFlo client
const pushflo = new PushFloServer({
  secretKey,
  baseUrl: process.env.PUSHFLO_BASE_URL,
});

// Create Express app
const app = express();
app.use(express.json());

// Serve static files from public directory
app.use(express.static(join(__dirname, '../public')));

// In-memory user tracking per room
const roomUsers = new Map();

/**
 * GET /api/config
 * Return client configuration (publish key for browser)
 */
app.get('/api/config', (_req, res) => {
  res.json({
    publishKey,
    baseUrl: process.env.PUSHFLO_BASE_URL || 'https://api.pushflo.dev',
  });
});

/**
 * GET /api/rooms
 * List available chat rooms
 */
app.get('/api/rooms', (_req, res) => {
  // Predefined rooms for this demo
  const rooms = [
    { id: 'general', name: 'General', description: 'General discussion' },
    { id: 'random', name: 'Random', description: 'Random topics' },
    { id: 'tech', name: 'Tech', description: 'Technology discussion' },
  ];

  res.json({ success: true, data: rooms });
});

/**
 * POST /api/rooms/:roomId/messages
 * Send a message to a chat room
 */
app.post('/api/rooms/:roomId/messages', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { nickname, text } = req.body;

    if (!nickname || typeof nickname !== 'string' || nickname.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Nickname is required',
      });
    }

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message text is required',
      });
    }

    if (text.length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Message is too long (max 1000 characters)',
      });
    }

    // Publish message to PushFlo channel
    const result = await pushflo.publish(`chat-${roomId}`, {
      nickname: nickname.trim(),
      text: text.trim(),
      timestamp: Date.now(),
    }, {
      eventType: 'chat.message',
    });

    res.status(201).json({
      success: true,
      data: {
        id: result.id,
        roomId,
        nickname: nickname.trim(),
        text: text.trim(),
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    console.error('Error publishing message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message',
    });
  }
});

/**
 * POST /api/rooms/:roomId/join
 * Notify room that a user joined
 */
app.post('/api/rooms/:roomId/join', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { nickname } = req.body;

    if (!nickname || typeof nickname !== 'string' || nickname.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Nickname is required',
      });
    }

    // Track user in room
    if (!roomUsers.has(roomId)) {
      roomUsers.set(roomId, new Set());
    }
    roomUsers.get(roomId).add(nickname.trim());

    // Publish join event
    await pushflo.publish(`chat-${roomId}`, {
      nickname: nickname.trim(),
      timestamp: Date.now(),
      users: Array.from(roomUsers.get(roomId)),
    }, {
      eventType: 'user.joined',
    });

    res.json({
      success: true,
      data: {
        roomId,
        users: Array.from(roomUsers.get(roomId)),
      },
    });
  } catch (error) {
    console.error('Error processing join:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to join room',
    });
  }
});

/**
 * POST /api/rooms/:roomId/leave
 * Notify room that a user left
 */
app.post('/api/rooms/:roomId/leave', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { nickname } = req.body;

    if (!nickname) {
      return res.status(400).json({
        success: false,
        error: 'Nickname is required',
      });
    }

    // Remove user from room tracking
    if (roomUsers.has(roomId)) {
      roomUsers.get(roomId).delete(nickname.trim());
    }

    // Publish leave event
    await pushflo.publish(`chat-${roomId}`, {
      nickname: nickname.trim(),
      timestamp: Date.now(),
      users: roomUsers.has(roomId) ? Array.from(roomUsers.get(roomId)) : [],
    }, {
      eventType: 'user.left',
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error processing leave:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to leave room',
    });
  }
});

/**
 * GET /api/rooms/:roomId/users
 * Get list of users in a room
 */
app.get('/api/rooms/:roomId/users', (req, res) => {
  const { roomId } = req.params;
  const users = roomUsers.has(roomId) ? Array.from(roomUsers.get(roomId)) : [];
  res.json({ success: true, data: users });
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('Error:', err.message);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// Start server
const PORT = parseInt(process.env.PORT || '3000');

app.listen(PORT, () => {
  console.log(`Chat server running on http://localhost:${PORT}`);
  console.log('');
  console.log('API Endpoints:');
  console.log('  GET  /api/config                 - Get client config');
  console.log('  GET  /api/rooms                  - List chat rooms');
  console.log('  POST /api/rooms/:id/messages     - Send message');
  console.log('  POST /api/rooms/:id/join         - Join room');
  console.log('  POST /api/rooms/:id/leave        - Leave room');
  console.log('  GET  /api/rooms/:id/users        - Get room users');
  console.log('  GET  /health                     - Health check');
  console.log('');
  console.log('Open http://localhost:' + PORT + ' in your browser to start chatting!');
});

export default app;
