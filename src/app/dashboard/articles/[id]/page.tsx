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
    <div>
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-900">Edit article</h1>
          <button onClick={() => router.push('/dashboard')} className="text-sm text-slate-500 hover:underline">
            Back to articles
          </button>
        </div>
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
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
