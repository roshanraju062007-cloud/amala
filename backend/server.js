/**
 * EduSphere LMS — Main Server (PostgreSQL + JWT Auth)
 * Amala Higher Secondary School
 */
require('dotenv').config();

const express      = require('express');
const http         = require('http');
const socketIo     = require('socket.io');
const cookieParser = require('cookie-parser');
const cors         = require('cors');
const path         = require('path');

const compression  = require('compression');

const app    = express();
const server = http.createServer(app);
const io     = socketIo(server, {
  cors: { origin: '*', methods: ['GET','POST'] }
});

const PORT = parseInt(process.env.PORT, 10) || 3000;
const MAX_PORT_TRIES = 10;

// ── MIDDLEWARE ────────────────────────────────────────────────────────────────
app.use(compression()); // Compress all responses
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Redirect legacy/cached buggy redirects to the root login page
app.get([
  '/pages/index.html',
  '/pages/admin/index.html',
  '/pages/teacher/index.html',
  '/pages/student/index.html',
  '/pages/parent/index.html'
], (req, res) => {
  res.redirect('/index.html');
});

// ── STATIC FILES ──────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.static(path.join(__dirname, '..'), {
  maxAge: '1d',
  etag: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html') || filePath.endsWith('.js')) {
      // Never cache HTML or JS so updates are immediate
      res.setHeader('Cache-Control', 'no-cache');
    } else {
      // Cache CSS, fonts, images for 1 day
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }
}));

// ── USER CONTEXT MIDDLEWARE (FOR ROW LEVEL SECURITY) ──────────────────────────
const jwt = require('jsonwebtoken');
const { authStorage, pool } = require('./db');
const JWT_SECRET = process.env.JWT_SECRET || 'edusphere_secret_key';

app.use((req, res, next) => {
  const token =
    req.cookies?.edusphere_token ||
    (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null);

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded; // Populate globally
      authStorage.run(decoded, next);
      return;
    } catch (err) {
      // Ignore: routers will handle invalid sessions themselves
    }
  }
  next();
});

// ── API ROUTES ────────────────────────────────────────────────────────────────
const authRoutes      = require('./routes/auth');
const studentRoutes   = require('./routes/students');
const teacherRoutes   = require('./routes/teachers');
const libraryRoutes   = require('./routes/library');
const transportRoutes = require('./routes/transport');
const analyticsRoutes = require('./routes/analytics');
const settingsRoutes  = require('./routes/settings');
const examRoutes      = require('./routes/exams');
const messageRoutes   = require('./routes/messages');

const {
  classRouter, subjectRouter, attendanceRouter, resultsRouter,
  feesRouter, noticesRouter, assignmentsRouter, materialsRouter,
  timetableRouter, parentsRouter
} = require('./routes/api');

app.use('/api/auth',        authRoutes);
app.use('/api/students',    studentRoutes);
app.use('/api/teachers',    teacherRoutes);
app.use('/api/classes',     classRouter);
app.use('/api/subjects',    subjectRouter);
app.use('/api/attendance',  attendanceRouter);
app.use('/api/results',     resultsRouter);
app.use('/api/fees',        feesRouter);
app.use('/api/notices',     noticesRouter);
app.use('/api/assignments', assignmentsRouter);
app.use('/api/materials',   materialsRouter);
app.use('/api/timetable',   timetableRouter);
app.use('/api/parents',     parentsRouter);
app.use('/api/library',     libraryRoutes);
app.use('/api/transport',   transportRoutes);
app.use('/api/analytics',   analyticsRoutes);
app.use('/api/settings',    settingsRoutes);
app.use('/api/exams',       examRoutes);
app.use('/api/messages',    messageRoutes);

// ── HEALTH CHECK ──────────────────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'OK', database: 'PostgreSQL connected', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ status: 'ERROR', database: err.message });
  }
});

// ── SERVE SPA ─────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// ── SOCKET.IO REAL-TIME MESSAGING ────────────────────────────────────────────
const JWT_SECRET_WS = JWT_SECRET; // re-use already declared JWT_SECRET


io.use((socket, next) => {
  // Authenticate socket via token in handshake
  const token = socket.handshake.auth?.token ||
                socket.handshake.query?.token;
  if (token) {
    try {
      socket.user = jwt.verify(token, JWT_SECRET_WS);
    } catch (e) {
      // Allow unauthenticated sockets for broadcasts
    }
  }
  next();
});

io.on('connection', (socket) => {
  const uid = socket.user?.userId || 'anonymous';
  console.log(`Socket connected: ${socket.id} (${uid})`);

  // Join a named room
  socket.on('joinRoom', (room) => {
    socket.join(room);
  });

  // Global notice broadcast (admin use)
  socket.on('broadcastNotice', (data) => {
    io.emit('newNotice', data);
  });

  // Real-time message send with DB persistence
  socket.on('sendMessage', async (data) => {
    const { room_id, receiver_id, content } = data;
    if (!content || !room_id || !receiver_id) return;
    if (!socket.user) return socket.emit('error', { message: 'Not authenticated' });

    const sender_id = socket.user.userId;

    try {
      const client = await pool.connect();
      try {
        // Set RLS context
        await client.query(`SET LOCAL app.current_user_id  = '${sender_id}'`);
        await client.query(`SET LOCAL app.current_user_role = '${socket.user.role}'`);
        await client.query(`SET LOCAL app.current_db_id    = '${socket.user.dbId || ''}'`);

        const result = await client.query(
          `INSERT INTO messages (sender_id, receiver_id, room_id, content)
           VALUES ($1,$2,$3,$4) RETURNING *`,
          [sender_id, receiver_id, room_id, content.trim()]
        );
        const msg = result.rows[0];

        // Get sender name
        const userRes = await client.query(`SELECT name, role FROM users WHERE user_id = $1`, [sender_id]);
        const senderInfo = userRes.rows[0] || {};

        const payload = {
          ...msg,
          sender_name: senderInfo.name || sender_id,
          sender_role: senderInfo.role || socket.user.role,
        };

        // Broadcast to room (both sender and receiver)
        io.to(room_id).emit('newMessage', payload);
      } finally {
        client.release();
      }
    } catch (err) {
      console.error('Socket sendMessage error:', err.message);
      socket.emit('messageError', { message: 'Failed to send message.' });
    }
  });

  // Mark messages as read
  socket.on('markRead', async (data) => {
    const { room_id } = data;
    if (!socket.user || !room_id) return;
    try {
      await pool.query(
        `UPDATE messages SET is_read = TRUE WHERE room_id = $1 AND receiver_id = $2 AND is_read = FALSE`,
        [room_id, socket.user.userId]
      );
    } catch (err) {}
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id} (${uid})`);
  });
});

// ── START SERVER ──────────────────────────────────────────────────────────────
function startServer(port, attempt = 0) {
  const onError = (err) => {
    if (err.code === 'EADDRINUSE' && attempt < MAX_PORT_TRIES) {
      const nextPort = port + 1;
      console.warn(`Port ${port} is already in use. Trying ${nextPort}...`);
      server.removeListener('error', onError);
      startServer(nextPort, attempt + 1);
      return;
    }

    console.error(`Failed to start server on port ${port}:`, err.message);
    process.exit(1);
  };

  server.once('error', onError);

  server.listen(port, () => {
    server.removeListener('error', onError);
    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log('║        EduSphere LMS — Server Started            ║');
    console.log('╠══════════════════════════════════════════════════╣');
    console.log(`║  URL:      http://localhost:${port}                   ║`);
    console.log(`║  Database: PostgreSQL @ ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}            ║`);
    console.log(`║  Auth:     JWT + bcrypt                           ║`);
    console.log(`║  Mode:     ${process.env.NODE_ENV || 'development'}                           ║`);
    console.log('╚══════════════════════════════════════════════════╝\n');
  });
}

startServer(PORT);
