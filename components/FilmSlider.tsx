'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useEffect, useState } from 'react';
import { Film } from '@/lib/types';
import { filmToSlug } from '@/lib/filmSlug';
import { getAwards } from '@/lib/data/awards';
import type { PosterResult } from '@/app/api/poster/route';

const cache = new Map<string, PosterResult | null>();

function SlideCard({ film }: { film: Film }) {
  const [tmdb, setTmdb] = useState<PosterResult | null>(null);
  const [loaded, setLoaded] = useState(false);
  const key = `${film.title}-${film.year}`;
  const awards = getAwards(film.title, film.year);

  useEffect(() => {
    if (cache.has(key)) { setTmdb(cache.get(key) ?? null); return; }
    const p = new URLSearchParams({ title: film.title, year: String(film.year) });
    fetch(`/api/poster?${p}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d: PosterResult | null) => { cache.set(key, d); setTmdb(d); })
      .catch(() => cache.set(key, null));
  }, [key, film.title, film.year]);

  return (
    <Link
      href={`/film/${filmToSlug(film)}`}
      className="group relative flex-shrink-0 w-[200px] sm:w-[220px] rounded-2xl overflow-hidden border border-white/8 bg-[#0b0d12]/80 hover:border-accent/40 transition-all no-underline"
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <div data-mood={film.mood} className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: tmdb?.posterUrl && loaded ? 0 : 1 }} />
        {tmdb?.posterUrl && (
          <Image src={tmdb.posterUrl} alt={film.title} fill
            className="object-cover transition-all duration-700 group-hover:scale-105"
            style={{ opacity: loaded ? 1 : 0 }}
            sizes="220px"
            onLoad={() => setLoaded(true)} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

        {/* Rating */}
        <div className="absolute left-3 top-3 z-10 flex items-baseline gap-0.5 rounded-full border border-accent/50 bg-black/60 px-2 py-0.5 backdrop-blur-sm">
          <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-accent">CS</span>
          <span className="text-xs font-semibold text-ink">{film.rating.toFixed(1)}</span>
        </div>

        {/* Bottom */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-4">
          <p className="text-[13px] font-semibold text-ink leading-tight line-clamp-2">{film.title}</p>
          <p className="text-[10px] text-ink-muted mt-1">{film.director} · {film.year}</p>
        </div>
      </div>

      {/* Awards strip */}
      {awards && (
        <div className="px-3 py-2 border-t border-white/6">
          <p className="text-[9px] text-amber-400 truncate">🏆 {awards.split('·')[0].trim()}</p>
        </div>
      )}
    </Link>
  );
}

export default function FilmSlider({ films, label }: { films: Film[]; label?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft]   = useState(false);
  const [canRight, setCanRight] = useState(true);

  const scroll = (dir: 'left' | 'right') => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'right' ? 480 : -480, behavior: 'smooth' });
  };

  const update = () => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 10);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => { update(); }, []);

  return (
    <div className="relative">
      {label && (
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <span className="h-px w-5 bg-accent/60" />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent/70">{label}</p>
          </div>
          <div className="flex gap-2">
            <Arrow dir="left"  enabled={canLeft}  onClick={() => scroll('left')} />
            <Arrow dir="right" enabled={canRight} onClick={() => scroll('right')} />
          </div>
        </div>
      )}
      <div
        ref={ref}
        onScroll={update}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-4 no-scrollbar"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {films.map((film) => (
          <div key={`${film.title}-${film.year}`} style={{ scrollSnapAlign: 'start' }}>
            <SlideCard film={film} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Arrow({ dir, enabled, onClick }: { dir: 'left' | 'right'; enabled: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={!enabled}
      className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all ${
        enabled
          ? 'border-white/20 text-ink-soft hover:border-accent/50 hover:text-accent hover:bg-accent/8'
          : 'border-white/6 text-ink-faint cursor-not-allowed opacity-40'
      }`}
    >
      {dir === 'left' ? '←' : '→'}
    </button>
  );
}
