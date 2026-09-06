'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="font-semibold text-slate-900">
          Content CMS
        </Link>
        <Link href="/dashboard" className="text-sm text-slate-600 hover:text-slate-900">
          Articles
        </Link>
        {user?.role === 'admin' && (
          <Link href="/users" className="text-sm text-slate-600 hover:text-slate-900">
            Users
          </Link>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-500">
          {user?.name} · <span className="uppercase">{user?.role}</span>
        </span>
        <button
          onClick={logout}
          className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-100"
        >
          Log out
        </button>
      </div>
    </nav>
  );
}
