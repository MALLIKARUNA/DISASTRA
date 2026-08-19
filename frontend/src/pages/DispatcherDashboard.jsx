// ─────────────────────────────────────────────────────────────────────────────
// pages/DispatcherDashboard.jsx — Dispatcher role dashboard
// Phase 2: profile overview + dispatch operations placeholder for Phase 4
// ─────────────────────────────────────────────────────────────────────────────

import { Headset, Building2, ShieldAlert, Radio, MapPin, Users, CheckCircle2, Clock } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';

export default function DispatcherDashboard() {
    const { user } = useAuth();

    const stats = [
        { label: 'Active Incidents', value: '0', icon: MapPin, color: 'text-purple-400' },
        { label: 'Responders On Duty', value: '0', icon: Users, color: 'text-blue-400' },
        { label: 'Pending Dispatch', value: '0', icon: Clock, color: 'text-amber-400' },
        { label: 'Resolved', value: '0', icon: CheckCircle2, color: 'text-green-400' },
    ];

    return (
        <DashboardLayout
            title="Dispatcher Dashboard"
            subtitle="Emergency operations coordination"
            icon={Headset}
        >
            {/* ── Welcome banner ─────────────────────────────────────────────────── */}
            <div className="glass-card p-6 mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-white">
                            Welcome, {user?.name?.split(' ')[0]} 🎧
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Coordinate responders and manage incident dispatch from the operations center.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 bg-purple-600/10 border border-purple-500/20 rounded-lg px-4 py-2">
                        <ShieldAlert className="w-4 h-4 text-purple-400" />
                        <span className="text-xs text-purple-300 font-medium">DISPATCHER ACCESS</span>
                    </div>
                </div>
            </div>

            {/* ── Stats grid ─────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="glass-card p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
                            <Icon className={`w-4 h-4 ${color}`} />
                        </div>
                        <p className="text-3xl font-black text-white">{value}</p>
                    </div>
                ))}
            </div>

            {/* ── Two-column: Profile + Phase 4 placeholder ──────────────────────── */}
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
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full border text-purple-400 border-purple-500/30 bg-purple-600/20">
                                DISPATCHER
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-white/5">
                            <span className="text-sm text-gray-500">Department</span>
                            <span className="text-sm text-gray-200 flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5 text-gray-600" />
                                {user?.department || '—'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-gray-500">Phone</span>
                            <span className="text-sm text-gray-200">{user?.phone || '—'}</span>
                        </div>
                    </div>
                </div>

                {/* Phase 4 placeholder */}
                <div className="glass-card p-6 flex flex-col">
                    <h3 className="text-sm font-semibold text-white mb-4">Dispatch Operations</h3>
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                        <div className="w-14 h-14 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center mb-4">
                            <Radio className="w-7 h-7 text-purple-400" />
                        </div>
                        <p className="text-sm text-gray-400 font-medium">Coming in Phase 4</p>
                        <p className="text-xs text-gray-600 mt-1 max-w-xs">
                            Incident management and dispatch coordination will be available in the next phase.
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-xs text-gray-600">
                            <MapPin className="w-3 h-3" />
                            <span>Live incident tracking</span>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-gray-600">
                            <Users className="w-3 h-3" />
                            <span>Responder assignment</span>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}