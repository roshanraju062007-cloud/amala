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

const PORT = process.env.PORT || 3000;

// ── MIDDLEWARE ────────────────────────────────────────────────────────────────
app.use(compression()); // Compress all responses
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── STATIC FILES ──────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '..'), {
  maxAge: '1d',
  etag: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      // Never cache HTML so updates are immediate
      res.setHeader('Cache-Control', 'no-cache');
    } else {
      // Cache CSS, JS, fonts, images for 1 day
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }
}));

// ── USER CONTEXT MIDDLEWARE (FOR ROW LEVEL SECURITY) ──────────────────────────
const jwt = require('jsonwebtoken');
const { authStorage } = require('./db');
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
const authRoutes    = require('./routes/auth');
const studentRoutes = require('./routes/students');
const teacherRoutes = require('./routes/teachers');
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

// ── HEALTH CHECK ──────────────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  const { pool } = require('./db');
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

// ── SOCKET.IO REAL-TIME ───────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  socket.on('broadcastNotice', (data) => {
    io.emit('newNotice', data);
  });

  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// ── START SERVER ──────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║        EduSphere LMS — Server Started            ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║  URL:      http://localhost:${PORT}                   ║`);
  console.log(`║  Database: PostgreSQL @ ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}            ║`);
  console.log(`║  Auth:     JWT + bcrypt                           ║`);
  console.log(`║  Mode:     ${process.env.NODE_ENV || 'development'}                           ║`);
  console.log('╚══════════════════════════════════════════════════╝\n');
});
