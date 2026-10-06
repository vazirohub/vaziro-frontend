import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

const getSocketBaseUrl = (): string => {
  const isLocal =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  if (isLocal) {
    return 'http://localhost:5000';
  }

  // Production API origin
  return import.meta.env.VITE_WS_URL || 'https://api.vaziro.in';
};

export const initSocket = (): Socket | null => {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem('vaziro_token');
  if (!token) {
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
    }
    return null;
  }

  if (socketInstance && socketInstance.connected) {
    return socketInstance;
  }

  const baseUrl = getSocketBaseUrl();

  socketInstance = io(baseUrl, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
  });

  socketInstance.on('connect', () => {
    // Connected to Vaziro Real-Time Engine
  });

  socketInstance.on('connect_error', (_err) => {
    // Socket connection error
  });

  return socketInstance;
};

export const getSocket = (): Socket | null => {
  if (!socketInstance || !socketInstance.connected) {
    return initSocket();
  }
  return socketInstance;
};

export const disconnectSocket = (): void => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

export const joinConversationRoom = (conversationId: string): void => {
  const socket = getSocket();
  if (socket) {
    socket.emit('conversation:join', { conversationId });
  }
};

export const leaveConversationRoom = (conversationId: string): void => {
  const socket = getSocket();
  if (socket) {
    socket.emit('conversation:leave', { conversationId });
  }
};

export const sendTypingStart = (conversationId: string): void => {
  const socket = getSocket();
  if (socket) {
    socket.emit('typing:start', { conversationId });
  }
};

export const sendTypingStop = (conversationId: string): void => {
  const socket = getSocket();
  if (socket) {
    socket.emit('typing:stop', { conversationId });
  }
};
