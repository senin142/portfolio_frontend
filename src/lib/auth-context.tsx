'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api, clearToken, getRefreshToken, getToken, setRefreshToken, setToken } from './api';
import { AuthUser } from './types';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  // Returns a status message instead of logging in — public signup now lands
  // 'pending' and needs admin approval before it can log in (no tokens are
  // issued at signup time). See backend/CLAUDE.md's Authorization section.
  signup: (email: string, password: string, name: string) => Promise<string>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get<AuthUser>('/auth/me')
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const res = await api.post<{ accessToken: string; refreshToken: string; user: AuthUser }>('/auth/login', {
      email,
      password,
    });
    setToken(res.accessToken);
    setRefreshToken(res.refreshToken);
    setUser(res.user);
    router.push('/dashboard');
  }

  async function signup(email: string, password: string, name: string) {
    const res = await api.post<{ pending: boolean; message: string }>('/auth/signup', {
      email,
      password,
      name,
    });
    return res.message;
  }

  function logout() {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      // Best-effort: revoke server-side so the refresh token can't be reused even if
      // someone got hold of it. Don't block clearing local state on this succeeding.
      api.post('/auth/logout', { refreshToken }).catch(() => {});
    }
    clearToken();
    setUser(null);
    router.push('/login');
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
