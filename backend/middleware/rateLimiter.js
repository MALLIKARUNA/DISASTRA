// ─────────────────────────────────────────────────────────────────────────────
// middleware/rateLimiter.js — API rate limiting
// ─────────────────────────────────────────────────────────────────────────────

const rateLimit = require('express-rate-limit');

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,                  // Limit each IP to 500 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  skip: (req) => process.env.NODE_ENV === 'development', // Skip in dev
});

module.exports = rateLimiter;
