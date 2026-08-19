// ─────────────────────────────────────────────────────────────────────────────
// routes/reports.js — Citizen SOS / Disaster Report routes
// POST   /api/reports          — Create a report (CITIZEN)
// GET    /api/reports/my       — List current citizen's reports
// GET    /api/reports/:id      — Get a single report (own only)
// PATCH  /api/reports/:id/cancel — Cancel a report (own, SUBMITTED only)
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const upload = require('../middleware/upload');
const { REPORT_TYPES } = require('../utils/constants');
const {
    createReport,
    getMyReports,
    getReportById,
    cancelReport,
} = require('../controllers/reportController');

const router = express.Router();

// ── Validation rules ──────────────────────────────────────────────────────────

const createReportValidation = [
    body('reportType')
        .trim()
        .notEmpty().withMessage('Disaster/emergency type is required')
        .isIn(REPORT_TYPES).withMessage(`Report type must be one of: ${REPORT_TYPES.join(', ')}`),
    body('description')
        .trim()
        .notEmpty().withMessage('Description is required')
        .isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
    body('latitude')
        .notEmpty().withMessage('Latitude is required')
        .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
    body('longitude')
        .notEmpty().withMessage('Longitude is required')
        .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
    body('locationLabel')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 300 }).withMessage('Location label cannot exceed 300 characters'),
];

// ── All report routes require authentication + CITIZEN role ──────────────────
router.use(protect, authorize('CITIZEN'));

// POST /api/reports — create report (optional image upload)
router.post(
    '/',
    upload.single('image'),
    createReportValidation,
    validate,
    createReport
);

// GET /api/reports/my — list own reports
router.get('/my', getMyReports);

// PATCH /api/reports/:id/cancel — cancel a report (must come before :id
// to avoid :id matching 'cancel')
router.patch('/:id/cancel', cancelReport);

// GET /api/reports/:id — get own report
router.get('/:id', getReportById);

module.exports = router;