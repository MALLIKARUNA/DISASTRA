// ─────────────────────────────────────────────────────────────────────────────
// pages/LoginPage.jsx — DISASTRA authentication login
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Mail, Lock, Loader2, AlertCircle, Eye, EyeOff, Radio } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// Role → dashboard route mapping
const roleHome = {
    CITIZEN: '/citizen',
    RESPONDER: '/responder',
    DISPATCHER: '/dispatcher',
    ADMIN: '/admin',
};

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const from = location.state?.from?.pathname || null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email.trim() || !password) {
            setError('Please enter both email and password.');
            return;
        }

        setSubmitting(true);
        try {
            const user = await login(email.trim(), password);
            toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
            // Redirect to requested page or role dashboard
            const target = from || roleHome[user.role] || '/';
            navigate(target, { replace: true });
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed. Please try again.';
            setError(msg);
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0e1a] text-gray-100 font-['Inter'] flex flex-col">
            {/* ── Top bar ─────────────────────────────────────────────────────────── */}
            <div className="border-b border-white/5 bg-[#111827]/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-gray-500">
                        <Radio className="w-3 h-3" />
                        <span>DISASTRA OPERATIONS CENTER</span>
                        <span className="mx-2 text-white/10">|</span>
                        <span>Phase 2 — Authentication</span>
                    </div>
                    <Link to="/" className="text-gray-500 hover:text-gray-300 transition-colors">
                        ← Back to Home
                    </Link>
                </div>
            </div>

            {/* ── Login card ──────────────────────────────────────────────────────── */}
            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md animate-slide-up">
                    {/* Logo */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500/30 mb-4">
                            <Shield className="w-8 h-8 text-red-400" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-white">
                            DIS<span className="text-red-500">ASTRA</span>
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Sign in to the operations center</p>
                    </div>

                    {/* Card */}
                    <div className="glass-card p-8">
                        {/* Error banner */}
                        {error && (
                            <div className="mb-6 flex items-start gap-3 bg-red-900/30 border border-red-500/30 rounded-lg px-4 py-3">
                                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-300">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                    <input
                                        id="email"
                                        type="email"
                                        autoComplete="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full bg-[#1f2937] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-[#1f2937] border border-white/10 rounded-lg pl-10 pr-10 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((s) => !s)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="my-6 flex items-center gap-3">
                            <div className="flex-1 h-px bg-white/5" />
                            <span className="text-xs text-gray-600">or</span>
                            <div className="flex-1 h-px bg-white/5" />
                        </div>

                        {/* Register link */}
                        <p className="text-center text-sm text-gray-500">
                            New to DISASTRA?{' '}
                            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                                Create an account
                            </Link>
                        </p>
                    </div>

                    {/* Demo credentials hint */}
                    <div className="mt-6 glass-card p-4">
                        <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">Demo Accounts (Development Only)</p>
                        <div className="space-y-1 text-xs text-gray-600 font-mono">
                            <p>citizen@disastra.dev — Citizen@123</p>
                            <p>responder@disastra.dev — Responder@123</p>
                            <p>dispatcher@disastra.dev — Dispatcher@123</p>
                            <p>admin@disastra.dev — Admin@123</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}