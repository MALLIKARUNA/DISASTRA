// ─────────────────────────────────────────────────────────────────────────────
// pages/CitizenDashboard.jsx — Citizen role dashboard
// Phase 3: real SOS/report CTA + live My Reports count + recent reports
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Users, MapPin, ShieldAlert, Siren, FileText, Clock, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

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

const formatDate = (iso) => {
    if (!iso) return '';
    try {
        return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch {
        return iso;
    }
};

export default function CitizenDashboard() {
    const { user } = useAuth();
    const [reports, setReports] = useState(null); // null = loading
    const [stats, setStats] = useState({ total: 0, submitted: 0, received: 0, cancelled: 0 });

    // ── Load user's reports for live stats + recent list ──────────────────────
    const loadReports = useCallback(async () => {
        try {
            const res = await api.get('/reports/my');
            const list = res.data.reports || [];
            setReports(list);
            setStats({
                total: list.length,
                submitted: list.filter((r) => r.status === 'SUBMITTED').length,
                received: list.filter((r) => r.status === 'RECEIVED').length,
                cancelled: list.filter((r) => r.status === 'CANCELLED').length,
            });
        } catch {
            setReports([]);
        }
    }, []);

    useEffect(() => {
        loadReports();
    }, [loadReports]);

    const statCards = [
        { label: 'My Reports', value: stats.total, icon: FileText, color: 'text-blue-400' },
        { label: 'Active SOS', value: stats.submitted + stats.received, icon: Siren, color: 'text-red-400' },
        { label: 'Received', value: stats.received, icon: Clock, color: 'text-amber-400' },
        { label: 'Cancelled', value: stats.cancelled, icon: CheckCircle2, color: 'text-gray-400' },
    ];

    return (
        <DashboardLayout
            title="Citizen Dashboard"
            subtitle="Your personal emergency response hub"
            icon={Users}
        >
            {/* ── Welcome banner ─────────────────────────────────────────────────── */}
            <div className="glass-card p-6 mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-white">
                            Welcome, {user?.name?.split(' ')[0]} 👋
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Your safety is our priority. Report incidents and request help when you need it.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 rounded-lg px-4 py-2">
                        <ShieldAlert className="w-4 h-4 text-blue-400" />
                        <span className="text-xs text-blue-300 font-medium">CITIZEN ACCESS</span>
                    </div>
                </div>
            </div>

            {/* ── Emergency action ───────────────────────────────────────────────── */}
            <Link
                to="/citizen/report"
                className="block glass-card p-6 mb-8 border-red-500/40 bg-red-900/20 hover:bg-red-900/30 transition-colors group"
            >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-red-600/30 border border-red-500/40 flex items-center justify-center relative">
                            <Siren className="w-7 h-7 text-red-400 group-hover:scale-110 transition-transform" />
                            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border-2 border-[#0a0e1a]">
                                <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-60" />
                            </span>
                        </div>
                        <div>
                            <p className="text-lg font-bold text-white group-hover:text-red-300 transition-colors">
                                🚨 Report Emergency
                            </p>
                            <p className="text-sm text-gray-400">
                                Submit a disaster or emergency report with your current GPS location
                            </p>
                        </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-red-400 group-hover:translate-x-1 transition-transform hidden sm:block" />
                </div>
            </Link>

            {/* ── Stats grid ─────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="glass-card p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
                            <Icon className={`w-4 h-4 ${color}`} />
                        </div>
                        <p className="text-3xl font-black text-white">{value}</p>
                    </div>
                ))}
            </div>

            {/* ── Two-column: Profile + Recent Reports ───────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profile card */}
                <div className="glass-card p-6">
                    <h3 className="text-sm font-semibold text-white mb-4">My Profile</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-white/5">
                            <span className="text-sm text-gray-500">Name</span>
                            <span className="text-sm text-gray-200">{user?.name}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-white/5">
                            <span className="text-sm text-gray-500">Email</span>
                            <span className="text-sm text-gray-200">{user?.email}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-white/5">
                            <span className="text-sm text-gray-500">Role</span>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full border text-blue-400 border-blue-500/30 bg-blue-600/20">
                                CITIZEN
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-white/5">
                            <span className="text-sm text-gray-500">Phone</span>
                            <span className="text-sm text-gray-200">{user?.phone || '—'}</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-gray-500">Address</span>
                            <span className="text-sm text-gray-200 text-right">{user?.address || '—'}</span>
                        </div>
                    </div>
                </div>

                {/* Recent reports card */}
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-white">Recent Reports</h3>
                        <Link
                            to="/citizen/reports"
                            className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
                        >
                            View All
                            <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>

                    {reports === null ? (
                        <div className="flex items-center justify-center py-10">
                            <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center py-10">
                            <div className="w-12 h-12 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center mb-3">
                                <FileText className="w-6 h-6 text-red-400" />
                            </div>
                            <p className="text-sm text-gray-500">No reports yet</p>
                            <p className="text-xs text-gray-600 mt-1 mb-4">
                                Submit your first emergency report now.
                            </p>
                            <Link
                                to="/citizen/report"
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors"
                            >
                                <Siren className="w-3 h-3" />
                                Report Emergency
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {reports.slice(0, 4).map((report) => (
                                <div
                                    key={report.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-[#1f2937] border border-white/5 hover:border-white/10 transition-colors"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-8 h-8 rounded-lg bg-red-600/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                                            <Siren className="w-4 h-4 text-red-400" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-white truncate">
                                                {REPORT_TYPE_LABELS[report.reportType] || report.reportType}
                                            </p>
                                            <p className="text-xs text-gray-600 flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {formatDate(report.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <StatusBadge status={report.status} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}