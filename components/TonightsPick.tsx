'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useEffect, useState } from 'react';
import { films } from '@/lib/data/films';
import { filmToSlug, getFilmEmotions } from '@/lib/filmSlug';
import { Film, FilmIndex } from '@/lib/types';
import { getAwards } from '@/lib/data/awards';
import type { PosterResult } from '@/app/api/poster/route';

// High-rated films eligible for Tonight's Pick
const ELIGIBLE = Object.values(films as FilmIndex)
  .flat()
  .filter((f) => f.rating >= 9.0);

const UNIQUE_ELIGIBLE: Film[] = [];
const seen = new Set<string>();
for (const f of ELIGIBLE) {
  if (!seen.has(f.title)) { seen.add(f.title); UNIQUE_ELIGIBLE.push(f); }
}

function getTonightsPick(): Film {
  const day = Math.floor(Date.now() / 86400000);
  return UNIQUE_ELIGIBLE[day % UNIQUE_ELIGIBLE.length];
}

export default function TonightsPick() {
  const film = useMemo(getTonightsPick, []);
  const [tmdb, setTmdb] = useState<PosterResult | null>(null);
  const [imgLoaded, setImg] = useState(false);

  const awards   = getAwards(film.title, film.year);
  const emotions = getFilmEmotions(film.title);
  const slug     = filmToSlug(film);

  useEffect(() => {
    const p = new URLSearchParams({ title: film.title, year: String(film.year) });
    fetch(`/api/poster?${p}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d: PosterResult | null) => setTmdb(d))
      .catch(() => {});
  }, [film.title, film.year]);

  const emotionHref = emotions[0] ? `/${emotions[0].worldSlug}/${emotions[0].emotionSlug}` : '/';

  return (
    <section className="mb-20 md:mb-28">
      <div className="flex items-center gap-3 mb-6">
        <span className="h-px w-6 bg-accent" />
        <span className="text-[10px] uppercase tracking-[0.32em] font-semibold text-accent">
          Tonight&apos;s Pick
        </span>
        <span className="text-[10px] text-ink-faint">— changes daily</span>
      </div>

      <Link href={`/film/${slug}`}
        className="group relative flex flex-col sm:flex-row gap-6 md:gap-10 overflow-hidden rounded-3xl border border-white/8 bg-[#0b0d12]/80 p-6 md:p-8 hover:border-accent/30 transition-all no-underline">

        {/* Backdrop */}
        {tmdb?.backdropUrl && (
          <>
            <Image src={tmdb.backdropUrl} alt={film.title} fill
              className="object-cover object-center transition-opacity duration-1000 opacity-20 group-hover:opacity-30"
              style={{ opacity: imgLoaded ? 0.2 : 0 }}
              sizes="100vw"
              onLoad={() => setImg(true)} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(6,7,10,0.95) 0%, rgba(6,7,10,0.7) 100%)' }} />
          </>
        )}

        {/* Poster */}
        <div className="relative w-[90px] sm:w-[110px] shrink-0 rounded-xl overflow-hidden shadow-xl">
          <div className="aspect-[2/3]">
            <div data-mood={film.mood} className="absolute inset-0 transition-opacity duration-700"
              style={{ opacity: tmdb?.posterUrl && imgLoaded ? 0 : 1 }} />
            {tmdb?.posterUrl && (
              <Image src={tmdb.posterUrl} alt={film.title} fill className="object-cover" sizes="110px" />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center gap-3 flex-1">
          <div className="flex items-baseline gap-3">
            <div className="flex items-baseline gap-1 rounded-full border border-accent/50 bg-black/60 px-2.5 py-1">
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-accent">CS</span>
              <span className="text-base font-semibold text-ink">{film.rating.toFixed(1)}</span>
            </div>
            <span className="text-[11px] text-ink-faint">{film.year}</span>
          </div>

          <h3 className="text-[26px] md:text-[34px] font-bold leading-tight tracking-[-0.02em] text-ink group-hover:text-accent transition-colors">
            {film.title}
          </h3>
          <p className="text-[13px] text-ink-muted">{film.director}</p>

          {awards && (
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/8 px-3 py-1 w-fit">
              <span className="text-amber-400 text-xs">🏆</span>
              <span className="text-[10px] font-semibold text-amber-300">{awards}</span>
            </div>
          )}

          <p className="text-[14px] leading-[1.65] text-ink-soft max-w-[580px] line-clamp-2">{film.story}</p>

          <div className="flex items-center gap-3 mt-1">
            {emotions.slice(0, 2).map(({ worldSlug, emotionSlug }) => (
              <span key={`${worldSlug}/${emotionSlug}`}
                className="rounded-full border border-accent/25 bg-accent/8 px-3 py-1 text-[10px] font-medium text-accent capitalize">
                {emotionSlug.replace(/-/g, ' ')}
              </span>
            ))}
            <span className="ml-auto text-[11px] uppercase tracking-[0.2em] text-accent group-hover:gap-3 transition-all font-semibold">
              View film →
            </span>
          </div>
        </div>
      </Link>
    </section>
  );
}
