import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import { setupWSConnection } from 'y-websocket/bin/utils';
import WebSocket from 'ws';

const WebSocketServer = WebSocket.Server;
dotenv.config();

const app = express();

const isProd = process.env.NODE_ENV === 'production';
const PROD_DOMAIN = 'https://live-docs-produc.vercel.app';

const corsOriginCheck = (origin, callback) => {
  if (!origin || !isProd) {
    return callback(null, true);
  }
  const cleanOrigin = origin.replace(/\/$/, '');
  if (cleanOrigin === PROD_DOMAIN.replace(/\/$/, '')) {
    return callback(null, true);
  }
  return callback(new Error('Not allowed by CORS'));
};

app.use(cors({
  origin: corsOriginCheck,
  credentials: true,
  methods: ['GET', 'POST'],
}));

app.use(express.json());

const httpServer = createServer(app);

// 1. Socket.io for generic real-time events (presence, notifications, live comments)
const io = new Server(httpServer, {
  cors: {
    origin: corsOriginCheck,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

app.post('/api/notify', (req, res) => {
  const { recipientEmail, notification } = req.body;
  if (recipientEmail && notification) {
    io.to(`user_${recipientEmail}`).emit('new_notification', notification);
    return res.json({ success: true });
  }
  return res.status(400).json({ error: 'recipientEmail and notification are required' });
});

const PORT = process.env.PORT || 3001;

// Map of rooms to active users (email -> socketId)
const roomUsers = new Map();
// Map of userEmail -> socketId for personal notifications
const activeConnections = new Map();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('register_user', (email) => {
    activeConnections.set(email, socket.id);
    socket.join(`user_${email}`);
  });

  socket.on('join_document', ({ documentId, user, email }) => {
    socket.join(documentId);
    if (!roomUsers.has(documentId)) {
      roomUsers.set(documentId, new Map());
    }

    const userData = user || { email, name: email ? email.split('@')[0] : 'User', avatar: '' };
    const userEmail = userData.email || email;

    if (userEmail) {
      roomUsers.get(documentId).set(userEmail, {
        ...userData,
        socketId: socket.id,
      });
      // Broadcast updated active users list in this document
      const activeList = Array.from(roomUsers.get(documentId).values());
      io.to(documentId).emit('active_users', activeList);
      socket.to(documentId).emit('user_joined', userData);
    }
  });

  socket.on('leave_document', ({ documentId, email }) => {
    socket.leave(documentId);
    const usersInRoom = roomUsers.get(documentId);
    if (usersInRoom && email) {
      usersInRoom.delete(email);
      const activeList = Array.from(usersInRoom.values());
      io.to(documentId).emit('active_users', activeList);
      if (usersInRoom.size === 0) {
        roomUsers.delete(documentId);
      }
    }
    socket.to(documentId).emit('user_left', { email });
  });

  socket.on('update_title', ({ documentId, title }) => {
    socket.to(documentId).emit('receive_title_update', { title });
  });

  socket.on('add_comment', (commentData) => {
    const { documentId } = commentData;
    io.to(documentId).emit('receive_comment', commentData);
  });

  socket.on('delete_comment', ({ documentId, commentId }) => {
    io.to(documentId).emit('receive_comment_delete', { commentId });
  });

  socket.on('share_document', (data) => {
    const { recipientEmail, notification } = data;
    if (recipientEmail) {
      io.to(`user_${recipientEmail}`).emit('new_notification', notification || data);
    }
  });

  socket.on('send_notification', ({ recipientEmail, notification }) => {
    if (recipientEmail && notification) {
      io.to(`user_${recipientEmail}`).emit('new_notification', notification);
    }
  });

  socket.on('disconnect', () => {
    roomUsers.forEach((users, documentId) => {
      for (const [email, userObj] of users.entries()) {
        if (userObj.socketId === socket.id || userObj === socket.id) {
          users.delete(email);
          const activeList = Array.from(users.values());
          io.to(documentId).emit('active_users', activeList);
          socket.to(documentId).emit('user_left', { email });
        }
      }
    });
    for (const [email, sid] of activeConnections.entries()) {
      if (sid === socket.id) {
        activeConnections.delete(email);
      }
    }
  });
});

// 2. Y-Websocket for TipTap CRDTs
const wss = new WebSocketServer({ noServer: true });

httpServer.on('upgrade', (request, socket, head) => {
  // Skip Socket.io connections so they don't collide with raw Yjs websockets
  if (!request.url.startsWith('/socket.io')) {
    if (isProd) {
      const origin = request.headers.origin;
      const cleanOrigin = origin ? origin.replace(/\/$/, '') : '';
      if (origin && cleanOrigin !== PROD_DOMAIN.replace(/\/$/, '')) {
        socket.destroy();
        return;
      }
    }
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
});

wss.on('connection', (conn, req) => {
  setupWSConnection(conn, req);
});

httpServer.listen(PORT, () => {
  console.log(`Socket.io and Y-Websocket server running on port ${PORT}`);
});
