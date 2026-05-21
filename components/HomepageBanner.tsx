'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

// Rotate through worlds daily — deterministic by day of year
const WORLDS = [
  'spiritual-awakening',
  'healing',
  'grief',
  'hope',
  'inner-peace',
  'existential-confusion',
  'loneliness',
  'obsession',
  'burnout',
  'identity-crisis',
];

function todayWorld(): string {
  const day = Math.floor(Date.now() / 86400000);
  return WORLDS[day % WORLDS.length];
}

const cache = new Map<string, string | null>();

export default function HomepageBanner() {
  const worldSlug = todayWorld();
  const [url, setUrl]       = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (cache.has(worldSlug)) { setUrl(cache.get(worldSlug) ?? null); return; }
    fetch(`/api/world-backdrop?world=${encodeURIComponent(worldSlug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { backdropUrl: string } | null) => {
        const u = d?.backdropUrl ?? null;
        cache.set(worldSlug, u);
        setUrl(u);
      })
      .catch(() => cache.set(worldSlug, null));
  }, [worldSlug]);

  return (
    <div className="relative w-full overflow-hidden" style={{ height: 'clamp(220px, 32vw, 440px)' }}>
      {/* Gradient fallback — always visible */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          background: 'linear-gradient(135deg, #0d0f14 0%, #141820 50%, #0a0c10 100%)',
          opacity: loaded ? 0.3 : 1,
        }}
      />

      {/* TMDB backdrop */}
      {url && (
        <Image
          src={url}
          alt="Featured cinematic still"
          fill
          className="object-cover object-center transition-opacity duration-1000"
          style={{ opacity: loaded ? 1 : 0 }}
          sizes="100vw"
          priority
          onLoad={() => setLoaded(true)}
        />
      )}

      {/* Letterbox overlays */}
      {/* Left fade */}
      <div className="absolute inset-y-0 left-0 w-1/3"
        style={{ background: 'linear-gradient(to right, #06070a, transparent)' }} />
      {/* Right fade */}
      <div className="absolute inset-y-0 right-0 w-1/3"
        style={{ background: 'linear-gradient(to left, #06070a, transparent)' }} />
      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-32"
        style={{ background: 'linear-gradient(to bottom, transparent, #06070a)' }} />
      {/* Top fade */}
      <div className="absolute inset-x-0 top-0 h-16"
        style={{ background: 'linear-gradient(to bottom, #06070a, transparent)' }} />

      {/* Dark overall overlay so it doesn't overpower text */}
      <div className="absolute inset-0" style={{ background: 'rgba(6,7,10,0.45)' }} />
    </div>
  );
}
