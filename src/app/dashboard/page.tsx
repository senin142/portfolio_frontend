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
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-ink">Articles</h1>
            <p className="mt-1 text-sm text-ink-muted">{articles.length} total</p>
          </div>
          <Link href="/dashboard/articles/new" className="btn-primary">
            + New article
          </Link>
        </div>

        <div className="mb-4 flex flex-wrap gap-3">
          <input
            placeholder="Search title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="field-input mt-0 w-64"
          />
        </div>

        {error && <p className="error-banner mb-4">{error}</p>}

        <div className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-black/[0.02] text-ink-dim">
              <tr>
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium">Tags</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Author</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center font-mono text-xs text-ink-dim">
                    Loading…
                  </td>
                </tr>
              ) : articles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center font-mono text-xs text-ink-dim">
                    No articles found.
                  </td>
                </tr>
              ) : (
                articles.map((article) => (
                  <tr key={article.id} className="border-b border-line last:border-0 hover:bg-black/[0.015]">
                    <td className="px-5 py-3">
                      <Link
                        href={`/dashboard/articles/${article.id}`}
                        className="font-medium text-ink hover:text-brand"
                      >
                        {article.title}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {article.tags.map((t) => (
                          <span key={t.id} className="badge bg-brand-soft text-brand">
                            {t.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`badge ${
                          article.published ? 'bg-emerald-50 text-emerald-700' : 'bg-black/5 text-ink-muted'
                        }`}
                      >
                        {article.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-ink-muted">{article.author?.name}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => togglePublish(article)} className="text-xs font-medium text-ink-muted hover:text-brand">
                          {article.published ? 'Unpublish' : 'Publish'}
                        </button>
                        <button onClick={() => remove(article)} className="text-xs font-medium text-red-500 hover:text-red-600">
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
