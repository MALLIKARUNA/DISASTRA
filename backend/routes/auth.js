// ─────────────────────────────────────────────────────────────────────────────
// routes/auth.js — Authentication routes
// POST   /api/auth/register  — Register a new user
// POST   /api/auth/login     — Login and get JWT
// GET    /api/auth/me        — Get current user (protected)
// POST   /api/auth/logout    — Logout (protected)
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { ROLES } = require('../utils/constants');

const router = express.Router();

// ── Validation rules ──────────────────────────────────────────────────────────

const registerValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 80 }).withMessage('Name must be between 2 and 80 characters'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/[A-Za-z]/).withMessage('Password must contain at least one letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one number'),
    body('phone')
        .optional({ values: 'falsy' })
        .trim()
        .matches(/^[0-9+\-\s]{7,15}$/).withMessage('Please provide a valid phone number'),
    body('address')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 200 }).withMessage('Address cannot exceed 200 characters'),
    body('role')
        .optional({ values: 'falsy' })
        .isIn(ROLES).withMessage(`Role must be one of: ${ROLES.join(', ')}`),
    body('agency')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 100 }).withMessage('Agency cannot exceed 100 characters'),
    body('designation')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 100 }).withMessage('Designation cannot exceed 100 characters'),
    body('department')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 100 }).withMessage('Department cannot exceed 100 characters'),
];

const loginValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required'),
];

// ── Routes ────────────────────────────────────────────────────────────────────

// POST /api/auth/register
router.post('/register', registerValidation, validate, register);

// POST /api/auth/login
router.post('/login', loginValidation, validate, login);

// GET /api/auth/me — protected
router.get('/me', protect, getMe);

// POST /api/auth/logout — protected
router.post('/logout', protect, logout);

module.exports = router;