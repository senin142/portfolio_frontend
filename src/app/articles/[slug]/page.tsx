'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { PublicArticle } from '@/lib/types';

export default function PublicArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<PublicArticle | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api
      .get<PublicArticle>(`/public/articles/${slug}`)
      .then(setArticle)
      .catch(() => setNotFound(true));
  }, [slug]);

  if (notFound) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <p className="text-slate-500">Article not found.</p>
        <Link href="/" className="mt-4 inline-block text-sm text-slate-900 underline">
          Back to articles
        </Link>
      </div>
    );
  }

  if (!article) return <p className="p-8 text-sm text-slate-400">Loading…</p>;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-2xl px-6 py-4">
          <Link href="/" className="text-sm text-slate-500 hover:underline">
            ← All articles
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="text-2xl font-semibold text-slate-900">{article.title}</h1>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {article.tags.map((t) => (
            <Link
              key={t.id}
              href={`/?tag=${encodeURIComponent(t.name)}`}
              className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500 hover:bg-slate-200"
            >
              {t.name}
            </Link>
          ))}
        </div>
        <p className="mt-6 whitespace-pre-wrap text-[15px] leading-relaxed text-slate-700">{article.body}</p>

        {article.related && article.related.length > 0 && (
          <div className="mt-12 border-t border-slate-200 pt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Similar articles</h2>
            <div className="mt-4 space-y-3">
              {article.related.map((r) => (
                <Link
                  key={r.id}
                  href={`/articles/${r.slug}`}
                  className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-400"
                >
                  <div className="font-medium text-slate-900">{r.title}</div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {r.tags.map((t) => (
                      <span key={t.id} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
                        {t.name}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
