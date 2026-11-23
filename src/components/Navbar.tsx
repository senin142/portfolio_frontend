'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import PortfolioNote from './PortfolioNote';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the narrow-screen menu after navigating, and on Escape.
  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const links = [
    { href: '/dashboard', label: 'Articles' },
    ...(user?.role === 'admin'
      ? [
          { href: '/users', label: 'Users' },
          { href: '/dashboard/audit-log', label: 'Audit Log' },
        ]
      : []),
  ];

  const identity = (
    <span className="font-mono text-xs text-ink-dim">
      {user?.name} <span className="text-brand">· {user?.role?.toUpperCase()}</span>
    </span>
  );

  const logoutButton = (
    <button
      onClick={logout}
      className="rounded-lg border border-line px-3 py-1.5 text-sm text-ink-muted transition-colors hover:border-ink-dim hover:text-ink"
    >
      Log out
    </button>
  );

  return (
    <>
    <PortfolioNote />
    <nav className="border-b border-line bg-surface/80 backdrop-blur">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-7">
          <Link href="/dashboard" className="flex items-center gap-2 font-display text-[15px] font-semibold text-ink">
            <span className="h-2 w-2 rounded-full bg-brand-light shadow-[0_0_8px_rgba(79,214,196,0.7)]" />
            Content CMS
          </Link>
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hidden text-sm text-ink-muted transition-colors hover:text-ink md:inline">
              {l.label}
            </Link>
          ))}
        </div>
        <div className="hidden items-center gap-4 md:flex">
          {identity}
          <ThemeToggle />
          {logoutButton}
        </div>
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-controls="nav-menu"
          className="rounded-lg border border-line px-3 py-2 text-sm text-ink-muted transition-colors hover:border-ink-dim hover:text-ink md:hidden"
        >
          {menuOpen ? 'Close menu' : 'Menu'}
        </button>
      </div>

      {/* Narrow screens: the same destinations and actions, stacked under the bar. */}
      {menuOpen && (
        <div id="nav-menu" className="border-t border-line px-6 pb-4 pt-2 md:hidden">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="block py-3 text-sm text-ink-muted hover:text-ink">
              {l.label}
            </Link>
          ))}
          <div className="mt-2 flex items-center justify-between gap-3 border-t border-line pt-4">
            {identity}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              {logoutButton}
            </div>
          </div>
        </div>
      )}
    </nav>
    </>
  );
}
