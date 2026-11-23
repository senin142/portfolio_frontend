'use client';

import { useEffect, useState } from 'react';

// The backend runs on Render's free tier, which sleeps when idle — the first
// request after a quiet spell can take ~30s. A bare "Loading…" for that long
// reads as broken, so after a few seconds we say why it's slow.
const SLOW_AFTER_MS = 3000;

export default function LoadingNote({ label = 'Loading…', className = '' }: { label?: string; className?: string }) {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), SLOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div role="status" aria-live="polite" className={`font-mono text-xs text-ink-dim ${className}`}>
      <p>{label}</p>
      {slow && (
        <p className="mt-1.5 font-sans text-sm text-ink-muted">
          The demo server sleeps when idle and can take about 30 seconds to wake up.
        </p>
      )}
    </div>
  );
}
