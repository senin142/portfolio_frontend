'use client';

import { FormEvent, useState } from 'react';
import { Article, ArticleInput } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

      <div className="space-y-1.5">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          required
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="my-article-slug"
          className="font-mono"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="body">Body</Label>
        <Textarea id="body" required rows={12} value={body} onChange={(e) => setBody(e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tags">Tags</Label>
        <Input
          id="tags"
          value={tagsText}
          onChange={(e) => setTagsText(e.target.value)}
          placeholder="product, announcements"
        />
        <p className="text-xs text-muted-foreground">
          Comma-separated. Powers &quot;similar articles&quot; on the public site.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox id="published" checked={published} onCheckedChange={(c) => setPublished(c === true)} />
        <Label htmlFor="published" className="cursor-pointer font-normal">
          Published
        </Label>
      </div>

      <Button type="submit" disabled={submitting}>
        {submitting ? 'Saving…' : submitLabel}
      </Button>
    </form>
  );
}
