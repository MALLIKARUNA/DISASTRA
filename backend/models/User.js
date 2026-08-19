// ─────────────────────────────────────────────────────────────────────────────
// models/User.js — Mongoose schema for DISASTRA users
// Roles: CITIZEN, RESPONDER, DISPATCHER, ADMIN
// ─────────────────────────────────────────────────────────────────────────────

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES } = require('../utils/constants');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [80, 'Name cannot exceed 80 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters'],
            select: false, // Never return password by default
        },
        role: {
            type: String,
            enum: ROLES,
            default: 'CITIZEN',
        },
        phone: {
            type: String,
            trim: true,
            match: [/^[0-9+\-\s]{7,15}$/, 'Please provide a valid phone number'],
        },
        address: {
            type: String,
            trim: true,
            maxlength: [200, 'Address cannot exceed 200 characters'],
        },
        // Responder-specific fields
        agency: {
            type: String,
            trim: true,
            maxlength: [100, 'Agency name cannot exceed 100 characters'],
        },
        designation: {
            type: String,
            trim: true,
            maxlength: [100, 'Designation cannot exceed 100 characters'],
        },
        // Dispatcher/Admin-specific fields
        department: {
            type: String,
            trim: true,
            maxlength: [100, 'Department cannot exceed 100 characters'],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        lastLoginAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform: (doc, ret) => {
                delete ret.password;
                delete ret.__v;
                return ret;
            },
        },
    }
);

// ── Pre-save: hash password ───────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// ── Instance method: compare password ─────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);