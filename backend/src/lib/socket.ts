import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

export const initSocket = (server: NetServer) => {
  const allowedOrigin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const io = new SocketIOServer(server, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: allowedOrigin,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (_socket) => {
    // connection established — no logging in production
  });

  return io;
};
