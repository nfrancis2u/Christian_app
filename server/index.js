const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const prayerRoutes = require('./routes/prayers');
const messageRoutes = require('./routes/messages');
const groupRoutes = require('./routes/groups');
const verseRoutes = require('./routes/verses');

const { initializeDatabase } = require('./database/init');
const { authenticateSocket } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/prayers', prayerRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/verses', verseRoutes);

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Socket.io connection handling
io.use(authenticateSocket);

const activeUsers = new Map();

io.on('connection', (socket) => {
  const userId = socket.user.id;
  
  // Store user connection
  activeUsers.set(userId, socket.id);
  
  // Join user to their personal room
  socket.join(`user_${userId}`);
  
  // Handle joining chat rooms
  socket.on('join_chat', (chatId) => {
    socket.join(`chat_${chatId}`);
  });
  
  // Handle leaving chat rooms
  socket.on('leave_chat', (chatId) => {
    socket.leave(`chat_${chatId}`);
  });
  
  // Handle private messages
  socket.on('send_message', (data) => {
    const { receiverId, content, chatId } = data;
    
    // Save message to database (implement in message routes)
    // Then emit to receiver
    const receiverSocketId = activeUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('new_message', {
        senderId: userId,
        content,
        chatId,
        timestamp: new Date().toISOString()
      });
    }
  });
  
  // Handle prayer request notifications
  socket.on('new_prayer_request', (data) => {
    socket.broadcast.emit('prayer_notification', {
      userId: userId,
      userName: socket.user.name,
      prayerTitle: data.title,
      timestamp: new Date().toISOString()
    });
  });
  
  // Handle user status updates
  socket.on('user_status_update', (status) => {
    socket.broadcast.emit('user_status_changed', {
      userId: userId,
      status: status
    });
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    activeUsers.delete(userId);
    socket.broadcast.emit('user_offline', userId);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Initialize database and start server
const PORT = process.env.PORT || 5000;

initializeDatabase().then(() => {
  server.listen(PORT, () => {
    console.log(`🙏 Christian Social Media server running on port ${PORT}`);
    console.log(`📱 API available at http://localhost:${PORT}/api`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

module.exports = { app, io };