export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const TOKEN_KEY = 'cms_token';
const REFRESH_KEY = 'cms_refresh_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function setRefreshToken(token: string) {
  localStorage.setItem(REFRESH_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

// The access token is short-lived (15m) by design — refresh tokens exist so a leaked
// access token expires fast while the user still doesn't need to re-log-in constantly.
// Concurrent 401s (e.g. a page firing several requests on mount) share one in-flight
// refresh instead of each racing to rotate the same refresh token, which would make
// all but one of them fail (rotation revokes the old token the instant it's used).
let refreshPromise: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      clearToken();
      return false;
    }
    const data = await res.json();
    setToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

function refreshOnce(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function request<T>(path: string, options: RequestInit = {}, isRetry = false): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401 && !isRetry && getRefreshToken()) {
    const refreshed = await refreshOnce();
    if (refreshed) return request<T>(path, options, true);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    const message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
    throw new ApiError(message || 'Request failed', res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  async uploadImage<T>(articleId: string, file: File, resize: boolean, isRetry = false): Promise<T> {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_URL}/media/articles/${articleId}?resize=${resize}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });
    if (res.status === 401 && !isRetry && getRefreshToken()) {
      const refreshed = await refreshOnce();
      if (refreshed) return api.uploadImage<T>(articleId, file, resize, true);
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({ message: res.statusText }));
      const message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
      throw new ApiError(message || 'Upload failed', res.status);
    }
    return res.json();
  },
  async fetchImage(articleId: string, isRetry = false): Promise<Blob | null> {
    const token = getToken();
    const res = await fetch(`${API_URL}/media/articles/${articleId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (res.status === 401 && !isRetry && getRefreshToken()) {
      const refreshed = await refreshOnce();
      if (refreshed) return api.fetchImage(articleId, true);
    }
    if (!res.ok) return null;
    return res.blob();
  },
};
