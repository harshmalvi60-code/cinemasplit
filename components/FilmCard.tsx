'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Film } from '@/lib/types';
import { justWatchUrl, youTubeTrailerUrl } from '@/lib/data/films';
import WatchedToggle from './WatchedToggle';
import type { PosterResult, SimilarFilm, OttProvider } from '@/app/api/poster/route';

const posterCache = new Map<string, PosterResult | null>();

function fmt(n: number) {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000)     return `$${(n / 1_000_000).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

function fmtVotes(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export default function FilmCard({ film }: { film: Film }) {
  const [tmdb, setTmdb]     = useState<PosterResult | null>(null);
  const [imgLoaded, setImg] = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const key = `${film.title}-${film.year}`;

  useEffect(() => {
    if (posterCache.has(key)) { setTmdb(posterCache.get(key) ?? null); return; }
    const p = new URLSearchParams({ title: film.title, year: String(film.year) });
    fetch(`/api/poster?${p}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: PosterResult | null) => { posterCache.set(key, d); setTmdb(d); })
      .catch(() => posterCache.set(key, null));
  }, [key, film.title, film.year]);

  const cast       = tmdb?.cast        ?? film.cast ?? [];
  const runtime    = tmdb?.runtime     ?? film.runtime;
  const genres     = tmdb?.genres      ?? [];
  const cert       = tmdb?.certification;
  const tagline    = tmdb?.tagline;
  const collection = tmdb?.collection;
  const voteCount  = tmdb?.voteCount;
  const voteAvg    = tmdb?.voteAverage;
  const popularity = tmdb?.popularity;
  const budget     = tmdb?.budget;
  const revenue    = tmdb?.revenue;
  const langs      = tmdb?.spokenLanguages  ?? [];
  const companies  = tmdb?.productionCompanies ?? [];
  const providers  = tmdb?.ottProviders ?? [];
  const similar    = tmdb?.similar     ?? [];
  const country    = tmdb?.originalLanguage;

  const ottHref     = tmdb?.ottLink ?? justWatchUrl(film, 'in');
  const trailerHref = tmdb?.trailerKey
    ? `https://www.youtube.com/watch?v=${tmdb.trailerKey}`
    : youTubeTrailerUrl(film);
  const trailerEmbed = tmdb?.trailerKey
    ? `https://www.youtube.com/embed/${tmdb.trailerKey}?autoplay=1&rel=0`
    : null;

  const isPopular = popularity && popularity > 50;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-[#0b0d12]/70 backdrop-blur-sm transition-all duration-500 hover:border-accent/30">

      {/* ── POSTER ─────────────────────────────────────────────────────── */}
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        {/* Gradient fallback */}
        <div data-mood={film.mood} className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: tmdb?.posterUrl && imgLoaded ? 0 : 1 }} />

        {/* TMDB poster */}
        {tmdb?.posterUrl && (
          <Image src={tmdb.posterUrl} alt={`${film.title} poster`} fill
            className="object-cover transition-all duration-700 group-hover:scale-105"
            style={{ opacity: imgLoaded ? 1 : 0 }}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            onLoad={() => setImg(true)} />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-black/10" />
        <div className="absolute inset-0 grain opacity-20 mix-blend-overlay" />

        {/* Trending badge */}
        {isPopular && (
          <div className="absolute left-4 top-4 z-10 flex items-center gap-1.5 rounded-full bg-accent/90 px-2.5 py-1">
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-black">Trending</span>
          </div>
        )}

        {/* Rating + meta row */}
        <div className={`absolute z-10 flex items-center gap-1.5 ${isPopular ? 'right-4 top-4' : 'left-4 top-4'}`}>
          <div className="flex items-baseline gap-1 rounded-full border border-accent/50 bg-black/60 px-2.5 py-1 backdrop-blur-sm">
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-accent">CS</span>
            <span className="text-sm font-semibold text-ink">{film.rating.toFixed(1)}</span>
          </div>
          {cert && (
            <span className="rounded-full border border-white/20 bg-black/50 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-ink-muted backdrop-blur-sm">
              {cert}
            </span>
          )}
        </div>

        <div className="absolute right-4 top-4 z-10 flex flex-col items-end gap-1.5">
          {runtime && (
            <span className="rounded-full bg-black/50 px-2.5 py-1 text-[10px] text-ink-muted backdrop-blur-sm">
              {runtime}m
            </span>
          )}
          <span className="rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-ink-muted backdrop-blur-sm">
            {film.year}
          </span>
        </div>

        <WatchedToggle filmKey={key} />

        <div className="absolute inset-x-0 bottom-0 z-10 p-5 pt-16">
          {collection && (
            <p className="mb-1 text-[9px] uppercase tracking-[0.2em] text-accent/80">{collection}</p>
          )}
          <h3 className="text-xl font-semibold leading-tight text-ink">{film.title}</h3>
          <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-ink-muted">{film.director}</p>
        </div>
      </div>

      {/* ── BODY ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-5 p-6">

        {/* Tagline */}
        {tagline && (
          <p className="text-sm italic leading-relaxed text-ink-muted">"{tagline}"</p>
        )}

        {/* Vote count + TMDB score */}
        {voteCount && voteCount > 0 && (
          <div className="flex items-center gap-3 border-b border-white/6 pb-4">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-ink">{voteAvg?.toFixed(1)}</span>
              <span className="text-[10px] text-ink-faint">/10</span>
            </div>
            <span className="text-[11px] text-ink-muted">
              Rated by {fmtVotes(voteCount)} people
            </span>
            {country && (
              <span className="ml-auto text-[10px] uppercase tracking-[0.15em] text-ink-faint">
                {country.toUpperCase()}
              </span>
            )}
          </div>
        )}

        {/* Cast */}
        {cast.length > 0 && (
          <div>
            <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.25em] text-accent/70">Cast</p>
            <p className="text-xs leading-relaxed text-ink-muted">{cast.join(' · ')}</p>
          </div>
        )}

        {/* Genres */}
        {genres.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {genres.map((g) => (
              <span key={g} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] text-ink-muted">
                {g}
              </span>
            ))}
          </div>
        )}

        {/* Story */}
        <div>
          <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.25em] text-accent/70">Story</p>
          <p className="text-sm leading-relaxed text-ink-soft">{film.story}</p>
        </div>

        {/* Why this film */}
        <div>
          <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.25em] text-accent/70">Why this film</p>
          <p className="text-sm leading-relaxed text-ink-soft">{film.why}</p>
        </div>

        {/* 5-section review */}
        <div className="space-y-3.5 border-t border-white/8 pt-5">
          {([
            ['Direction',          film.direction],
            ['Cinematography',     film.cinematography],
            ['Music & Sound',      film.musicSound],
            ['Emotional Impact',   film.impact],
            ['Overall Experience', film.overall],
          ] as [string, string][]).map(([label, body]) => (
            <div key={label}>
              <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-accent/70">{label}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">{body}</p>
            </div>
          ))}
        </div>

        {/* After the credits */}
        <p className="border-t border-white/8 pt-5 text-sm italic leading-relaxed text-ink-muted">
          <span className="not-italic text-accent">— </span>{film.after}
        </p>

        {/* ── OTT PROVIDERS ────────────────────────────────────────────── */}
        <div className="border-t border-white/8 pt-5">
          <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.25em] text-accent/70">
            Where to Watch
          </p>
          {providers.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              {providers.map((p: OttProvider) => (
                <a key={p.name} href={ottHref} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 transition-all hover:border-accent/40 hover:bg-accent/8">
                  <Image src={p.logoUrl} alt={p.name} width={20} height={20} className="rounded-sm" />
                  <span className="text-[11px] font-medium text-ink-soft">{p.name}</span>
                </a>
              ))}
            </div>
          ) : (
            <a href={ottHref} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-accent transition-all hover:bg-accent hover:text-black">
              Find on streaming →
            </a>
          )}
        </div>

        {/* ── TRAILER ──────────────────────────────────────────────────── */}
        <div>
          {trailerEmbed ? (
            trailerOpen ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-xl">
                <iframe src={trailerEmbed} title={`${film.title} trailer`}
                  className="absolute inset-0 h-full w-full" allow="autoplay; encrypted-media" allowFullScreen />
                <button onClick={() => setTrailerOpen(false)}
                  className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[10px] text-ink-muted hover:text-ink">
                  ✕ Close
                </button>
              </div>
            ) : (
              <button onClick={() => setTrailerOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-white/20 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-soft transition-all hover:border-white/50 hover:text-ink">
                <span className="text-base leading-none">▸</span> Watch Trailer
              </button>
            )
          ) : (
            <a href={trailerHref} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-full border border-white/20 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-soft transition-all hover:border-white/50 hover:text-ink">
              <span className="text-base leading-none">▸</span> Watch Trailer
            </a>
          )}
        </div>

        {/* ── FILM DETAILS (collapsible) ────────────────────────────────── */}
        {(budget || revenue || langs.length > 0 || companies.length > 0) && (
          <div className="border-t border-white/8 pt-4">
            <button
              onClick={() => setDetailsOpen((v) => !v)}
              className="flex w-full items-center justify-between text-[10px] uppercase tracking-[0.25em] text-ink-muted hover:text-ink-soft transition-colors"
            >
              <span>Film Details</span>
              <span>{detailsOpen ? '▲' : '▼'}</span>
            </button>
            {detailsOpen && (
              <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
                {budget && budget > 0 && (
                  <DetailItem label="Budget" value={fmt(budget)} />
                )}
                {revenue && revenue > 0 && (
                  <DetailItem label="Box Office" value={fmt(revenue)} />
                )}
                {langs.length > 0 && (
                  <DetailItem label="Languages" value={langs.slice(0, 2).join(', ')} />
                )}
                {companies.length > 0 && (
                  <DetailItem label="Studio" value={companies[0]} />
                )}
              </div>
            )}
          </div>
        )}

        {/* ── SIMILAR FILMS ────────────────────────────────────────────── */}
        {similar.length > 0 && (
          <div className="border-t border-white/8 pt-5">
            <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.25em] text-accent/70">
              You Might Also Feel
            </p>
            <div className="flex gap-3">
              {similar.map((s: SimilarFilm) => (
                <div key={s.tmdbId} className="flex flex-1 flex-col gap-1.5">
                  <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-white/5">
                    {s.posterUrl ? (
                      <Image src={s.posterUrl} alt={s.title} fill className="object-cover" sizes="80px" />
                    ) : (
                      <div className="absolute inset-0 bg-white/5" />
                    )}
                  </div>
                  <p className="text-[10px] font-medium leading-tight text-ink-muted line-clamp-2">{s.title}</p>
                  <p className="text-[9px] text-ink-faint">{s.year}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] uppercase tracking-[0.2em] text-ink-faint">{label}</p>
      <p className="mt-0.5 text-[11px] text-ink-soft">{value}</p>
    </div>
  );
}
