'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api, clearToken, getRefreshToken, getToken, setRefreshToken, setToken } from './api';
import { AuthUser } from './types';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
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
    const res = await api.post<{ accessToken: string; refreshToken: string; user: AuthUser }>('/auth/signup', {
      email,
      password,
      name,
    });
    setToken(res.accessToken);
    setRefreshToken(res.refreshToken);
    setUser(res.user);
    router.push('/dashboard');
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
