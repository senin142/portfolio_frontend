'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { API_URL } from '@/lib/api';
import { Article, Tag } from '@/lib/types';

// Horizontal slider of related articles (the backend ranks them by number of
// shared tags). Native scroll-snap does the sliding, so touch swipe, trackpad
// and keyboard scrolling all work; the buttons just scroll by one card.
export default function RelatedSlider({ articles, currentTags }: { articles: Article[]; currentTags: Tag[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const currentTagIds = new Set(currentTags.map((t) => t.id));

  function syncEnds() {
    const track = trackRef.current;
    if (!track) return;
    setAtStart(track.scrollLeft <= 2);
    setAtEnd(track.scrollLeft + track.clientWidth >= track.scrollWidth - 2);
  }

  useEffect(() => {
    syncEnds();
    window.addEventListener('resize', syncEnds);
    return () => window.removeEventListener('resize', syncEnds);
  }, [articles]);

  function slide(direction: 1 | -1) {
    const track = trackRef.current;
    const card = track?.querySelector<HTMLElement>('[data-slide]');
    if (!track || !card) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.scrollBy({ left: direction * (card.offsetWidth + 16), behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  const showControls = !(atStart && atEnd);

  return (
    <section aria-labelledby="related-heading" className="mt-14 border-t border-line pt-7">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 id="related-heading" className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-ink-dim">
            Related news
          </h2>
          <p className="mt-1 text-sm text-ink-muted">Articles that share a tag with this one.</p>
        </div>
        {showControls && (
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => slide(-1)}
              disabled={atStart}
              className="rounded-lg border border-line px-3 py-2 text-sm text-ink-muted transition-colors hover:border-ink-dim hover:text-ink disabled:opacity-40"
            >
              ← Previous
            </button>
            <button
              type="button"
              onClick={() => slide(1)}
              disabled={atEnd}
              className="rounded-lg border border-line px-3 py-2 text-sm text-ink-muted transition-colors hover:border-ink-dim hover:text-ink disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      <div
        ref={trackRef}
        onScroll={syncEnds}
        className="mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3"
      >
        {articles.map((r) => (
          <RelatedCard key={r.id} article={r} currentTagIds={currentTagIds} />
        ))}
      </div>
    </section>
  );
}

function RelatedCard({ article, currentTagIds }: { article: Article; currentTagIds: Set<string> }) {
  const [hasImage, setHasImage] = useState(true);

  return (
    <Link
      data-slide
      href={`/articles/${article.slug}`}
      className="card group flex w-[78%] shrink-0 snap-start flex-col overflow-hidden transition-shadow hover:shadow-md sm:w-[calc(50%-8px)]"
    >
      {hasImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`${API_URL}/public/articles/${article.slug}/image`}
          alt=""
          loading="lazy"
          onError={() => setHasImage(false)}
          className="aspect-[16/9] w-full border-b border-line object-cover"
        />
      )}
      <div className="flex flex-1 flex-col p-4">
        <div className="font-serif text-lg leading-snug text-ink transition-colors group-hover:text-brand">{article.title}</div>
        <time dateTime={article.createdAt} className="mt-1 text-xs text-ink-dim">
          {new Date(article.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
        </time>
        <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
          {article.tags.map((t) => (
            <span
              key={t.id}
              className={`badge ${
                currentTagIds.has(t.id) ? 'bg-brand-soft text-brand' : 'bg-black/[0.04] text-ink-muted dark:bg-white/[0.08]'
              }`}
            >
              {t.name}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
