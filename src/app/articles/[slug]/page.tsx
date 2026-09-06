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
        <p className="text-ink-muted">Article not found.</p>
        <Link href="/" className="mt-4 inline-block text-sm font-medium text-brand underline underline-offset-2">
          Back to articles
        </Link>
      </div>
    );
  }

  if (!article) return <p className="p-8 font-mono text-xs text-ink-dim">Loading…</p>;

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-2xl px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-sm text-ink-muted hover:text-brand">
            <span className="h-2 w-2 rounded-full bg-brand-light" />← All articles
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-14">
        <h1 className="font-serif text-3xl leading-tight text-ink">{article.title}</h1>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {article.tags.map((t) => (
            <Link key={t.id} href={`/?tag=${encodeURIComponent(t.name)}`} className="badge bg-brand-soft text-brand hover:bg-brand hover:text-white">
              {t.name}
            </Link>
          ))}
        </div>
        <p className="mt-8 whitespace-pre-wrap font-serif text-[17px] leading-[1.8] text-ink/90">{article.body}</p>

        {article.related && article.related.length > 0 && (
          <div className="mt-14 border-t border-line pt-7">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-ink-dim">Similar articles</h2>
            <div className="mt-4 space-y-3">
              {article.related.map((r) => (
                <Link key={r.id} href={`/articles/${r.slug}`} className="card block p-4 transition-shadow hover:shadow-md">
                  <div className="font-medium text-ink">{r.title}</div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {r.tags.map((t) => (
                      <span key={t.id} className="badge bg-black/[0.04] text-ink-muted">
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
