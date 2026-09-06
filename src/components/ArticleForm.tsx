'use client';

import { FormEvent, useState } from 'react';
import { Article, ArticleInput } from '@/lib/types';

export default function ArticleForm({
  initial,
  onSubmit,
  submitLabel,
}: {
  initial?: Partial<Article>;
  onSubmit: (input: ArticleInput) => Promise<void>;
  submitLabel: string;
}) {
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [body, setBody] = useState(initial?.body ?? '');
  const [published, setPublished] = useState(initial?.published ?? false);
  const [tagsText, setTagsText] = useState((initial?.tags ?? []).map((t) => t.name).join(', '));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const tags = tagsText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      await onSubmit({ slug, title, body, published, tags });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-6 p-7">
      {error && <p className="error-banner">{error}</p>}

      <div>
        <label className="field-label">Slug</label>
        <input
          required
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="my-article-slug"
          className="field-input font-mono"
        />
      </div>

      <div>
        <label className="field-label">Title</label>
        <input required value={title} onChange={(e) => setTitle(e.target.value)} className="field-input" />
      </div>

      <div>
        <label className="field-label">Body</label>
        <textarea
          required
          rows={12}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="field-input font-serif text-[15px] leading-relaxed"
        />
      </div>

      <div>
        <label className="field-label">Tags</label>
        <input
          value={tagsText}
          onChange={(e) => setTagsText(e.target.value)}
          placeholder="product, announcements"
          className="field-input"
        />
        <p className="mt-1.5 text-xs text-ink-dim">Comma-separated. Powers "similar articles" on the public site.</p>
      </div>

      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="h-4 w-4 rounded border-line text-brand focus:ring-brand-light"
        />
        Published
      </label>

      <button type="submit" disabled={submitting} className="btn-primary">
        {submitting ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}
