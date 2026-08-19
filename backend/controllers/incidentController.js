const Incident = require('../models/Incident');
const Report = require('../models/Report');
const User = require('../models/User');

const createIncident = async (req, res) => {
    const { reportId } = req.body;
    if (!reportId) { res.status(400); throw new Error('Report ID is required'); }
    const report = await Report.findById(reportId);
    if (!report) { res.status(404); throw new Error('Report not found'); }
    const existing = await Incident.findOne({ report: reportId });
    if (existing) { res.status(409); throw new Error('Incident already exists for this report'); }
    const incident = await Incident.create({
        incidentId: `INC-${Date.now().toString().slice(-6)}`,
        report: reportId,
        createdBy: req.user.id,
        assignedDispatcher: req.user.id,
        title: report.reportType,
        description: report.description,
        incidentType: report.reportType,
        severity: 'MEDIUM',
        status: 'RECEIVED',
        location: report.location,
        locationLabel: report.locationLabel,
    });
    await Report.findByIdAndUpdate(reportId, { status: 'RECEIVED' });
    res.status(201).json({ success: true, data: incident });
};

const getIncidents = async (req, res) => {
    const { status, severity, incidentType } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (incidentType) filter.incidentType = incidentType;
    const incidents = await Incident.find(filter)
        .populate('report', 'reportType description locationLabel')
        .populate('assignedResponder', 'name email')
        .populate('assignedDispatcher', 'name email')
        .sort({ createdAt: -1 });
    res.json({ success: true, count: incidents.length, data: incidents });
};

const getIncident = async (req, res) => {
    const incident = await Incident.findById(req.params.id)
        .populate('report', 'reportType description locationLabel imageUrl citizen')
        .populate('assignedResponder', 'name email phone')
        .populate('assignedDispatcher', 'name email');
    if (!incident) { res.status(404); throw new Error('Incident not found'); }
    if (req.user.role === 'RESPONDER' && incident.assignedResponder && incident.assignedResponder._id.toString() !== req.user.id) {
        res.status(403); throw new Error('Not authorized to view this incident');
    }
    res.json({ success: true, data: incident });
};

const updateIncident = async (req, res) => {
    const incident = await Incident.findById(req.params.id);
    if (!incident) { res.status(404); throw new Error('Incident not found'); }
    if (!incident.canBeModifiedBy(req.user.id, req.user.role)) { res.status(403); throw new Error('Not authorized'); }
    if (req.body.title) incident.title = req.body.title;
    if (req.body.description) incident.description = req.body.description;
    if (req.body.severity) incident.severity = req.body.severity;
    if (req.body.priority) incident.priority = req.body.priority;
    if (req.body.locationLabel) incident.locationLabel = req.body.locationLabel;
    await incident.save();
    res.json({ success: true, data: incident });
};

const updateIncidentStatus = async (req, res) => {
    const incident = await Incident.findById(req.params.id);
    if (!incident) { res.status(404); throw new Error('Incident not found'); }
    if (!incident.canBeModifiedBy(req.user.id, req.user.role)) { res.status(403); throw new Error('Not authorized'); }
    try {
        incident.validateStatusTransition(req.body.status);
    } catch (e) {
        res.status(400);
        throw e;
    }
    incident.status = req.body.status;
    const now = new Date();
    if (req.body.status === 'RECEIVED' && !incident.receivedAt) incident.receivedAt = now;
    if (req.body.status === 'VERIFIED' && !incident.verifiedAt) incident.verifiedAt = now;
    if (req.body.status === 'ASSIGNED' && !incident.assignedAt) incident.assignedAt = now;
    if (req.body.status === 'IN_PROGRESS' && !incident.startedAt) incident.startedAt = now;
    if (req.body.status === 'RESOLVED' && !incident.resolvedAt) incident.resolvedAt = now;
    if (req.body.status === 'CLOSED' && !incident.cancelledAt) incident.cancelledAt = now;
    if (req.body.status === 'RESOLVED' && req.body.resolutionNotes) {
        incident.resolutionNotes = req.body.resolutionNotes;
    } else if (req.body.status === 'RESOLVED' && !incident.resolutionNotes) {
        res.status(400); throw new Error('Resolution notes are required when resolving an incident');
    }
    await incident.save();
    res.json({ success: true, data: incident });
};

const assignResponder = async (req, res) => {
    const { responderId } = req.body;
    const incident = await Incident.findById(req.params.id);
    if (!incident) { res.status(404); throw new Error('Incident not found'); }
    if (req.user.role !== 'DISPATCHER' && req.user.role !== 'ADMIN') { res.status(403); throw new Error('Not authorized'); }
    const responder = await User.findById(responderId);
    if (!responder) { res.status(404); throw new Error('Responder not found'); }
    if (responder.role !== 'RESPONDER') { res.status(400); throw new Error('User is not a responder'); }
    incident.assignedResponder = responderId;
    incident.status = 'ASSIGNED';
    incident.assignedAt = new Date();
    await incident.save();
    res.json({ success: true, data: incident });
};

const getIncidentStats = async (req, res) => {
    const all = await Incident.find();
    const formatted = { total: all.length, received: 0, underReview: 0, verified: 0, assigned: 0, inProgress: 0, resolved: 0, closed: 0, cancelled: 0, critical: 0, high: 0 };
    all.forEach(inc => {
        formatted[inc.status] = (formatted[inc.status] || 0) + 1;
        if (inc.severity === 'CRITICAL') formatted.critical++;
        if (inc.severity === 'HIGH') formatted.high++;
    });
    res.json({ success: true, data: formatted });
};

module.exports = { createIncident, getIncidents, getIncident, updateIncident, updateIncidentStatus, assignResponder, getIncidentStats };
