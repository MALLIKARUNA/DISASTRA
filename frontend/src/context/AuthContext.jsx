// ─────────────────────────────────────────────────────────────────────────────
// context/AuthContext.jsx — Authentication state for Phase 2
// Wired to real /api/auth endpoints with JWT stored in localStorage
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Rehydrate from localStorage + validate token via /api/auth/me ──────────
  useEffect(() => {
    const storedToken = localStorage.getItem('disastra_token');
    const storedUser = localStorage.getItem('disastra_user');

    if (!storedToken) {
      setLoading(false);
      return;
    }

    setToken(storedToken);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Validate token against backend
    const validateToken = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
        localStorage.setItem('disastra_user', JSON.stringify(res.data.user));
      } catch {
        // Token invalid/expired — clear storage
        localStorage.removeItem('disastra_token');
        localStorage.removeItem('disastra_user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, []);

  // ── Login ───────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: authToken, user: userData } = res.data;

    setToken(authToken);
    setUser(userData);
    localStorage.setItem('disastra_token', authToken);
    localStorage.setItem('disastra_user', JSON.stringify(userData));

    return userData;
  }, []);

  // ── Register ────────────────────────────────────────────────────────────────
  const register = useCallback(async (userData) => {
    const res = await api.post('/auth/register', userData);
    const { token: authToken, user: newUser } = res.data;

    setToken(authToken);
    setUser(newUser);
    localStorage.setItem('disastra_token', authToken);
    localStorage.setItem('disastra_user', JSON.stringify(newUser));

    return newUser;
  }, []);

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      // Best-effort server-side logout (stateless JWT — client discards token)
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors — always clear local state
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('disastra_token');
      localStorage.removeItem('disastra_user');
    }
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    role: user?.role || null,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;