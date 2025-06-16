import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function connectToNotifications(userId: string): Socket {
  // Always disconnect existing socket before creating a new one
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  // Use the same base URL as the API, fallback to localhost:3000
  const socketUrl = import.meta.env.VITE_BE_URL || 'http://localhost:3000';
  const token = localStorage.getItem('accessToken');

  if (!token) {
    console.error('[Socket] No auth token found. Cannot connect.');
    // Return a disconnected socket instance to prevent errors
    const dummySocket = io(socketUrl, { autoConnect: false });
    return dummySocket;
  }

  socket = io(`${socketUrl}/notifications`, {
    // Use auth object as the primary method (more standard for Socket.IO)
    auth: {
      token: token,
      userId: userId,
    },
    // Keep query as backup for compatibility
    query: {
      token: token,
    },
    transports: ['websocket', 'polling'], // Allow polling as fallback
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    autoConnect: true,
    upgrade: true,
  });

  socket.on('connect', () => {
    console.log('[Socket] connected with ID →', socket!.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] disconnected:', reason);
    if (reason === 'io server disconnect') {
      // The server forcefully disconnected, likely due to auth failure
      console.error(
        '[Socket] Server disconnected the client. Check authentication.',
      );
    }
  });

  socket.on('error', (error) => {
    console.error('[Socket] Error from server:', error);
  });

  socket.on('connect_error', (error) => {
    console.error('[Socket] connection error:', error.message);
    if (error.message.includes('Authentication')) {
      console.error(
        '[Socket] Authentication failed. Token may be invalid or expired.',
      );
    } else {
      console.error('[Socket] This might be because:');
      console.error('  1. Backend server is not running on port 3000');
      console.error('  2. Socket.IO is not configured on the backend');
      console.error('  3. CORS issues preventing connection');
      console.error('  4. Firewall blocking the connection');
    }
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log('[Socket] reconnected after', attemptNumber, 'attempts');
  });

  socket.on('reconnect_attempt', (attemptNumber) => {
    console.log('[Socket] reconnection attempt', attemptNumber);
  });

  socket.on('reconnect_error', (error) => {
    console.error('[Socket] reconnection failed:', error);
  });

  socket.on('reconnect_failed', () => {
    console.error('[Socket] reconnection failed permanently');
  });

  return socket;
}

export function getNotificationsSocket(): Socket | null {
  return socket;
}

export function disconnectFromNotifications() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function testSocketConnection(): boolean {
  if (socket && socket.connected) {
    console.log('[Socket] Testing connection - emitting ping');
    socket.emit('ping', { timestamp: Date.now() });
    return true;
  }
  console.log('[Socket] Cannot test - socket not connected');
  return false;
}

export function getSocketStatus(): { connected: boolean; id?: string } {
  return {
    connected: socket?.connected || false,
    id: socket?.id,
  };
}

export function emitTestNotification(userId: string) {
  if (socket && socket.connected) {
    console.log('[Socket] Emitting test notification for user:', userId);
    socket.emit('test_notification', {
      userId,
      message: 'Test notification from client',
      timestamp: Date.now(),
    });
    return true;
  }
  console.warn('[Socket] Cannot emit test notification - socket not connected');
  return false;
}

export function requestNotificationTest(userId: string) {
  if (socket && socket.connected) {
    console.log('[Socket] Requesting notification test for user:', userId);
    socket.emit('request_notification_test', { userId });
    return true;
  }
  console.warn(
    '[Socket] Cannot request notification test - socket not connected',
  );
  return false;
}
