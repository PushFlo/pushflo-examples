/**
 * PushFlo Chat Application - Client-Side JavaScript
 *
 * Features:
 * - Real-time messaging via PushFlo WebSocket
 * - Multiple chat rooms (channels)
 * - User nicknames and presence
 * - Room switching without page reload
 */

// State
let pushfloClient = null;
let currentNickname = '';
let currentRoom = null;
let rooms = [];
let currentSubscription = null;

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const chatScreen = document.getElementById('chat-screen');
const loginForm = document.getElementById('login-form');
const nicknameInput = document.getElementById('nickname-input');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const messagesList = document.getElementById('messages-list');
const roomList = document.getElementById('room-list');
const currentUserEl = document.getElementById('current-user');
const currentRoomNameEl = document.getElementById('current-room-name');
const currentRoomDescriptionEl = document.getElementById('current-room-description');
const connectionStatusEl = document.getElementById('connection-status');
const usersList = document.getElementById('users-list');
const logoutBtn = document.getElementById('logout-btn');

/**
 * Initialize the application
 */
async function init() {
  // Check for saved nickname
  const savedNickname = localStorage.getItem('chat_nickname');
  if (savedNickname) {
    nicknameInput.value = savedNickname;
  }

  // Set up event listeners
  loginForm.addEventListener('submit', handleLogin);
  messageForm.addEventListener('submit', handleSendMessage);
  logoutBtn.addEventListener('click', handleLogout);

  // Handle Enter key in message input
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      messageForm.dispatchEvent(new Event('submit'));
    }
  });
}

/**
 * Handle login form submission
 */
async function handleLogin(e) {
  e.preventDefault();

  const nickname = nicknameInput.value.trim();
  if (!nickname) return;

  currentNickname = nickname;
  localStorage.setItem('chat_nickname', nickname);

  // Show chat screen
  loginScreen.classList.add('hidden');
  chatScreen.classList.remove('hidden');
  currentUserEl.textContent = nickname;

  // Initialize PushFlo and load rooms
  await initializePushFlo();
  await loadRooms();

  // Join first room
  if (rooms.length > 0) {
    await joinRoom(rooms[0]);
  }

  // Focus message input
  messageInput.focus();
}

/**
 * Initialize PushFlo client
 */
async function initializePushFlo() {
  try {
    // Get config from server
    const response = await fetch('/api/config');
    const config = await response.json();

    // Dynamically import PushFlo SDK
    const { PushFloClient } = await import('https://esm.sh/@pushflodev/sdk@1.0.4');

    // Create client
    pushfloClient = new PushFloClient({
      publishKey: config.publishKey,
      baseUrl: config.baseUrl,
      autoConnect: false,
      autoReconnect: true,
      debug: false,
    });

    // Set up connection state handler
    pushfloClient.onConnectionChange((state) => {
      updateConnectionStatus(state);
    });

    // Set up error handler
    pushfloClient.on('error', (error) => {
      console.error('PushFlo error:', error);
      addSystemMessage('Connection error. Reconnecting...');
    });

    // Connect
    await pushfloClient.connect();
  } catch (error) {
    console.error('Failed to initialize PushFlo:', error);
    updateConnectionStatus('error');
    addSystemMessage('Failed to connect. Please refresh the page.');
  }
}

/**
 * Update connection status display
 */
function updateConnectionStatus(state) {
  const statusText = connectionStatusEl.querySelector('.status-text');

  connectionStatusEl.className = 'connection-status ' + state;

  switch (state) {
    case 'connected':
      statusText.textContent = 'Connected';
      break;
    case 'connecting':
      statusText.textContent = 'Connecting...';
      break;
    case 'disconnected':
      statusText.textContent = 'Disconnected';
      break;
    case 'error':
      statusText.textContent = 'Connection Error';
      break;
    default:
      statusText.textContent = state;
  }
}

/**
 * Load available rooms from server
 */
async function loadRooms() {
  try {
    const response = await fetch('/api/rooms');
    const data = await response.json();

    if (data.success) {
      rooms = data.data;
      renderRoomList();
    }
  } catch (error) {
    console.error('Failed to load rooms:', error);
  }
}

/**
 * Render room list in sidebar
 */
function renderRoomList() {
  roomList.innerHTML = rooms.map(room => `
    <div class="room-item" data-room-id="${room.id}">
      <span>${room.name}</span>
    </div>
  `).join('');

  // Add click handlers
  roomList.querySelectorAll('.room-item').forEach(item => {
    item.addEventListener('click', () => {
      const roomId = item.dataset.roomId;
      const room = rooms.find(r => r.id === roomId);
      if (room && room.id !== currentRoom?.id) {
        joinRoom(room);
      }
    });
  });
}

/**
 * Join a chat room
 */
async function joinRoom(room) {
  // Leave current room first
  if (currentRoom) {
    await leaveRoom(currentRoom);
  }

  currentRoom = room;

  // Update UI
  currentRoomNameEl.textContent = room.name;
  currentRoomDescriptionEl.textContent = room.description;
  messagesList.innerHTML = '';

  // Update active room in sidebar
  roomList.querySelectorAll('.room-item').forEach(item => {
    item.classList.toggle('active', item.dataset.roomId === room.id);
  });

  // Add welcome message
  addWelcomeMessage(room);

  // Subscribe to room channel
  if (pushfloClient) {
    const channelName = `chat-${room.id}`;

    currentSubscription = pushfloClient.subscribe(channelName, {
      onMessage: handleIncomingMessage,
      onSubscribed: () => {
        console.log('Subscribed to:', channelName);
      },
      onError: (error) => {
        console.error('Subscription error:', error);
      },
    });
  }

  // Notify server of join
  try {
    const response = await fetch(`/api/rooms/${room.id}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: currentNickname }),
    });

    const data = await response.json();
    if (data.success) {
      updateUsersList(data.data.users);
    }
  } catch (error) {
    console.error('Failed to join room:', error);
  }
}

/**
 * Leave a chat room
 */
async function leaveRoom(room) {
  // Unsubscribe from channel
  if (currentSubscription) {
    currentSubscription.unsubscribe();
    currentSubscription = null;
  }

  // Notify server of leave
  try {
    await fetch(`/api/rooms/${room.id}/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: currentNickname }),
    });
  } catch (error) {
    console.error('Failed to leave room:', error);
  }
}

/**
 * Handle incoming message from PushFlo
 */
function handleIncomingMessage(message) {
  const { eventType, content } = message;

  switch (eventType) {
    case 'chat.message':
      addChatMessage(content.nickname, content.text, content.timestamp);
      break;
    case 'user.joined':
      addSystemMessage(`${content.nickname} joined the room`);
      updateUsersList(content.users);
      break;
    case 'user.left':
      addSystemMessage(`${content.nickname} left the room`);
      updateUsersList(content.users);
      break;
    default:
      console.log('Unknown event type:', eventType);
  }
}

/**
 * Handle send message form submission
 */
async function handleSendMessage(e) {
  e.preventDefault();

  const text = messageInput.value.trim();
  if (!text || !currentRoom) return;

  // Clear input immediately for better UX
  messageInput.value = '';

  try {
    const response = await fetch(`/api/rooms/${currentRoom.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nickname: currentNickname,
        text,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      console.error('Failed to send message:', data.error);
      // Restore message if failed
      messageInput.value = text;
    }
  } catch (error) {
    console.error('Failed to send message:', error);
    // Restore message if failed
    messageInput.value = text;
  }
}

/**
 * Add a chat message to the UI
 */
function addChatMessage(nickname, text, timestamp) {
  const messageEl = document.createElement('div');
  messageEl.className = 'message';

  const initial = nickname.charAt(0).toUpperCase();
  const time = formatTimestamp(timestamp);

  messageEl.innerHTML = `
    <div class="message-avatar">${initial}</div>
    <div class="message-content">
      <div class="message-header">
        <span class="message-author">${escapeHtml(nickname)}</span>
        <span class="message-timestamp">${time}</span>
      </div>
      <div class="message-text">${escapeHtml(text)}</div>
    </div>
  `;

  messagesList.appendChild(messageEl);
  scrollToBottom();
}

/**
 * Add a system message to the UI
 */
function addSystemMessage(text) {
  const messageEl = document.createElement('div');
  messageEl.className = 'message system';

  messageEl.innerHTML = `
    <div class="message-content">
      <div class="message-text">${escapeHtml(text)}</div>
    </div>
  `;

  messagesList.appendChild(messageEl);
  scrollToBottom();
}

/**
 * Add welcome message for a room
 */
function addWelcomeMessage(room) {
  const welcomeEl = document.createElement('div');
  welcomeEl.className = 'welcome-message';
  welcomeEl.innerHTML = `
    <h3>Welcome to #${escapeHtml(room.name)}!</h3>
    <p>${escapeHtml(room.description)}</p>
  `;
  messagesList.appendChild(welcomeEl);
}

/**
 * Update the users list
 */
function updateUsersList(users) {
  usersList.innerHTML = users.map(user => `
    <li>${escapeHtml(user)}</li>
  `).join('');
}

/**
 * Handle logout
 */
async function handleLogout() {
  // Leave current room
  if (currentRoom) {
    await leaveRoom(currentRoom);
  }

  // Disconnect from PushFlo
  if (pushfloClient) {
    pushfloClient.destroy();
    pushfloClient = null;
  }

  // Reset state
  currentNickname = '';
  currentRoom = null;
  rooms = [];
  currentSubscription = null;

  // Clear stored nickname
  localStorage.removeItem('chat_nickname');

  // Show login screen
  chatScreen.classList.add('hidden');
  loginScreen.classList.remove('hidden');
  nicknameInput.value = '';
  nicknameInput.focus();
}

/**
 * Format timestamp for display
 */
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
    ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Scroll messages container to bottom
 */
function scrollToBottom() {
  messagesList.scrollTop = messagesList.scrollHeight;
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', init);

// Handle page unload
window.addEventListener('beforeunload', () => {
  if (currentRoom && currentNickname) {
    // Use sendBeacon for reliable delivery
    navigator.sendBeacon(
      `/api/rooms/${currentRoom.id}/leave`,
      JSON.stringify({ nickname: currentNickname })
    );
  }
});
