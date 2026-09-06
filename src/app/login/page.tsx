'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ApiError } from '@/lib/api';
import PortfolioNote from '@/components/PortfolioNote';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4">
      <div className="fixed inset-x-0 top-0"><PortfolioNote /></div>
      <form onSubmit={handleSubmit} className="card w-full max-w-sm space-y-4 p-7">
        <div className="mb-1 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-brand-light shadow-[0_0_8px_rgba(79,214,196,0.7)]" />
          <span className="font-mono text-xs uppercase tracking-wider text-ink-dim">Content CMS</span>
        </div>
        <h1 className="text-xl font-semibold text-ink">Log in</h1>
        {error && <p className="error-banner">{error}</p>}
        <div>
          <label className="field-label">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field-input"
          />
        </div>
        <div>
          <label className="field-label">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field-input"
          />
        </div>
        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
        <p className="text-center text-sm text-ink-muted">
          No account?{' '}
          <Link href="/signup" className="font-medium text-brand underline underline-offset-2">
            Sign up
          </Link>
        </p>
        <p className="rounded-lg bg-brand-soft px-3 py-2 text-center font-mono text-[11px] text-ink-muted">
          Seeded accounts: admin@example.com / editor@example.com, password123
        </p>
      </form>
    </div>
  );
}
