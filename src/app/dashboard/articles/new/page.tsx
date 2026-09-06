'use client';

import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import ArticleForm from '@/components/ArticleForm';
import { api } from '@/lib/api';
import { Article, ArticleInput } from '@/lib/types';

function NewArticleContent() {
  const router = useRouter();

  async function handleSubmit(input: ArticleInput) {
    const article = await api.post<Article>('/articles', input);
    router.push(`/dashboard/articles/${article.id}`);
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="mb-6 text-2xl font-semibold text-ink">New article</h1>
        <ArticleForm onSubmit={handleSubmit} submitLabel="Create article" />
      </main>
    </div>
  );
}

export default function NewArticlePage() {
  return (
    <ProtectedRoute>
      <NewArticleContent />
    </ProtectedRoute>
  );
}
