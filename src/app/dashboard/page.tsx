'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { api } from '@/lib/api';
import { Article } from '@/lib/types';

function DashboardContent() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);

      setLoading(true);
      api
        .get<Article[]>(`/articles?${params.toString()}`)
        .then(setArticles)
        .catch(() => setError('Failed to load articles'))
        .finally(() => setLoading(false));
    }, 250);

    return () => clearTimeout(timeout);
  }, [search]);

  async function togglePublish(article: Article) {
    const updated = await api.patch<Article>(
      `/articles/${article.id}/${article.published ? 'unpublish' : 'publish'}`,
    );
    setArticles((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  }

  async function remove(article: Article) {
    if (!confirm(`Delete "${article.title}"?`)) return;
    await api.delete(`/articles/${article.id}`);
    setArticles((prev) => prev.filter((a) => a.id !== article.id));
  }

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-900">Articles</h1>
          <Link
            href="/dashboard/articles/new"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            New article
          </Link>
        </div>

        <div className="mb-4 flex flex-wrap gap-3">
          <input
            placeholder="Search title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-2 font-medium">Title</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Author</th>
                <th className="px-4 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                    Loading…
                  </td>
                </tr>
              ) : articles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                    No articles found.
                  </td>
                </tr>
              ) : (
                articles.map((article) => (
                  <tr key={article.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/articles/${article.id}`}
                        className="font-medium text-slate-900 hover:underline"
                      >
                        {article.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          article.published ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {article.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{article.author?.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => togglePublish(article)} className="text-xs text-slate-600 hover:underline">
                          {article.published ? 'Unpublish' : 'Publish'}
                        </button>
                        <button onClick={() => remove(article)} className="text-xs text-red-600 hover:underline">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
