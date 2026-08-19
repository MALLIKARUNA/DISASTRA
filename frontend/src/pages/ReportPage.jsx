// ─────────────────────────────────────────────────────────────────────────────
// pages/ReportPage.jsx — Citizen SOS / Disaster Report creation
// Phase 3: disaster type → GPS location → description → optional photo → submit
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    Siren, MapPin, Loader2, AlertCircle, CheckCircle2, ImagePlus, X,
    Upload, Navigation, Radio
} from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../services/api';
import toast from 'react-hot-toast';

// Disaster/emergency types (must match backend REPORT_TYPES)
const REPORT_TYPES = [
    { value: 'FLOOD', label: 'Flood', icon: '🌊', color: 'border-blue-500/40 text-blue-400 hover:bg-blue-600/20' },
    { value: 'FIRE', label: 'Fire', icon: '🔥', color: 'border-red-500/40 text-red-400 hover:bg-red-600/20' },
    { value: 'EARTHQUAKE', label: 'Earthquake', icon: '🏚️', color: 'border-orange-500/40 text-orange-400 hover:bg-orange-600/20' },
    { value: 'LANDSLIDE', label: 'Landslide', icon: '⛰️', color: 'border-amber-600/40 text-amber-400 hover:bg-amber-600/20' },
    { value: 'CYCLONE', label: 'Cyclone', icon: '🌀', color: 'border-teal-500/40 text-teal-400 hover:bg-teal-600/20' },
    { value: 'STORM', label: 'Storm', icon: '⛈️', color: 'border-indigo-500/40 text-indigo-400 hover:bg-indigo-600/20' },
    { value: 'ACCIDENT', label: 'Accident', icon: '🚗', color: 'border-yellow-500/40 text-yellow-400 hover:bg-yellow-600/20' },
    { value: 'BUILDING_COLLAPSE', label: 'Building Collapse', icon: '🏢', color: 'border-rose-500/40 text-rose-400 hover:bg-rose-600/20' },
    { value: 'MEDICAL_EMERGENCY', label: 'Medical Emergency', icon: '🏥', color: 'border-pink-500/40 text-pink-400 hover:bg-pink-600/20' },
    { value: 'OTHER', label: 'Other', icon: '❗', color: 'border-gray-500/40 text-gray-400 hover:bg-gray-600/20' },
];

// Geolocation states
const LOCATION_STATES = {
    IDLE: 'idle',
    LOADING: 'loading',
    SUCCESS: 'success',
    ERROR: 'error',
};

// Friendly error messages for geolocation failures
const geoErrorMessages = {
    PERMISSION_DENIED: 'Location permission was denied. Please enable location access and try again.',
    POSITION_UNAVAILABLE: 'Your current location could not be determined. Please try again or move to an area with better signal.',
    TIMEOUT: 'Location request timed out. Please try again.',
    NOT_SUPPORTED: 'Your browser does not support geolocation. Please enter coordinates manually.',
};

export default function ReportPage() {
    const fileInputRef = useRef(null);

    const [reportType, setReportType] = useState('');
    const [description, setDescription] = useState('');
    const [locationLabel, setLocationLabel] = useState('');

    // Location state
    const [locationState, setLocationState] = useState(LOCATION_STATES.IDLE);
    const [coords, setCoords] = useState(null); // { lat, lng }
    const [geoError, setGeoError] = useState('');

    // Photo state
    const [photo, setPhoto] = useState(null); // File object
    const [photoPreview, setPhotoPreview] = useState('');
    const [photoError, setPhotoError] = useState('');

    // Submission state
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [successReport, setSuccessReport] = useState(null);

    // ── Geolocation ─────────────────────────────────────────────────────────────
    const getLocation = () => {
        setGeoError('');
        setLocationState(LOCATION_STATES.LOADING);
        setCoords(null);

        if (!navigator.geolocation) {
            setGeoError(geoErrorMessages.NOT_SUPPORTED);
            setLocationState(LOCATION_STATES.ERROR);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setCoords({
                    lat: parseFloat(pos.coords.latitude.toFixed(6)),
                    lng: parseFloat(pos.coords.longitude.toFixed(6)),
                });
                setLocationState(LOCATION_STATES.SUCCESS);
                toast.success('Location captured successfully');
            },
            (err) => {
                const msg =
                    err.code === err.PERMISSION_DENIED
                        ? geoErrorMessages.PERMISSION_DENIED
                        : err.code === err.POSITION_UNAVAILABLE
                            ? geoErrorMessages.POSITION_UNAVAILABLE
                            : err.code === err.TIMEOUT
                                ? geoErrorMessages.TIMEOUT
                                : 'Failed to get location. Please try again.';
                setGeoError(msg);
                setLocationState(LOCATION_STATES.ERROR);
                toast.error(msg);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    // ── Photo handling ──────────────────────────────────────────────────────────
    const handlePhotoSelect = (e) => {
        const file = e.target.files?.[0];
        setPhotoError('');

        if (!file) {
            setPhoto(null);
            setPhotoPreview('');
            return;
        }

        // Validate type
        if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
            setPhotoError('Only images (JPEG, PNG, WebP, GIF) are allowed.');
            setPhoto(null);
            setPhotoPreview('');
            e.target.value = '';
            return;
        }

        // Validate size (5MB max — matches backend)
        if (file.size > 5 * 1024 * 1024) {
            setPhotoError('Image must be 5MB or smaller.');
            setPhoto(null);
            setPhotoPreview('');
            e.target.value = '';
            return;
        }

        setPhoto(file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const removePhoto = () => {
        setPhoto(null);
        setPhotoPreview('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ── Submit ──────────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        // Client-side validation
        if (!reportType) {
            setFormError('Please select a disaster/emergency type.');
            return;
        }
        if (description.trim().length < 10) {
            setFormError('Description must be at least 10 characters.');
            return;
        }
        if (!coords) {
            setFormError('Please capture your current location before submitting. Click "Get My Location".');
            return;
        }

        setSubmitting(true);
        try {
            // Build FormData for multipart (supports optional image)
            const formData = new FormData();
            formData.append('reportType', reportType);
            formData.append('description', description.trim());
            formData.append('latitude', String(coords.lat));
            formData.append('longitude', String(coords.lng));
            if (locationLabel.trim()) formData.append('locationLabel', locationLabel.trim());
            if (photo) formData.append('image', photo);

            const res = await api.post('/reports', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setSuccessReport(res.data.report);
            toast.success('Report submitted successfully!');
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to submit report. Please try again.';
            setFormError(msg);
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    // ── Success view ────────────────────────────────────────────────────────────
    if (successReport) {
        return (
            <DashboardLayout title="Report Submitted" subtitle="Your emergency report has been received" icon={CheckCircle2}>
                <div className="max-w-lg mx-auto">
                    <div className="glass-card p-8 text-center animate-slide-up">
                        <div className="w-16 h-16 rounded-full bg-green-600/20 border border-green-500/40 flex items-center justify-center mx-auto mb-5">
                            <CheckCircle2 className="w-8 h-8 text-green-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Report Submitted</h2>
                        <p className="text-sm text-gray-400 mb-6">
                            Your report has been received and is being processed. Keep this reference handy.
                        </p>

                        <div className="bg-[#1f2937] border border-white/10 rounded-lg p-4 mb-6 text-left space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Report ID</span>
                                <span className="text-white font-mono text-xs">{successReport.id}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Type</span>
                                <span className="text-white">{successReport.reportType}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Status</span>
                                <span className="text-amber-400 font-semibold">{successReport.status}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Location</span>
                                <span className="text-white text-xs">
                                    {successReport.location?.coordinates?.[1]?.toFixed(4)}, {successReport.location?.coordinates?.[0]?.toFixed(4)}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link
                                to="/citizen/reports"
                                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
                            >
                                View My Reports
                            </Link>
                            <Link
                                to="/citizen"
                                className="px-5 py-2.5 border border-white/10 hover:border-red-500/40 hover:bg-red-600/10 text-gray-300 hover:text-white rounded-lg text-sm font-semibold transition-colors"
                            >
                                Back to Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Report Emergency" subtitle="Report a disaster or emergency in your area" icon={Siren}>
            <div className="max-w-3xl mx-auto">
                {/* Emergency banner */}
                <div className="glass-card p-4 mb-6 border-red-500/30 bg-red-900/20">
                    <div className="flex items-center gap-3">
                        <Siren className="w-5 h-5 text-red-400 animate-pulse" />
                        <div>
                            <p className="text-sm font-semibold text-red-300">EMERGENCY REPORT</p>
                            <p className="text-xs text-red-400/70">
                                Use this to report a disaster or emergency. For immediate life-threatening situations, call your local emergency number first.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Error banner */}
                {formError && (
                    <div className="mb-6 flex items-start gap-3 bg-red-900/30 border border-red-500/30 rounded-lg px-4 py-3">
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-300">{formError}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* ── Step 1: Disaster Type ─────────────────────────────────────────── */}
                    <div className="glass-card p-6">
                        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center text-[11px] font-bold text-red-400">1</span>
                            Select Disaster / Emergency Type
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                            {REPORT_TYPES.map(({ value, label, icon, color }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setReportType(value)}
                                    className={`
                    flex flex-col items-center gap-1.5 px-2 py-3 rounded-lg border text-xs font-medium transition-all
                    ${reportType === value
                                            ? 'border-red-500/60 bg-red-600/20 text-white ring-1 ring-red-500/30'
                                            : `border-white/10 text-gray-400 ${color}`
                                        }
                  `}
                                >
                                    <span className="text-xl">{icon}</span>
                                    <span className="text-center leading-tight">{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Step 2: Location ──────────────────────────────────────────────── */}
                    <div className="glass-card p-6">
                        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center text-[11px] font-bold text-red-400">2</span>
                            Your Location
                        </h3>

                        {/* Get location button / status */}
                        <div className="flex items-center gap-3 mb-3">
                            <button
                                type="button"
                                onClick={getLocation}
                                disabled={locationState === LOCATION_STATES.LOADING}
                                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors"
                            >
                                {locationState === LOCATION_STATES.LOADING ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Navigation className="w-4 h-4" />
                                )}
                                {locationState === LOCATION_STATES.LOADING ? 'Getting location...' : locationState === LOCATION_STATES.SUCCESS ? 'Refresh Location' : 'Get My Location'}
                            </button>

                            <span className="text-xs text-gray-500 flex items-center gap-1.5">
                                <Radio className="w-3 h-3" />
                                Uses your browser's GPS
                            </span>
                        </div>

                        {/* Location status display */}
                        {locationState === LOCATION_STATES.SUCCESS && coords && (
                            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 mb-3 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-green-400 text-sm">
                                    <MapPin className="w-4 h-4" />
                                    <span className="font-mono text-xs">
                                        {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                                    </span>
                                </div>
                                <span className="text-xs text-green-300 bg-green-600/20 px-2 py-0.5 rounded-full">CAPTURED</span>
                            </div>
                        )}

                        {geoError && (
                            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 mb-3 flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-red-300">{geoError}</p>
                            </div>
                        )}

                        {locationState === LOCATION_STATES.IDLE && (
                            <div className="bg-[#1f2937] border border-white/10 rounded-lg p-3 mb-3 flex items-center gap-2 text-xs text-gray-500">
                                <MapPin className="w-4 h-4 text-gray-600" />
                                Location not captured yet. Click "Get My Location" to share your GPS position.
                            </div>
                        )}

                        {/* Optional location label */}
                        <div>
                            <label htmlFor="locationLabel" className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                                Location Description (optional)
                            </label>
                            <input
                                id="locationLabel"
                                type="text"
                                value={locationLabel}
                                onChange={(e) => setLocationLabel(e.target.value)}
                                placeholder="e.g., Near MG Road metro station, Bengaluru"
                                maxLength={300}
                                className="w-full bg-[#1f2937] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors"
                            />
                        </div>
                    </div>

                    {/* ── Step 3: Description ───────────────────────────────────────────── */}
                    <div className="glass-card p-6">
                        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center text-[11px] font-bold text-red-400">3</span>
                            Describe the Situation
                        </h3>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={5}
                            placeholder="Describe what is happening. Include the severity, how many people are affected, and any other important details..."
                            minLength={10}
                            maxLength={2000}
                            className="w-full bg-[#1f2937] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors resize-y"
                        />
                        <div className="mt-1 text-right text-xs text-gray-600">
                            {description.length} / 2000
                        </div>
                    </div>

                    {/* ── Step 4: Optional Photo ────────────────────────────────────────── */}
                    <div className="glass-card p-6">
                        <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center text-[11px] font-bold text-red-400">4</span>
                            Add Photo Evidence (optional)
                        </h3>
                        <p className="text-xs text-gray-500 mb-4">Add a photo of the situation if you can. Max 5MB.</p>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={handlePhotoSelect}
                            className="hidden"
                        />

                        {!photo ? (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full border-2 border-dashed border-white/10 hover:border-red-500/40 rounded-lg py-8 flex flex-col items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors"
                            >
                                <Upload className="w-6 h-6" />
                                <span className="text-sm">Click to attach a photo</span>
                            </button>
                        ) : (
                            <div className="relative">
                                <img src={photoPreview} alt="Preview" className="w-full max-h-64 object-cover rounded-lg border border-white/10" />
                                <button
                                    type="button"
                                    onClick={removePhoto}
                                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 border border-white/20 flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                                    aria-label="Remove photo"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <p className="mt-2 text-xs text-green-400 flex items-center gap-1.5">
                                    <ImagePlus className="w-3 h-3" />
                                    {photo.name}
                                </p>
                            </div>
                        )}

                        {photoError && (
                            <p className="mt-2 text-xs text-red-400 flex items-center gap-1.5">
                                <AlertCircle className="w-3 h-3" />
                                {photoError}
                            </p>
                        )}
                    </div>

                    {/* ── Submit ────────────────────────────────────────────────────────── */}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg py-3.5 text-sm font-bold tracking-wide uppercase transition-colors flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Submitting Report...
                            </>
                        ) : (
                            <>
                                <Siren className="w-5 h-5" />
                                Submit Report
                            </>
                        )}
                    </button>

                    <p className="text-center text-xs text-gray-600">
                        By submitting, you confirm this information is accurate to the best of your knowledge.
                        This is a simulated platform for demo purposes.
                    </p>
                </form>
            </div>
        </DashboardLayout>
    );
}