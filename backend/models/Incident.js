const mongoose = require('mongoose');
const { REPORT_TYPES } = require('../utils/constants');

const incidentSchema = new mongoose.Schema({
    incidentId: { type: String, required: true, unique: true, index: true },
    report: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedResponder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    assignedDispatcher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    incidentType: { type: String, enum: REPORT_TYPES, required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, minlength: 10, maxlength: 2000 },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true },
        locationLabel: { type: String, trim: true, maxlength: 300 }
    },
    status: {
        type: String,
        enum: ['RECEIVED', 'UNDER_REVIEW', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'CANCELLED'],
        default: 'RECEIVED'
    },
    severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' },
    receivedAt: { type: Date, default: Date.now },
    verifiedAt: { type: Date, default: null },
    assignedAt: { type: Date, default: null },
    startedAt: { type: Date, default: null },
    resolvedAt: { type: Date, default: null },
    resolutionNotes: { type: String, trim: true, default: null },
    cancelledAt: { type: Date, default: null }
}, { timestamps: true });

incidentSchema.index({ status: 1 });
incidentSchema.index({ severity: 1 });
incidentSchema.index({ incidentType: 1 });
incidentSchema.index({ assignedResponder: 1 });
incidentSchema.index({ createdAt: -1 });
incidentSchema.index({ location: '2dsphere' });

incidentSchema.pre('save', function (next) {
    const now = new Date();
    if (this.isModified('status')) {
        if (this.status === 'RECEIVED' && !this.receivedAt) this.receivedAt = now;
        if (this.status === 'VERIFIED' && !this.verifiedAt) this.verifiedAt = now;
        if (this.status === 'ASSIGNED' && !this.assignedAt) this.assignedAt = now;
        if (this.status === 'IN_PROGRESS' && !this.startedAt) this.startedAt = now;
        if (this.status === 'RESOLVED' && !this.resolvedAt) this.resolvedAt = now;
        if (this.status === 'CLOSED' && !this.cancelledAt) this.cancelledAt = now;
    }
    if (this.isModified('assignedResponder') && this.assignedResponder && !this.assignedAt) this.assignedAt = now;
    next();
});

incidentSchema.methods.validateStatusTransition = function (newStatus) {
    const transitions = {
        RECEIVED: ['UNDER_REVIEW'],
        UNDER_REVIEW: ['VERIFIED', 'CANCELLED'],
        VERIFIED: ['ASSIGNED', 'CANCELLED'],
        ASSIGNED: ['IN_PROGRESS', 'CANCELLED'],
        IN_PROGRESS: ['RESOLVED', 'CANCELLED'],
        RESOLVED: ['CLOSED'],
        CLOSED: [],
        CANCELLED: []
    };
    const allowed = transitions[this.status];
    if (!allowed) throw new Error('Invalid status: ' + this.status);
    if (!allowed.includes(newStatus)) throw new Error('Invalid transition from ' + this.status + ' to ' + newStatus);
    return true;
};

incidentSchema.methods.canBeModifiedBy = function (userId, userRole) {
    if (userRole === 'ADMIN') return true;
    if (userRole === 'RESPONDER') return this.assignedResponder && this.assignedResponder.toString() === userId;
    if (userRole === 'DISPATCHER') return this.assignedDispatcher && this.assignedDispatcher.toString() === userId;
    return false;
};

module.exports = mongoose.model('Incident', incidentSchema);
