'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="flex items-center justify-between border-b bg-background px-6 py-3">
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="font-semibold text-foreground">
          Content CMS
        </Link>
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
          Articles
        </Link>
        {user?.role === 'admin' && (
          <Link href="/users" className="text-sm text-muted-foreground hover:text-foreground">
            Users
          </Link>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          {user?.name} · <span className="uppercase">{user?.role}</span>
        </span>
        <Button variant="outline" size="sm" onClick={logout}>
          Log out
        </Button>
      </div>
    </nav>
  );
}
