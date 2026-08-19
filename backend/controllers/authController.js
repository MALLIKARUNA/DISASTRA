// ─────────────────────────────────────────────────────────────────────────────
// controllers/authController.js — Authentication logic
// Register, Login, Get Current User, Logout
// ─────────────────────────────────────────────────────────────────────────────

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ROLES } = require('../utils/constants');

// ── Helper: sign JWT ──────────────────────────────────────────────────────────
const signToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d',
    });
};

// ── Helper: build user response (never includes password) ─────────────────────
const buildUserResponse = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || undefined,
    address: user.address || undefined,
    agency: user.agency || undefined,
    designation: user.designation || undefined,
    department: user.department || undefined,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
});

// ── POST /api/auth/register ───────────────────────────────────────────────────
// @desc  Register a new user (default role: CITIZEN)
// @access Public
const register = async (req, res) => {
    const { name, email, password, phone, address, role, agency, designation, department } = req.body;

    // Only allow ADMIN to create non-CITIZEN roles; public registration is CITIZEN only
    let assignedRole = 'CITIZEN';
    if (role && role !== 'CITIZEN') {
        const requestingUser = req.user;
        if (!requestingUser || requestingUser.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Only an ADMIN can create accounts with a role other than CITIZEN',
            });
        }
        if (!ROLES.includes(role)) {
            return res.status(400).json({
                success: false,
                message: `Invalid role. Allowed roles: ${ROLES.join(', ')}`,
            });
        }
        assignedRole = role;
    }

    // Check if user already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
        return res.status(409).json({
            success: false,
            message: 'An account with this email already exists',
        });
    }

    const user = await User.create({
        name,
        email,
        password,
        role: assignedRole,
        phone,
        address,
        agency,
        designation,
        department,
    });

    const token = signToken(user._id);

    res.status(201).json({
        success: true,
        message: 'Account created successfully',
        token,
        user: buildUserResponse(user),
    });
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────
// @desc  Authenticate user and return JWT
// @access Public
const login = async (req, res) => {
    const { email, password } = req.body;

    // Fetch user with password field (select: false by default)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
        return res.status(401).json({
            success: false,
            message: 'Invalid email or password',
        });
    }

    // Check if account is active
    if (!user.isActive) {
        return res.status(403).json({
            success: false,
            message: 'This account has been deactivated. Contact an administrator.',
        });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        return res.status(401).json({
            success: false,
            message: 'Invalid email or password',
        });
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(user._id);

    res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: buildUserResponse(user),
    });
};

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
// @desc  Get currently authenticated user
// @access Private
const getMe = async (req, res) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found',
        });
    }

    res.status(200).json({
        success: true,
        user: buildUserResponse(user),
    });
};

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
// @desc  Logout (stateless JWT — client discards token)
// @access Private
const logout = (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Logged out successfully',
    });
};

module.exports = { register, login, getMe, logout };