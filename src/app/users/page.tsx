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
    <div>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <h1 className="mb-6 text-2xl font-semibold text-slate-900">Users</h1>
        {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium">Role</th>
                <th className="px-4 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-slate-900">{user.name}</td>
                  <td className="px-4 py-3 text-slate-500">{user.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(e) => changeRole(user, e.target.value as Role)}
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                    >
                      <option value="editor">editor</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => remove(user)} className="text-xs text-red-600 hover:underline">
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
