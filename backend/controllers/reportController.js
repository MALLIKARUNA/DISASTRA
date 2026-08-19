// ─────────────────────────────────────────────────────────────────────────────
// controllers/reportController.js — Citizen SOS / Disaster Report logic
// Phase 3: Citizen-only report creation, retrieval, cancellation
// ─────────────────────────────────────────────────────────────────────────────

const Report = require('../models/Report');
const { REPORT_TYPES, REPORT_STATUSES } = require('../utils/constants');

// ── Helper: build report response (no sensitive data) ─────────────────────────
const buildReportResponse = (report) => ({
    id: report._id,
    citizen: report.citizen,
    reportType: report.reportType,
    description: report.description,
    location: report.location,
    locationLabel: report.locationLabel || undefined,
    imageUrl: report.imageUrl || undefined,
    status: report.status,
    receivedAt: report.receivedAt,
    cancelledAt: report.cancelledAt,
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
});

// ── POST /api/reports ─────────────────────────────────────────────────────────
// @desc  Create a new citizen disaster report
// @access Private (CITIZEN)
const createReport = async (req, res) => {
    const { reportType, description, latitude, longitude, locationLabel } = req.body;

    // Use authenticated user from JWT — never trust body-supplied citizen ID
    const citizenId = req.user.id;

    // Coordinates: [longitude, latitude] per GeoJSON spec
    const lng = parseFloat(longitude);
    const lat = parseFloat(latitude);

    if (isNaN(lng) || isNaN(lat)) {
        return res.status(400).json({
            success: false,
            message: 'Valid latitude and longitude are required',
        });
    }

    // Build image URL if a file was uploaded (optional)
    let imageUrl;
    if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`;
    }

    const report = await Report.create({
        citizen: citizenId,
        reportType,
        description,
        location: {
            type: 'Point',
            coordinates: [lng, lat],
        },
        locationLabel: locationLabel || undefined,
        imageUrl,
    });

    res.status(201).json({
        success: true,
        message: 'Report created successfully',
        report: buildReportResponse(report),
    });
};

// ── GET /api/reports/my ───────────────────────────────────────────────────────
// @desc  Get all reports created by the authenticated citizen
// @access Private (CITIZEN)
const getMyReports = async (req, res) => {
    const reports = await Report.find({ citizen: req.user.id })
        .sort({ createdAt: -1 })
        .lean();

    res.status(200).json({
        success: true,
        count: reports.length,
        reports: reports.map(buildReportResponse),
    });
};

// ── GET /api/reports/:id ──────────────────────────────────────────────────────
// @desc  Get a single report belonging to the authenticated citizen
// @access Private (CITIZEN)
const getReportById = async (req, res) => {
    const { id } = req.params;

    let report;
    try {
        report = await Report.findById(id).lean();
    } catch {
        // Invalid ObjectId
        return res.status(404).json({
            success: false,
            message: 'Report not found',
        });
    }

    // Citizen can only access their own reports
    if (!report || report.citizen.toString() !== req.user.id.toString()) {
        return res.status(404).json({
            success: false,
            message: 'Report not found',
        });
    }

    res.status(200).json({
        success: true,
        report: buildReportResponse(report),
    });
};

// ── PATCH /api/reports/:id/cancel ─────────────────────────────────────────────
// @desc  Cancel a submitted report (only if still SUBMITTED)
// @access Private (CITIZEN)
const cancelReport = async (req, res) => {
    const { id } = req.params;

    let report;
    try {
        report = await Report.findById(id);
    } catch {
        return res.status(404).json({
            success: false,
            message: 'Report not found',
        });
    }

    // Ownership check
    if (!report || report.citizen.toString() !== req.user.id.toString()) {
        return res.status(404).json({
            success: false,
            message: 'Report not found',
        });
    }

    // Only SUBMITTED reports can be cancelled
    if (report.status === 'CANCELLED') {
        return res.status(400).json({
            success: false,
            message: 'Report is already cancelled',
        });
    }
    if (report.status !== 'SUBMITTED') {
        return res.status(400).json({
            success: false,
            message: 'Only reports in SUBMITTED status can be cancelled',
        });
    }

    report.status = 'CANCELLED';
    await report.save();

    res.status(200).json({
        success: true,
        message: 'Report cancelled successfully',
        report: buildReportResponse(report),
    });
};

module.exports = { createReport, getMyReports, getReportById, cancelReport };