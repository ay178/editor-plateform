require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'https://editor-plateform-uvr1.vercel.app',
      'https://editor-plateform.vercel.app',
      'http://localhost:3000'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// ── Create uploads folder if not exists ──
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// ── Middleware ──
app.use(cors({
  origin: [
    'https://editor-plateform-uvr1.vercel.app',
    'https://editor-plateform-vermaprakhar44-9325s-projects.vercel.app',  // ← add karo
    'https://editorhire.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// ── Static files ──
app.use('/uploads', express.static('uploads'));

// ── Routes ──
app.use('/api', require('./routes/auth'));
app.use('/api/editors', require('./routes/editors'));
app.use('/api/hire', require('./routes/hire'));
app.use('/api/review', require('./routes/review'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/payment', require('./routes/payment'));

// ── Health Check ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// ── Socket.IO ──
const onlineUsers = new Map();
const collaborationRooms = new Map();

io.on('connection', (socket) => {

  // User joins
  socket.on('user:join', (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit('users:online', Array.from(onlineUsers.keys()));
  });

  // Chat message
  socket.on('message:send', (data) => {
    const receiverSocketId = onlineUsers.get(data.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('message:receive', data);
    }
  });

  // ── Collaboration Room ──
  socket.on('collab:join', ({ roomId, userId, userName }) => {
    socket.join(roomId);

    if (!collaborationRooms.has(roomId)) {
      collaborationRooms.set(roomId, {
        users: [],
        content: '',
        comments: [],
        timeline: []
      });
    }

    const room = collaborationRooms.get(roomId);

    const existing = room.users.find(u => u.userId === userId);
    if (!existing) {
      room.users.push({ userId, userName, socketId: socket.id });
    }

    socket.emit('collab:state', room);
    socket.to(roomId).emit('collab:user-joined', { userId, userName });
    io.to(roomId).emit('collab:users', room.users);
  });

  socket.on('collab:content-update', ({ roomId, content, userId }) => {
    if (collaborationRooms.has(roomId)) {
      collaborationRooms.get(roomId).content = content;
    }
    socket.to(roomId).emit('collab:content-updated', { content, userId });
  });

  socket.on('collab:add-comment', ({ roomId, comment }) => {
    if (collaborationRooms.has(roomId)) {
      const room = collaborationRooms.get(roomId);
      const newComment = {
        id: Date.now(),
        ...comment,
        timestamp: new Date()
      };
      room.comments.push(newComment);
      io.to(roomId).emit('collab:comment-added', newComment);
    }
  });

  socket.on('collab:timeline-marker', ({ roomId, marker }) => {
    if (collaborationRooms.has(roomId)) {
      const room = collaborationRooms.get(roomId);
      const newMarker = { id: Date.now(), ...marker };
      room.timeline.push(newMarker);
      io.to(roomId).emit('collab:marker-added', newMarker);
    }
  });

  socket.on('collab:cursor', ({ roomId, userId, userName, position }) => {
    socket.to(roomId).emit('collab:cursor-update', {
      userId, userName, position
    });
  });

  socket.on('collab:leave', ({ roomId, userId }) => {
    socket.leave(roomId);
    if (collaborationRooms.has(roomId)) {
      const room = collaborationRooms.get(roomId);
      room.users = room.users.filter(u => u.userId !== userId);
      io.to(roomId).emit('collab:users', room.users);
      socket.to(roomId).emit('collab:user-left', { userId });
    }
  });

  socket.on('disconnect', () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit('users:online', Array.from(onlineUsers.keys()));

    for (const [roomId, room] of collaborationRooms.entries()) {
      const userIndex = room.users.findIndex(
        u => u.socketId === socket.id
      );
      if (userIndex !== -1) {
        const userId = room.users[userIndex].userId;
        room.users.splice(userIndex, 1);
        io.to(roomId).emit('collab:users', room.users);
        io.to(roomId).emit('collab:user-left', { userId });
      }
    }
  });
});

// ── MongoDB + Server Start ──
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
  family: 4,  // Force IPv4 — SRV issue fix karta hai
})
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });