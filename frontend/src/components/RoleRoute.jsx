// ─────────────────────────────────────────────────────────────────────────────
// components/RoleRoute.jsx — Route guard for role-based access
// Redirects users without the required role to their own dashboard
// ─────────────────────────────────────────────────────────────────────────────

import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Role → home dashboard mapping
const roleHome = {
    CITIZEN: '/citizen',
    RESPONDER: '/responder',
    DISPATCHER: '/dispatcher',
    ADMIN: '/admin',
};

export default function RoleRoute({ allowedRoles, children }) {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
                    <p className="text-sm text-gray-500">Verifying access...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        // Redirect to the user's own dashboard
        return <Navigate to={roleHome[user.role] || '/'} replace />;
    }

    return children;
}