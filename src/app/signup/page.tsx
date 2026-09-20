'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ApiError } from '@/lib/api';
import PortfolioNote from '@/components/PortfolioNote';
import ThemeToggle from '@/components/ThemeToggle';

export default function SignupPage() {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const message = await signup(email, password, name);
      setSuccessMessage(message);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  if (successMessage) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4">
        <div className="fixed inset-x-0 top-0"><PortfolioNote /></div>
        <div className="fixed right-4 top-14"><ThemeToggle /></div>
        <div className="card w-full max-w-sm space-y-4 p-7 text-center">
          <h1 className="text-xl font-semibold text-ink">Account created</h1>
          <p className="text-sm text-ink-muted">{successMessage}</p>
          <Link href="/login" className="btn-primary block w-full">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4">
      <div className="fixed inset-x-0 top-0"><PortfolioNote /></div>
      <div className="fixed right-4 top-14"><ThemeToggle /></div>
      <form onSubmit={handleSubmit} className="card w-full max-w-sm space-y-4 p-7">
        <h1 className="text-xl font-semibold text-ink">Sign up</h1>
        <p className="text-sm text-ink-muted">
          New accounts are created as editors, pending admin approval before you can log in.
        </p>
        {error && <p className="error-banner">{error}</p>}
        <div>
          <label className="field-label">Name</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className="field-input" />
        </div>
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
            minLength={10}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field-input"
          />
        </div>
        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Creating account…' : 'Sign up'}
        </button>
        <p className="text-center text-sm text-ink-muted">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-brand underline underline-offset-2">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
