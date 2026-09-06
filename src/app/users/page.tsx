'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { api } from '@/lib/api';
import { AuthUser, Role } from '@/lib/types';

function UsersContent() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<AuthUser[]>('/users')
      .then(setUsers)
      .catch(() => setError('Failed to load users'));
  }, []);

  async function changeRole(user: AuthUser, role: Role) {
    const updated = await api.patch<AuthUser>(`/users/${user.id}/role`, { role });
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  }

  async function remove(user: AuthUser) {
    if (!confirm(`Delete ${user.name}?`)) return;
    await api.delete(`/users/${user.id}`);
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="mb-6 text-2xl font-semibold text-ink">Users</h1>
        {error && <p className="error-banner mb-4">{error}</p>}
        <div className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-black/[0.02] text-ink-dim">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-line last:border-0 hover:bg-black/[0.015]">
                  <td className="px-5 py-3 font-medium text-ink">{user.name}</td>
                  <td className="px-5 py-3 text-ink-muted">{user.email}</td>
                  <td className="px-5 py-3">
                    <select
                      value={user.role}
                      onChange={(e) => changeRole(user, e.target.value as Role)}
                      className="rounded-lg border border-line px-2 py-1.5 text-xs focus:border-brand focus:outline-none"
                    >
                      <option value="editor">editor</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => remove(user)} className="text-xs font-medium text-red-500 hover:text-red-600">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default function UsersPage() {
  return (
    <ProtectedRoute allow={['admin']}>
      <UsersContent />
    </ProtectedRoute>
  );
}
