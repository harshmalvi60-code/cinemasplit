'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useEffect, useState, MouseEvent } from 'react';
import { MoodWorld } from '@/lib/types';

const backdropCache = new Map<string, string | null>();

export function MoodWorldCard({ world }: { world: MoodWorld }) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [backdropUrl, setBackdropUrl] = useState<string | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  const firstEmotion = world.emotions[0]?.slug;
  const href = firstEmotion ? `/${world.slug}/${firstEmotion}` : '/';

  useEffect(() => {
    if (backdropCache.has(world.slug)) {
      setBackdropUrl(backdropCache.get(world.slug) ?? null);
      return;
    }
    fetch(`/api/world-backdrop?world=${encodeURIComponent(world.slug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { backdropUrl: string } | null) => {
        const url = d?.backdropUrl ?? null;
        backdropCache.set(world.slug, url);
        setBackdropUrl(url);
      })
      .catch(() => backdropCache.set(world.slug, null));
  }, [world.slug]);

  const handleMouseMove = (e: MouseEvent<HTMLAnchorElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${((e.clientX - rect.left) / rect.width) * 100}%`);
    el.style.setProperty('--my', `${((e.clientY - rect.top) / rect.height) * 100}%`);
  };

  return (
    <Link
      href={href}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="group relative block bg-bg-card overflow-hidden no-underline text-inherit isolate rounded-xl aspect-[4/5]"
      style={{ '--mx': '50%', '--my': '50%' } as React.CSSProperties}
    >
      {/* Gradient fallback */}
      <span
        aria-hidden
        className="absolute inset-0 -z-20 transition-all duration-700 ease-out group-hover:scale-[1.06]"
        style={{ background: world.tile, opacity: backdropUrl && imgLoaded ? 0 : 1 }}
      />

      {/* TMDB backdrop */}
      {backdropUrl && (
        <Image
          src={backdropUrl}
          alt={world.name}
          fill
          className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.06]"
          style={{ opacity: imgLoaded ? 1 : 0, zIndex: -20 }}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          onLoad={() => setImgLoaded(true)}
        />
      )}

      {/* Readability overlay */}
      <span
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.88) 100%)',
        }}
      />

      {/* Cyan spotlight */}
      <span
        aria-hidden
        className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: 'radial-gradient(circle 320px at var(--mx) var(--my), rgba(19,237,255,0.15), transparent 70%)',
        }}
      />

      {/* Border glow */}
      <span
        aria-hidden
        className="absolute inset-0 rounded-xl ring-1 ring-line group-hover:ring-accent/40 transition-all duration-500 group-hover:shadow-[0_0_0_1px_rgba(19,237,255,0.4),0_30px_60px_-20px_rgba(19,237,255,0.25)]"
      />

      <div className="relative z-10 h-full flex flex-col justify-between p-6 md:p-8">
        <div className="flex items-center gap-3 text-[11px] tracking-[0.32em] uppercase text-ink-soft font-semibold">
          <span className="inline-block w-5 h-px bg-ink-soft" />
          World {world.number}
        </div>

        <div>
          <h3 className="text-[34px] md:text-[40px] xl:text-[44px] font-bold text-ink leading-[1.05] tracking-[-0.025em] mb-3">
            {world.name}
          </h3>
          <p className="text-[14px] md:text-[15px] text-ink-soft leading-[1.45] mb-5 max-w-[280px]">
            {world.tagline}
          </p>

          <div className="flex flex-wrap gap-x-3 gap-y-1.5 mb-6">
            {world.emotions.map((e) => (
              <span
                key={e.slug}
                className="text-[11px] tracking-[0.08em] text-ink-soft bg-white/8 backdrop-blur-sm px-2.5 py-1 rounded-full font-medium border border-white/10"
              >
                {e.name}
              </span>
            ))}
          </div>

          <div className="flex justify-between items-center text-[12px] tracking-[0.18em] uppercase font-semibold">
            <span className="text-ink-soft">
              {world.emotions.length} {world.emotions.length === 1 ? 'emotion' : 'emotions'}
            </span>
            <span className="inline-flex items-center gap-2 group-hover:gap-3 transition-all duration-300 text-accent">
              Enter <span aria-hidden>&rarr;</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
