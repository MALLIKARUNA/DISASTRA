// ─────────────────────────────────────────────────────────────────────────────
// routes/health.js — Health check endpoint
// Returns server status, uptime, DB connection state, and environment info
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// GET /api/health
router.get('/', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  }[dbState] || 'unknown';

  const health = {
    success: true,
    message: 'DISASTRA API is operational',
    project: 'DISASTRA — Adaptive Multi-Hazard Disaster Response Platform',
    version: '1.0.0',
    phase: 'Phase 2 — Authentication + Roles',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    database: {
      status: dbStatus,
      host: mongoose.connection.host || 'not connected',
      name: mongoose.connection.name || 'not connected',
    },
    server: {
      port: process.env.PORT || 5000,
      nodeVersion: process.version,
      platform: process.platform,
    },
  };

  const statusCode = dbState === 1 ? 200 : 503;
  res.status(statusCode).json(health);
});

module.exports = router;
