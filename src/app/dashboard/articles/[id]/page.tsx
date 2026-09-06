'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import ArticleForm from '@/components/ArticleForm';
import { api } from '@/lib/api';
import { Article, ArticleInput } from '@/lib/types';

function EditArticleContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Article>(`/articles/${id}`)
      .then(setArticle)
      .catch(() => setError('Article not found'));
  }, [id]);

  async function handleSubmit(input: ArticleInput) {
    const updated = await api.patch<Article>(`/articles/${id}`, input);
    setArticle(updated);
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-ink">Edit article</h1>
          <button onClick={() => router.push('/dashboard')} className="text-sm text-ink-muted hover:text-brand">
            ← Back to articles
          </button>
        </div>
        {error && <p className="error-banner">{error}</p>}
        {article && (
          <ArticleForm
            initial={article}
            onSubmit={handleSubmit}
            submitLabel="Save changes"
          />
        )}
      </main>
    </div>
  );
}

export default function EditArticlePage() {
  return (
    <ProtectedRoute>
      <EditArticleContent />
    </ProtectedRoute>
  );
}
