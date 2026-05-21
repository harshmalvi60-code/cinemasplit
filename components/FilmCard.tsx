'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Film } from '@/lib/types';
import { filmToSlug } from '@/lib/filmSlug';
import WatchedToggle from './WatchedToggle';
import type { PosterResult } from '@/app/api/poster/route';

const posterCache = new Map<string, PosterResult | null>();

export default function FilmCard({ film }: { film: Film }) {
  const [tmdb, setTmdb] = useState<PosterResult | null>(null);
  const [imgLoaded, setImg] = useState(false);

  const key = `${film.title}-${film.year}`;
  const slug = filmToSlug(film);

  useEffect(() => {
    if (posterCache.has(key)) { setTmdb(posterCache.get(key) ?? null); return; }
    const p = new URLSearchParams({ title: film.title, year: String(film.year) });
    fetch(`/api/poster?${p}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: PosterResult | null) => { posterCache.set(key, d); setTmdb(d); })
      .catch(() => posterCache.set(key, null));
  }, [key, film.title, film.year]);

  const castNames = (tmdb?.cast ?? []).map((c) =>
    typeof c === 'string' ? c : c.name
  );
  const genres    = tmdb?.genres ?? [];
  const tagline   = tmdb?.tagline;
  const isPopular = (tmdb?.popularity ?? 0) > 50;

  return (
    <Link
      href={`/film/${slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-[#0b0d12]/80 backdrop-blur-sm transition-all duration-500 hover:border-accent/30 hover:shadow-[0_0_40px_rgba(19,237,255,0.06)] no-underline"
    >
      {/* ── POSTER ─────────────────────────────────────────────────────── */}
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        {/* Mood gradient fallback */}
        <div
          data-mood={film.mood}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: tmdb?.posterUrl && imgLoaded ? 0 : 1 }}
        />

        {/* TMDB poster */}
        {tmdb?.posterUrl && (
          <Image
            src={tmdb.posterUrl}
            alt={`${film.title} poster`}
            fill
            className="object-cover transition-all duration-700 group-hover:scale-[1.04]"
            style={{ opacity: imgLoaded ? 1 : 0 }}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onLoad={() => setImg(true)}
          />
        )}

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/15 to-transparent" />
        <div className="absolute inset-0 grain opacity-[0.15] mix-blend-overlay" />

        {/* Trending badge */}
        {isPopular && (
          <div className="absolute left-3 top-3 z-10 rounded-full bg-accent/90 px-2.5 py-0.5">
            <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-black">Trending</span>
          </div>
        )}

        {/* Rating */}
        <div className={`absolute z-10 ${isPopular ? 'right-3 top-3' : 'left-3 top-3'}`}>
          <div className="flex items-baseline gap-0.5 rounded-full border border-accent/50 bg-black/65 px-2 py-0.5 backdrop-blur-sm">
            <span className="text-[7px] font-bold uppercase tracking-[0.15em] text-accent">CS</span>
            <span className="text-xs font-semibold text-ink">{film.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Year + runtime */}
        <div className="absolute right-3 top-3 z-10 flex flex-col items-end gap-1">
          {!isPopular && (
            <span className="rounded-full border border-white/15 bg-black/50 px-2 py-0.5 text-[9px] uppercase tracking-[0.1em] text-ink-muted backdrop-blur-sm">
              {film.year}
            </span>
          )}
          {tmdb?.runtime && (
            <span className="rounded-full bg-black/50 px-2 py-0.5 text-[9px] text-ink-muted backdrop-blur-sm">
              {tmdb.runtime}m
            </span>
          )}
        </div>

        {/* Watched toggle */}
        <WatchedToggle filmKey={key} />

        {/* Title overlay */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-4 pt-14">
          <h3 className="text-[15px] font-semibold leading-tight text-ink line-clamp-2">{film.title}</h3>
          <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-ink-muted">{film.director}</p>
        </div>

        {/* Hover reveal — "View Film" */}
        <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="rounded-full border border-accent/60 bg-black/70 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent backdrop-blur-sm">
            View Film →
          </span>
        </div>
      </div>

      {/* ── BODY ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 p-4">
        {/* Tagline or story */}
        <p className="text-[12px] leading-relaxed text-ink-soft line-clamp-2">
          {tagline ? `"${tagline}"` : film.story}
        </p>

        {/* Cast */}
        {castNames.length > 0 && (
          <p className="text-[10px] leading-relaxed text-ink-muted line-clamp-1">
            {castNames.slice(0, 3).join(' · ')}
          </p>
        )}

        {/* Genres */}
        {genres.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {genres.slice(0, 2).map((g) => (
              <span key={g} className="rounded-full border border-white/8 bg-white/4 px-2 py-0.5 text-[9px] text-ink-muted">
                {g}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
