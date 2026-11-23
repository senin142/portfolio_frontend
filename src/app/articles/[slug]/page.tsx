'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api, API_URL } from '@/lib/api';
import { PublicArticle } from '@/lib/types';
import PortfolioNote from '@/components/PortfolioNote';
import ThemeToggle from '@/components/ThemeToggle';
import LoadingNote from '@/components/LoadingNote';
import RelatedSlider from '@/components/RelatedSlider';

export default function PublicArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<PublicArticle | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [hasImage, setHasImage] = useState(true);

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

  if (!article) return <LoadingNote label="Loading article…" className="p-8" />;

  return (
    <div className="min-h-screen bg-paper">
      <PortfolioNote />
      <header className="border-b border-line bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-sm text-ink-muted hover:text-brand">
            <span className="h-2 w-2 rounded-full bg-brand-light" />← All articles
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-14">
        <h1 className="font-serif text-3xl leading-tight text-ink">{article.title}</h1>
        {hasImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`${API_URL}/public/articles/${slug}/image`}
            alt={article.title}
            onError={() => setHasImage(false)}
            className="mt-5 w-full rounded-lg border border-line object-cover"
          />
        )}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {article.tags.map((t) => (
            <Link key={t.id} href={`/?tag=${encodeURIComponent(t.name)}`} className="badge bg-brand-soft text-brand hover:bg-brand hover:text-white">
              {t.name}
            </Link>
          ))}
        </div>
        <p className="mt-8 whitespace-pre-wrap font-serif text-[17px] leading-[1.8] text-ink/90">{article.body}</p>

        {article.related && article.related.length > 0 && (
          <RelatedSlider articles={article.related} currentTags={article.tags} />
        )}
      </main>
    </div>
  );
}
