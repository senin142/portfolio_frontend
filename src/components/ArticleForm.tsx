'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Article, ArticleInput, MediaUsage } from '@/lib/types';

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

      {initial?.id && <ImageUploader articleId={initial.id} />}
    </form>
  );
}

// Save the article first to get an id, then attach an image to it — matches how the
// rest of the app is wired (media rows have a required articleId foreign key).
function ImageUploader({ articleId }: { articleId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [resize, setResize] = useState(true);
  const [preview, setPreview] = useState<string | null>(null);
  const [hasImage, setHasImage] = useState(false);
  const [usage, setUsage] = useState<MediaUsage | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<{ sizeBytes: number; resized: boolean } | null>(null);

  async function loadPreview() {
    const blob = await api.fetchImage(articleId);
    if (blob) {
      setPreview((old) => {
        if (old) URL.revokeObjectURL(old);
        return URL.createObjectURL(blob);
      });
      setHasImage(true);
    } else {
      setHasImage(false);
    }
  }

  async function loadUsage() {
    api.get<MediaUsage>('/media/usage').then(setUsage).catch(() => {});
  }

  useEffect(() => {
    loadPreview();
    loadUsage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId]);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] ?? null);
    setUploadError(null);
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const result = await api.uploadImage<{ sizeBytes: number; resized: boolean }>(articleId, file, resize);
      setLastResult(result);
      setFile(null);
      await loadPreview();
      await loadUsage();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    setUploading(true);
    try {
      await api.delete(`/media/articles/${articleId}`);
      setPreview((old) => {
        if (old) URL.revokeObjectURL(old);
        return null;
      });
      setHasImage(false);
      setLastResult(null);
      await loadUsage();
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="border-t border-line pt-6">
      <label className="field-label">Image</label>

      {hasImage && preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Article" className="mb-3 max-h-48 rounded-lg border border-line object-cover" />
      )}

      <div className="flex flex-wrap items-center gap-3">
        <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm text-ink-muted" />
        <label className="flex items-center gap-1.5 text-sm text-ink">
          <input
            type="checkbox"
            checked={resize}
            onChange={(e) => setResize(e.target.checked)}
            className="h-4 w-4 rounded border-line text-brand focus:ring-brand-light"
          />
          Resize before upload
        </label>
        <button
          type="button"
          onClick={handleUpload}
          disabled={!file || uploading}
          className="rounded-md border border-line px-3 py-1.5 text-sm font-medium text-ink hover:border-brand-light disabled:opacity-50"
        >
          {uploading ? 'Uploading…' : 'Upload image'}
        </button>
        {hasImage && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={uploading}
            className="text-sm text-ink-dim hover:text-red-600"
          >
            Remove
          </button>
        )}
      </div>

      <p className="mt-1.5 text-xs text-ink-dim">
        Resizing downsamples to a max width of 1600px and re-encodes as JPEG — usually a 70-90% size reduction,
        which matters here since this demo shares a single 150MB storage cap across every article.
      </p>
      {uploadError && <p className="mt-1.5 text-xs text-red-600">{uploadError}</p>}
      {lastResult && (
        <p className="mt-1.5 text-xs text-ink-dim">
          Stored {(lastResult.sizeBytes / 1024).toFixed(0)}KB {lastResult.resized ? '(resized)' : '(original, not resized)'}.
        </p>
      )}
      {usage && (
        <div className="mt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.08]">
            <div
              className={`h-full rounded-full ${usage.percentUsed > 90 ? 'bg-red-500' : 'bg-brand'}`}
              style={{ width: `${Math.min(100, usage.percentUsed)}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-ink-dim">
            Storage: {(usage.usedBytes / 1024 / 1024).toFixed(1)}MB / {(usage.capBytes / 1024 / 1024).toFixed(0)}MB
            {' '}({usage.percentUsed}%) across all articles — oldest images are evicted automatically past the cap.
          </p>
        </div>
      )}
    </div>
  );
}
