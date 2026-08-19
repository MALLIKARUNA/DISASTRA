// ─────────────────────────────────────────────────────────────────────────────
// components/ProtectedRoute.jsx — Route guard for authenticated users
// Redirects unauthenticated users to /login
// ─────────────────────────────────────────────────────────────────────────────

import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    // Show loading spinner while auth state is being restored
    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
                    <p className="text-sm text-gray-500">Verifying session...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Save the attempted location so we can redirect back after login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}