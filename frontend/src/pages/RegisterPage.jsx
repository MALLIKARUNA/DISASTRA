// ─────────────────────────────────────────────────────────────────────────────
// pages/RegisterPage.jsx — DISASTRA citizen registration
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, Loader2, AlertCircle, Eye, EyeOff, Radio, User, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        address: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Client-side validation
        if (!form.name.trim() || !form.email.trim() || !form.password) {
            setError('Please fill in all required fields.');
            return;
        }
        if (form.password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }
        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setSubmitting(true);
        try {
            const user = await register({
                name: form.name.trim(),
                email: form.email.trim(),
                password: form.password,
                phone: form.phone.trim() || undefined,
                address: form.address.trim() || undefined,
            });
            toast.success(`Account created — welcome, ${user.name.split(' ')[0]}!`);
            navigate('/citizen', { replace: true });
        } catch (err) {
            const msg = err.response?.data?.message || 'Registration failed. Please try again.';
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

            {/* ── Register card ───────────────────────────────────────────────────── */}
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
                        <p className="text-sm text-gray-500 mt-1">Create your citizen account</p>
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

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name */}
                            <div>
                                <label htmlFor="name" className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                                    Full Name *
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        autoComplete="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Your full name"
                                        className="w-full bg-[#1f2937] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                                    Email Address *
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="you@example.com"
                                        className="w-full bg-[#1f2937] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                                    Password *
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder="Min 8 chars, letters + numbers"
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

                            {/* Confirm Password */}
                            <div>
                                <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                                    Confirm Password *
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        value={form.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Re-enter your password"
                                        className="w-full bg-[#1f2937] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Phone (optional) */}
                            <div>
                                <label htmlFor="phone" className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                                    Phone (optional)
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        autoComplete="tel"
                                        value={form.phone}
                                        onChange={handleChange}
                                        placeholder="+91 98765 43210"
                                        className="w-full bg-[#1f2937] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Address (optional) */}
                            <div>
                                <label htmlFor="address" className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                                    Address (optional)
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                    <input
                                        id="address"
                                        name="address"
                                        type="text"
                                        autoComplete="street-address"
                                        value={form.address}
                                        onChange={handleChange}
                                        placeholder="Street, city, state"
                                        className="w-full bg-[#1f2937] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-2 mt-2"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Creating account...
                                    </>
                                ) : (
                                    'Create Account'
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="my-6 flex items-center gap-3">
                            <div className="flex-1 h-px bg-white/5" />
                            <span className="text-xs text-gray-600">or</span>
                            <div className="flex-1 h-px bg-white/5" />
                        </div>

                        {/* Login link */}
                        <p className="text-center text-sm text-gray-500">
                            Already have an account?{' '}
                            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>

                    <p className="mt-4 text-center text-xs text-gray-600">
                        Registration creates a <span className="text-gray-400">CITIZEN</span> account.
                        Responder, Dispatcher, and Admin accounts are provisioned by administrators.
                    </p>
                </div>
            </div>
        </div>
    );
}