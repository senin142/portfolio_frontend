'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { api } from '@/lib/api';
import { PublicArticle, Tag } from '@/lib/types';

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
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <span className="font-semibold text-slate-900">Content CMS</span>
          <Link href="/login" className="text-sm text-slate-500 hover:underline">
            Admin login
          </Link>
        </div>
      </header>

      {liveNotice && (
        <div className="bg-emerald-600 px-6 py-2 text-center text-sm font-medium text-white">{liveNotice}</div>
      )}

      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-semibold text-slate-900">Articles</h1>
        <p className="mt-1 text-sm text-slate-500">Live updates over WebSocket — no refresh needed when something new publishes.</p>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTag(null)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              activeTag === null ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-300'
            }`}
          >
            All
          </button>
          {tags.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTag(t.name)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                activeTag === t.name ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-300'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          {loading ? (
            <p className="text-sm text-slate-400">Loading…</p>
          ) : articles.length === 0 ? (
            <p className="text-sm text-slate-400">No articles found.</p>
          ) : (
            articles.map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                className="block rounded-lg border border-slate-200 bg-white p-5 hover:border-slate-400"
              >
                <h2 className="font-medium text-slate-900">{article.title}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{article.body}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {article.tags.map((t) => (
                    <span key={t.id} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
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
