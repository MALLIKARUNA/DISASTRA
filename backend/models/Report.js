// ─────────────────────────────────────────────────────────────────────────────
// models/Report.js — Mongoose schema for Citizen SOS / Disaster Reports
// Phase 3: Citizen-reported incidents. Phase 4 will extend for responder workflow.
// ─────────────────────────────────────────────────────────────────────────────

const mongoose = require('mongoose');
const { REPORT_TYPES, REPORT_STATUSES } = require('../utils/constants');

const reportSchema = new mongoose.Schema(
    {
        // Citizen who submitted the report (from authenticated JWT — never from body)
        citizen: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Citizen reference is required'],
            index: true,
        },
        reportType: {
            type: String,
            enum: REPORT_TYPES,
            required: [true, 'Disaster/emergency type is required'],
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
            minlength: [10, 'Description must be at least 10 characters'],
            maxlength: [2000, 'Description cannot exceed 2000 characters'],
        },
        // GPS location
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: [true, 'Location coordinates are required'],
                validate: {
                    validator: (coords) => {
                        if (!Array.isArray(coords) || coords.length !== 2) return false;
                        const [lng, lat] = coords;
                        return (
                            typeof lng === 'number' && typeof lat === 'number' &&
                            lng >= -180 && lng <= 180 &&
                            lat >= -90 && lat <= 90
                        );
                    },
                    message: 'Invalid coordinates — longitude must be -180..180 and latitude -90..90',
                },
            },
        },
        // Human-readable location info (optional)
        locationLabel: {
            type: String,
            trim: true,
            maxlength: [300, 'Location label cannot exceed 300 characters'],
        },
        // Optional photo/evidence (Phase 3 minimal — Phase 7 will build full evidence system)
        imageUrl: {
            type: String,
            trim: true,
            maxlength: [500, 'Image URL cannot exceed 500 characters'],
        },
        status: {
            type: String,
            enum: REPORT_STATUSES,
            default: 'SUBMITTED',
        },
        // Auto-set when status changes (Phase 4 will add more workflow transitions)
        receivedAt: {
            type: Date,
            default: null,
        },
        cancelledAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                delete ret.__v;
                return ret;
            },
        },
    }
);

// Geo index for future Phase 5 GIS (no-op now, but prepared)
reportSchema.index({ location: '2dsphere' });

// ── Status change hook: set status timestamps ─────────────────────────────────
reportSchema.pre('save', function (next) {
    const now = new Date();
    if (this.isModified('status')) {
        if (this.status === 'RECEIVED' && !this.receivedAt) {
            this.receivedAt = now;
        }
        if (this.status === 'CANCELLED' && !this.cancelledAt) {
            this.cancelledAt = now;
        }
    }
    next();
});

module.exports = mongoose.model('Report', reportSchema);