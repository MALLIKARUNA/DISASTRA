// ─────────────────────────────────────────────────────────────────────────────
// middleware/upload.js — Minimal single-photo upload middleware (Phase 3)
// Uses multer (already a dependency). Phase 7 will replace with full evidence system.
// -------------------------------------------------------------
// Optional: allows a single image attachment on a report.
// If no file is sent, the middleware simply calls next() — the report
// does NOT require a photo.
// ─────────────────────────────────────────────────────────────────────────────

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_PATH || path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage: original filename + timestamp to avoid collisions
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        cb(null, `${Date.now()}-${safeName}`);
    },
});

const fileFilter = (req, file, cb) => {
    // Allow common image types only
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (JPEG, PNG, WebP, GIF) are allowed'), false);
    }
};

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880', 10); // default 5MB

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE },
});

// Export a single-field uploader named 'image' — optional field
module.exports = upload;