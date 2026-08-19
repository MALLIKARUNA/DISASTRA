// ─────────────────────────────────────────────────────────────────────────────
// pages/MyReportsPage.jsx — Citizen's submitted reports
// Phase 3: list own reports with status, type, location, time
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    FileText, MapPin, Clock, Loader2, AlertCircle, Inbox, Siren, XCircle
} from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import StatusBadge from '../components/StatusBadge';
import api from '../services/api';
import toast from 'react-hot-toast';

// Report type display labels
const REPORT_TYPE_LABELS = {
    FLOOD: 'Flood',
    FIRE: 'Fire',
    EARTHQUAKE: 'Earthquake',
    LANDSLIDE: 'Landslide',
    CYCLONE: 'Cyclone',
    STORM: 'Storm',
    ACCIDENT: 'Accident',
    BUILDING_COLLAPSE: 'Building Collapse',
    MEDICAL_EMERGENCY: 'Medical Emergency',
    OTHER: 'Other',
};

// Format date to a friendly local string
const formatDate = (iso) => {
    if (!iso) return '';
    try {
        return new Date(iso).toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return iso;
    }
};

export default function MyReportsPage() {
    const [reports, setReports] = useState(null); // null = loading
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cancellingId, setCancellingId] = useState(null);

    // ── Load reports ────────────────────────────────────────────────────────────
    const loadReports = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/reports/my');
            setReports(res.data.reports || []);
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to load your reports.';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadReports();
    }, [loadReports]);

    // ── Cancel a report ─────────────────────────────────────────────────────────
    const handleCancel = async (reportId) => {
        if (!window.confirm('Are you sure you want to cancel this report?')) return;

        setCancellingId(reportId);
        try {
            const res = await api.patch(`/reports/${reportId}/cancel`);
            toast.success('Report cancelled');
            // Update local list
            setReports((prev) =>
                prev.map((r) => (r.id === reportId ? res.data.report : r))
            );
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to cancel report.';
            toast.error(msg);
        } finally {
            setCancellingId(null);
        }
    };

    return (
        <DashboardLayout title="My Reports" subtitle="Track the status of your submitted reports" icon={FileText}>
            <div className="mb-6">
                <Link
                    to="/citizen/report"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                    <Siren className="w-4 h-4" />
                    Report New Emergency
                </Link>
            </div>

            {/* Error banner */}
            {error && (
                <div className="mb-6 flex items-start gap-3 bg-red-900/30 border border-red-500/30 rounded-lg px-4 py-3">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-300">{error}</p>
                </div>
            )}

            {/* Loading state */}
            {loading && (
                <div className="glass-card p-12 flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 text-red-500 animate-spin mb-3" />
                    <p className="text-sm text-gray-500">Loading your reports...</p>
                </div>
            )}

            {/* Empty state */}
            {!loading && !error && reports && reports.length === 0 && (
                <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
                    <div className="w-14 h-14 rounded-2xl bg-red-600/10 border border-red-500/20 flex items-center justify-center mb-4">
                        <Inbox className="w-7 h-7 text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">No reports yet</h3>
                    <p className="text-sm text-gray-500 mb-6 max-w-sm">
                        You haven't submitted any disaster or emergency reports. If you need help, report an emergency now.
                    </p>
                    <Link
                        to="/citizen/report"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
                    >
                        <Siren className="w-4 h-4" />
                        Report Emergency
                    </Link>
                </div>
            )}

            {/* Reports list */}
            {!loading && !error && reports && reports.length > 0 && (
                <div className="space-y-4">
                    {reports.map((report) => (
                        <div key={report.id} className="glass-card p-5">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
                                {/* Left: type + status */}
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                                        <Siren className="w-5 h-5 text-red-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">
                                            {REPORT_TYPE_LABELS[report.reportType] || report.reportType}
                                        </p>
                                        <p className="text-xs text-gray-500 font-mono">{report.id}</p>
                                    </div>
                                </div>

                                {/* Right: status + cancel */}
                                <div className="flex items-center gap-3">
                                    <StatusBadge status={report.status} />
                                    {report.status === 'SUBMITTED' && (
                                        <button
                                            onClick={() => handleCancel(report.id)}
                                            disabled={cancellingId === report.id}
                                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-white/10 text-gray-500 hover:text-red-400 hover:border-red-500/40 transition-colors text-xs"
                                        >
                                            {cancellingId === report.id ? (
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                            ) : (
                                                <XCircle className="w-3 h-3" />
                                            )}
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-gray-400 mb-3 line-clamp-2">{report.description}</p>

                            {/* Meta row */}
                            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="w-3 h-3" />
                                    {report.locationLabel || (
                                        <span className="font-mono">
                                            {report.location?.coordinates?.[1]?.toFixed(4)}, {report.location?.coordinates?.[0]?.toFixed(4)}
                                        </span>
                                    )}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Clock className="w-3 h-3" />
                                    {formatDate(report.createdAt)}
                                </span>
                                {report.imageUrl && (
                                    <span className="text-blue-400">📷 Photo attached</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}