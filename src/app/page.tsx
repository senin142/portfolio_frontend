'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { api } from '@/lib/api';
import { PublicArticle, Tag } from '@/lib/types';
import PortfolioNote from '@/components/PortfolioNote';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function PublicHome() {
  const searchParams = useSearchParams();
  const [articles, setArticles] = useState<PublicArticle[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [activeTag, setActiveTag] = useState<string | null>(searchParams.get('tag'));
  const [loading, setLoading] = useState(true);
  const [liveNotice, setLiveNotice] = useState<string | null>(null);

  function load(tag: string | null) {
    setLoading(true);
    const qs = tag ? `?tag=${encodeURIComponent(tag)}` : '';
    api
      .get<PublicArticle[]>(`/public/articles${qs}`)
      .then(setArticles)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load(activeTag);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTag]);

  useEffect(() => {
    api.get<Tag[]>('/public/tags').then(setTags);
  }, []);

  // Live updates: a dedicated Socket.IO channel, separate from the REST API,
  // that the backend pushes to whenever an article is published.
  useEffect(() => {
    const socket: Socket = io(API_URL, { transports: ['websocket'] });
    socket.on('article.published', (payload: { title: string }) => {
      setLiveNotice(`New article published: "${payload.title}"`);
      load(activeTag);
      setTimeout(() => setLiveNotice(null), 6000);
    });
    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTag]);

  return (
    <div className="min-h-screen bg-paper">
      <PortfolioNote />
      <header className="border-b border-line bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <span className="flex items-center gap-2 font-display text-[15px] font-semibold text-ink">
            <span className="h-2 w-2 rounded-full bg-brand-light shadow-[0_0_8px_rgba(79,214,196,0.7)]" />
            Content CMS
          </span>
          <Link href="/login" className="text-sm text-ink-muted transition-colors hover:text-brand">
            Admin login
          </Link>
        </div>
      </header>

      <div
        className={`overflow-hidden bg-ink text-white transition-all duration-300 ${
          liveNotice ? 'max-h-16 py-2.5' : 'max-h-0 py-0'
        }`}
      >
        <p className="text-center font-mono text-xs tracking-wide text-brand-light">
          <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-brand-light align-middle" />
          {liveNotice}
        </p>
      </div>

      <main className="mx-auto max-w-3xl px-6 py-14">
        <p className="font-mono text-xs uppercase tracking-[0.15em] text-brand">Skill demo · by Shubhanshu Pandey</p>
        <h1 className="mt-2 font-serif text-4xl font-normal text-ink">What we&rsquo;re publishing</h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-muted">
          A small CMS I built to demonstrate role-gated publishing, tag-based content discovery, and
          real-time updates pushed over WebSocket the moment something publishes — no page refresh.
          Not a real company;{' '}
          <a href="https://github.com/senin142/portfolio1.0" target="_blank" rel="noopener" className="font-medium text-brand underline underline-offset-2">
            see the rest of my portfolio ↗
          </a>
          .
        </p>

        <div className="mt-7 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTag(null)}
            className={`badge border transition-colors ${
              activeTag === null
                ? 'border-ink bg-ink text-white'
                : 'border-line bg-white text-ink-muted hover:border-ink-dim'
            }`}
          >
            All
          </button>
          {tags.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTag(t.name)}
              className={`badge border transition-colors ${
                activeTag === t.name
                  ? 'border-brand bg-brand text-white'
                  : 'border-line bg-white text-ink-muted hover:border-brand-light hover:text-brand'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>

        <div className="mt-8 space-y-4">
          {loading ? (
            <p className="font-mono text-xs text-ink-dim">Loading…</p>
          ) : articles.length === 0 ? (
            <p className="font-mono text-xs text-ink-dim">No articles found.</p>
          ) : (
            articles.map((article) => (
              <Link key={article.id} href={`/articles/${article.slug}`} className="card group block p-6 transition-shadow hover:shadow-md">
                <h2 className="font-serif text-xl text-ink transition-colors group-hover:text-brand">{article.title}</h2>
                <p className="mt-2 line-clamp-2 text-[14.5px] leading-relaxed text-ink-muted">{article.body}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {article.tags.map((t) => (
                    <span key={t.id} className="badge bg-black/[0.04] text-ink-muted">
                      {t.name}
                    </span>
                  ))}
                </div>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
