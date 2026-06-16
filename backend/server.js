const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Static Routing to Login (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Simple Mock Routes API
app.post('/api/auth/login', (req, res) => {
  const { user_id, password, role } = req.body;
  // Simple validation logic
  res.json({ success: true, token: 'mock-jwt-token-xyz', role });
});

// Mock AI endpoint
app.post('/api/ai/call', (req, res) => {
  const { prompt, systemPrompt } = req.body;
  res.json({ text: "Simulated response from Claude Sonnet matching curriculum requirements." });
});

// Socket.io Real-time Channels
io.on('connection', (socket) => {
  console.log('User connected to EduSphere real-time notification socket');
  socket.on('broadcastNotice', (data) => {
    io.emit('newNotice', data);
  });
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`EduSphere LMS Server running on http://localhost:${PORT}`);
});
