'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

const cache = new Map<string, string | null>();

export default function WorldHeroBanner({ worldSlug }: { worldSlug: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (cache.has(worldSlug)) {
      setUrl(cache.get(worldSlug) ?? null);
      return;
    }
    fetch(`/api/world-backdrop?world=${encodeURIComponent(worldSlug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { backdropUrl: string } | null) => {
        const u = d?.backdropUrl ?? null;
        cache.set(worldSlug, u);
        setUrl(u);
      })
      .catch(() => cache.set(worldSlug, null));
  }, [worldSlug]);

  if (!url) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {/* Cinematic backdrop — right 60%, fading to black on the left */}
      <div className="absolute inset-0">
        <Image
          src={url}
          alt=""
          fill
          className="object-cover object-center transition-opacity duration-1000"
          style={{ opacity: loaded ? 1 : 0 }}
          sizes="100vw"
          priority
          onLoad={() => setLoaded(true)}
        />
        {/* Left-to-right gradient — keeps text readable on left */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, #06070a 0%, #06070a 35%, rgba(6,7,10,0.85) 55%, rgba(6,7,10,0.4) 75%, rgba(6,7,10,0.15) 100%)',
          }}
        />
        {/* Bottom fade for the section below */}
        <div
          className="absolute inset-x-0 bottom-0 h-48"
          style={{
            background: 'linear-gradient(to bottom, transparent, #06070a)',
          }}
        />
        {/* Top fade */}
        <div
          className="absolute inset-x-0 top-0 h-24"
          style={{
            background: 'linear-gradient(to bottom, #06070a, transparent)',
          }}
        />
      </div>
    </div>
  );
}
