// ─────────────────────────────────────────────────────────────────────────────
// pages/LandingPage.jsx — DISASTRA Phase 1 landing page
// Shows platform identity, system status, and phase progress
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, Radio, Activity, Layers, CheckCircle, Clock, Loader2, LogIn, UserPlus } from 'lucide-react';
import api from '../services/api';

const phases = [
  { id: 1, label: 'Project Setup', status: 'done' },
  { id: 2, label: 'Authentication + Roles', status: 'done' },
  { id: 3, label: 'Citizen SOS / Report', status: 'pending' },
  { id: 4, label: 'Incident Management', status: 'pending' },
  { id: 5, label: 'Live GIS Map', status: 'pending' },
  { id: 6, label: 'Alerts', status: 'pending' },
  { id: 7, label: 'Evidence + Confidence', status: 'pending' },
  { id: 8, label: 'Exposure + Vulnerability', status: 'pending' },
  { id: 9, label: 'Intelligent Priority', status: 'pending' },
  { id: 10, label: 'Resource Matching', status: 'pending' },
  { id: 11, label: 'Rescue Optimization', status: 'pending' },
  { id: 12, label: 'Route + Shelter/Hospital', status: 'pending' },
  { id: 13, label: 'Command Center + Approval', status: 'pending' },
  { id: 14, label: 'Responder Dashboard', status: 'pending' },
  { id: 15, label: 'New Ground Truth', status: 'pending' },
  { id: 16, label: 'Adaptive Re-Optimization', status: 'pending' },
  { id: 17, label: 'Decision Audit Timeline', status: 'pending' },
  { id: 18, label: 'What-If Simulator', status: 'pending' },
  { id: 19, label: 'Offline / PWA', status: 'pending' },
  { id: 20, label: 'Seed Data + Demo', status: 'pending' },
  { id: 21, label: 'Testing + Bug Fixing', status: 'pending' },
  { id: 22, label: 'UI Polish + SIH Prep', status: 'pending' },
];

const coreLoop = [
  'OFFICIAL DATA', 'ENVIRONMENT DATA', 'CITIZEN REPORTS', 'RESPONDER REPORTS',
  'EVIDENCE FUSION', 'CONFIDENCE + CONFLICT', 'EXPOSURE + VULNERABILITY',
  'RISK ASSESSMENT', 'INTELLIGENT PRIORITY', 'RESOURCE MATCHING',
  'RESCUE OPTIMIZATION', 'RISK-AWARE ROUTE', 'SHELTER / HOSPITAL',
  'COMMAND CENTER', 'HUMAN APPROVAL', 'DISPATCH', 'NEW GROUND TRUTH',
  'ADAPTIVE RE-OPTIMIZATION',
];

export default function LandingPage() {
  const [healthData, setHealthData] = useState(null);
  const [healthStatus, setHealthStatus] = useState('loading'); // loading | ok | error
  const [activeLoopIdx, setActiveLoopIdx] = useState(0);

  // Health check
  useEffect(() => {
    const check = async () => {
      try {
        const res = await api.get('/health');
        setHealthData(res.data);
        setHealthStatus(res.data.database?.status === 'connected' ? 'ok' : 'warn');
      } catch {
        setHealthStatus('error');
      }
    };
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  // Animate the core loop
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveLoopIdx((i) => (i + 1) % coreLoop.length);
    }, 900);
    return () => clearInterval(interval);
  }, []);

  const statusColor = {
    loading: 'text-yellow-400',
    ok: 'text-green-400',
    warn: 'text-orange-400',
    error: 'text-red-400',
  }[healthStatus];

  const statusText = {
    loading: 'Connecting...',
    ok: 'All Systems Operational',
    warn: 'API Running — DB Disconnected',
    error: 'Backend Unreachable',
  }[healthStatus];

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-gray-100 font-['Inter'] overflow-x-hidden">

      {/* ── Top status bar ─────────────────────────────────────────────────── */}
      <div className="border-b border-white/5 bg-[#111827]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-gray-500">
            <Radio className="w-3 h-3" />
            <span>DISASTRA OPERATIONS CENTER</span>
            <span className="mx-2 text-white/10">|</span>
            <span>Phase 2 — Authentication</span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 ${statusColor}`}>
              {healthStatus === 'loading' ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : healthStatus === 'ok' ? (
                <span className="w-2 h-2 rounded-full bg-green-400 relative">
                  <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-60" />
                </span>
              ) : (
                <span className="w-2 h-2 rounded-full bg-current" />
              )}
              <span>{statusText}</span>
            </div>
            <span className="mx-2 text-white/10">|</span>
            <Link
              to="/login"
              className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
            >
              <LogIn className="w-3 h-3" />
              <span>Login</span>
            </Link>
            <Link
              to="/register"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-600/20 border border-red-500/30 text-red-300 hover:bg-red-600/30 hover:text-red-200 transition-colors"
            >
              <UserPlus className="w-3 h-3" />
              <span>Register</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 pt-16 pb-8">
        <div className="text-center animate-slide-up">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-red-600/20 border border-red-500/30 mb-6 relative">
            <Shield className="w-10 h-10 text-red-400" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-[#0a0e1a]">
              <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-60" />
            </span>
          </div>

          {/* Title */}
          <h1 className="text-6xl font-black tracking-tight text-white mb-2">
            DIS<span className="text-red-500">ASTRA</span>
          </h1>
          <p className="text-lg text-blue-400 font-medium tracking-widest uppercase mb-4">
            Adaptive Multi-Hazard Disaster Response Platform
          </p>
          <p className="text-gray-400 max-w-2xl mx-auto text-base leading-relaxed">
            An adaptive disaster intelligence platform that continuously combines official information,
            citizen ground truth, and responder data — then updates response plans when situations change.
          </p>
          <div className="mt-4 inline-block bg-red-900/30 border border-red-500/30 rounded-full px-5 py-2 text-red-300 text-sm font-medium">
            "When the ground truth changes, our response plan changes with it."
          </div>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              to="/login"
              className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Link>
            <Link
              to="/register"
              className="flex items-center gap-2 px-6 py-2.5 border border-white/10 hover:border-red-500/40 hover:bg-red-600/10 text-gray-300 hover:text-white rounded-lg text-sm font-semibold transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Create Account
            </Link>
          </div>
        </div>

        {/* ── Two column layout ─────────────────────────────────────────────── */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Left: Core Response Loop */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                <Activity className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">Core Response Loop</h2>
                <p className="text-xs text-gray-500">Continuous evidence-to-action feedback cycle</p>
              </div>
            </div>

            <div className="space-y-1.5">
              {coreLoop.map((step, idx) => (
                <div
                  key={idx}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300
                    ${idx === activeLoopIdx
                      ? 'bg-blue-600/20 border border-blue-500/40 text-blue-300'
                      : 'text-gray-600 hover:text-gray-400'}
                  `}
                >
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${idx === activeLoopIdx ? 'bg-blue-400' : 'bg-gray-700'}`} />
                  <span className="text-xs font-medium tracking-wide">{step}</span>
                  {idx === activeLoopIdx && (
                    <span className="ml-auto text-xs text-blue-400 animate-pulse">▶ ACTIVE</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Phase Progress + System Status */}
          <div className="space-y-6">

            {/* System status card */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-green-600/20 border border-green-500/30 flex items-center justify-center">
                  <Layers className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">System Status</h2>
                  <p className="text-xs text-gray-500">Live backend health</p>
                </div>
              </div>

              {healthData ? (
                <div className="space-y-2 text-sm">
                  {[
                    { label: 'API Server', value: 'Running', ok: true },
                    { label: 'Database', value: healthData.database?.status, ok: healthData.database?.status === 'connected' },
                    { label: 'Environment', value: healthData.environment, ok: true },
                    { label: 'Phase', value: healthData.phase, ok: true },
                    { label: 'Uptime', value: healthData.uptime, ok: true },
                    { label: 'Node', value: healthData.server?.nodeVersion, ok: true },
                  ].map(({ label, value, ok }) => (
                    <div key={label} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                      <span className="text-gray-500">{label}</span>
                      <span className={ok ? 'text-green-400' : 'text-orange-400'}>{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="skeleton h-6 rounded" />
                  ))}
                </div>
              )}
            </div>

            {/* Phase progress */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">Build Progress</h2>
                  <p className="text-xs text-gray-500">2 of 22 phases complete</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Overall completion</span>
                  <span>2 / 22</span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-orange-400 rounded-full transition-all duration-1000"
                    style={{ width: `${(2 / 22) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                {phases.map((phase) => (
                  <div key={phase.id} className="flex items-center gap-2.5 py-1">
                    {phase.status === 'done' ? (
                      <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-gray-700 flex-shrink-0" />
                    )}
                    <span className={`text-xs ${phase.status === 'done' ? 'text-green-400' : 'text-gray-600'}`}>
                      Phase {phase.id} — {phase.label}
                    </span>
                    {phase.status === 'done' && (
                      <span className="ml-auto text-xs bg-green-900/40 text-green-400 border border-green-500/20 px-1.5 py-0.5 rounded-full">
                        DONE
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────────── */}
        <div className="mt-16 text-center text-gray-700 text-xs pb-8">
          <p>DISASTRA — Smart India Hackathon Demo Platform</p>
          <p className="mt-1">Simulated data only. Not real emergency operations.</p>
        </div>
      </div>
    </div>
  );
}
