'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import PortfolioNote from './PortfolioNote';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <>
    <PortfolioNote />
    <nav className="flex items-center justify-between border-b border-line bg-surface/80 px-6 py-4 backdrop-blur">
      <div className="flex items-center gap-7">
        <Link href="/dashboard" className="flex items-center gap-2 font-display text-[15px] font-semibold text-ink">
          <span className="h-2 w-2 rounded-full bg-brand-light shadow-[0_0_8px_rgba(79,214,196,0.7)]" />
          Content CMS
        </Link>
        <Link href="/dashboard" className="text-sm text-ink-muted transition-colors hover:text-ink">
          Articles
        </Link>
        {user?.role === 'admin' && (
          <Link href="/users" className="text-sm text-ink-muted transition-colors hover:text-ink">
            Users
          </Link>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span className="font-mono text-xs text-ink-dim">
          {user?.name} <span className="text-brand">· {user?.role?.toUpperCase()}</span>
        </span>
        <ThemeToggle />
        <button
          onClick={logout}
          className="rounded-lg border border-line px-3 py-1.5 text-sm text-ink-muted transition-colors hover:border-ink-dim hover:text-ink"
        >
          Log out
        </button>
      </div>
    </nav>
    </>
  );
}
