'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { api } from '@/lib/api';
import { AuditLogEntry } from '@/lib/types';

function AuditLogContent() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<AuditLogEntry[]>('/audit-log')
      .then(setEntries)
      .catch(() => setError('Failed to load audit log'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-ink">Audit Log</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Auth events and destructive/privileged actions, most recent first.
          </p>
        </div>
        {error && <p className="error-banner mb-4">{error}</p>}
        <div className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-black/[0.02] text-ink-dim dark:bg-white/[0.04]">
              <tr>
                <th className="px-5 py-3 font-medium">When</th>
                <th className="px-5 py-3 font-medium">Action</th>
                <th className="px-5 py-3 font-medium">Actor</th>
                <th className="px-5 py-3 font-medium">Target</th>
                <th className="px-5 py-3 font-medium">IP</th>
              </tr>
            </thead>
            <tbody>
              {!loading && entries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-ink-dim">
                    No audit log entries yet.
                  </td>
                </tr>
              )}
              {entries.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b border-line last:border-0 hover:bg-black/[0.015] dark:hover:bg-white/[0.03]"
                >
                  <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-ink-muted">
                    {new Date(entry.createdAt).toLocaleString()}
                  </td>
                  <td className="px-5 py-3">
                    <span className="rounded-md bg-black/[0.04] px-2 py-0.5 font-mono text-xs text-ink dark:bg-white/[0.06]">
                      {entry.action}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-ink-muted">{entry.actorEmail ?? '—'}</td>
                  <td className="px-5 py-3 text-ink-muted">
                    {entry.targetType ? `${entry.targetType}/${entry.targetId}` : '—'}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-ink-dim">{entry.ipAddress ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default function AuditLogPage() {
  return (
    <ProtectedRoute allow={['admin']}>
      <AuditLogContent />
    </ProtectedRoute>
  );
}
