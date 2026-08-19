// ─────────────────────────────────────────────────────────────────────────────
// DISASTRA Backend — server.js
// Entry point for the Express API server
// ─────────────────────────────────────────────────────────────────────────────

require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const rateLimiter = require('./middleware/rateLimiter');

// ── Route imports ─────────────────────────────────────────────────────────────
const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const incidentRoutes = require('./routes/incidentRoutes');

// ─────────────────────────────────────────────────────────────────────────────
// Connect to MongoDB
// ─────────────────────────────────────────────────────────────────────────────
connectDB();

// ─────────────────────────────────────────────────────────────────────────────
// App initialisation
// ─────────────────────────────────────────────────────────────────────────────
const app = express();

// ── Security middleware ───────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Rate limiter ──────────────────────────────────────────────────────────────
app.use('/api/', rateLimiter);

// ── Request parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── HTTP request logger (dev only) ───────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Static uploads ────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─────────────────────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────────────────────
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/incidents', incidentRoutes);

// Future phases will mount routes here:
// app.use('/api/incidents', require('./routes/incidents'));
// app.use('/api/resources', require('./routes/resources'));
// app.use('/api/alerts',    require('./routes/alerts'));
// app.use('/api/shelters',  require('./routes/shelters'));
// app.use('/api/hospitals', require('./routes/hospitals'));

// ─────────────────────────────────────────────────────────────────────────────
// Error handlers (must be last)
// ─────────────────────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─────────────────────────────────────────────────────────────────────────────
// Start server
// ─────────────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║          DISASTRA API SERVER — RUNNING           ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║  Port    : ${PORT}                                   ║`);
  console.log(`║  Mode    : ${process.env.NODE_ENV}                        ║`);
  console.log(`║  Health  : http://localhost:${PORT}/api/health       ║`);
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received — shutting down gracefully');
  server.close(() => process.exit(0));
});

module.exports = app;
