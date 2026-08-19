// ─────────────────────────────────────────────────────────────────────────────
// middleware/auth.js — Authentication & role-based authorization middleware
// protect:  verifies JWT and attaches req.user
// authorize: restricts routes to specific roles
// ─────────────────────────────────────────────────────────────────────────────

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ── protect — verify JWT and load user ────────────────────────────────────────
const protect = async (req, res, next) => {
    let token;

    // Extract Bearer token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized — no token provided',
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Load user from DB (exclude password)
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized — user no longer exists',
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'This account has been deactivated. Contact an administrator.',
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Session expired — please log in again',
            });
        }
        return res.status(401).json({
            success: false,
            message: 'Not authorized — invalid token',
        });
    }
};

// ── authorize — restrict to allowed roles ─────────────────────────────────────
// Usage: authorize('ADMIN') or authorize('RESPONDER', 'DISPATCHER')
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized — please log in',
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied — requires role: ${roles.join(' or ')}`,
            });
        }

        next();
    };
};

module.exports = { protect, authorize };