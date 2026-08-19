// ─────────────────────────────────────────────────────────────────────────────
// pages/NotFoundPage.jsx — 404 page
// ─────────────────────────────────────────────────────────────────────────────

import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 text-red-400" />
      </div>
      <h1 className="text-5xl font-black text-white mb-2">404</h1>
      <p className="text-gray-400 mb-6">This route does not exist in the DISASTRA system.</p>
      <Link
        to="/"
        className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
      >
        Return to Base
      </Link>
    </div>
  );
}
