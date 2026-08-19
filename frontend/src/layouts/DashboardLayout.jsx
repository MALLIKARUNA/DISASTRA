// ─────────────────────────────────────────────────────────────────────────────
// layouts/DashboardLayout.jsx — Shared layout for role dashboards
// Top bar with brand, user info, role badge, and logout
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Radio, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// Role display metadata
const roleMeta = {
    CITIZEN: { label: 'Citizen', color: 'text-blue-400 border-blue-500/30 bg-blue-600/20' },
    RESPONDER: { label: 'Responder', color: 'text-orange-400 border-orange-500/30 bg-orange-600/20' },
    DISPATCHER: { label: 'Dispatcher', color: 'text-purple-400 border-purple-500/30 bg-purple-600/20' },
    ADMIN: { label: 'Admin', color: 'text-red-400 border-red-500/30 bg-red-600/20' },
};

export default function DashboardLayout({ title, subtitle, icon: Icon, children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [loggingOut, setLoggingOut] = useState(false);

    const role = roleMeta[user?.role] || roleMeta.CITIZEN;

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await logout();
            toast.success('Logged out successfully');
            navigate('/login', { replace: true });
        } catch {
            toast.error('Failed to log out');
            setLoggingOut(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0e1a] text-gray-100 font-['Inter'] flex flex-col">
            {/* ── Top bar ─────────────────────────────────────────────────────────── */}
            <header className="border-b border-white/5 bg-[#111827]/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    {/* Brand */}
                    <Link to="/" className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center">
                            <Shield className="w-4 h-4 text-red-400" />
                        </div>
                        <div>
                            <span className="text-sm font-black tracking-tight text-white">
                                DIS<span className="text-red-500">ASTRA</span>
                            </span>
                            <span className="hidden sm:inline text-xs text-gray-600 ml-2">Operations Center</span>
                        </div>
                    </Link>

                    {/* User info + logout */}
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-sm font-medium text-white leading-tight">{user?.name}</p>
                                <p className="text-xs text-gray-500 leading-tight">{user?.email}</p>
                            </div>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${role.color}`}>
                                {role.label}
                            </span>
                        </div>
                        <button
                            onClick={handleLogout}
                            disabled={loggingOut}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-red-500/40 hover:bg-red-600/10 transition-colors text-sm disabled:opacity-50"
                        >
                            {loggingOut ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <LogOut className="w-4 h-4" />
                            )}
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* ── Page header ─────────────────────────────────────────────────────── */}
            <div className="border-b border-white/5 bg-[#0d1220]">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center gap-3">
                        {Icon && (
                            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center">
                                <Icon className="w-5 h-5 text-red-400" />
                            </div>
                        )}
                        <div>
                            <h1 className="text-xl font-bold text-white">{title}</h1>
                            <p className="text-sm text-gray-500">{subtitle}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Content ─────────────────────────────────────────────────────────── */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
                {children}
            </main>

            {/* ── Footer ──────────────────────────────────────────────────────────── */}
            <footer className="border-t border-white/5 py-4">
                <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-xs text-gray-700">
                    <div className="flex items-center gap-2">
                        <Radio className="w-3 h-3" />
                        <span>DISASTRA — Smart India Hackathon Demo Platform</span>
                    </div>
                    <span>Simulated data only. Not real emergency operations.</span>
                </div>
            </footer>
        </div>
    );
}