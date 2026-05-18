'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { films } from '@/lib/data/films';
import { filmToSlug } from '@/lib/filmSlug';
import { Film, FilmIndex } from '@/lib/types';

interface Result {
  film: Film;
  worldSlug: string;
  emotionSlug: string;
}

// Build a flat array of all films with their location
const ALL_FILMS: Result[] = Object.entries(films as FilmIndex).flatMap(([key, list]) => {
  const [worldSlug, emotionSlug] = key.split('/');
  return list.map((film) => ({ film, worldSlug, emotionSlug }));
});

// De-duplicate by title (same film may appear in multiple emotions)
const UNIQUE_FILMS: Result[] = [];
const seen = new Set<string>();
for (const r of ALL_FILMS) {
  if (!seen.has(r.film.title)) {
    seen.add(r.film.title);
    UNIQUE_FILMS.push(r);
  }
}

export default function SearchPage() {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return UNIQUE_FILMS.filter(
      ({ film }) =>
        film.title.toLowerCase().includes(q) ||
        film.director.toLowerCase().includes(q) ||
        String(film.year).includes(q)
    ).slice(0, 30);
  }, [query]);

  return (
    <>
      <Nav currentPath="/search" />
      <main className="mx-auto max-w-[1440px] px-5 md:px-12 py-16 min-h-screen">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-6 bg-accent" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-accent">Search</span>
          </div>
          <h1 className="text-[40px] md:text-[64px] font-bold tracking-[-0.03em] text-ink mb-10">
            Find a film.
          </h1>
          <input
            type="text"
            autoFocus
            placeholder="Title, director, or year..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full max-w-[640px] rounded-2xl border border-white/15 bg-[#0b0d12] px-6 py-4 text-[18px] text-ink placeholder-ink-faint outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all"
          />
          {query && (
            <p className="mt-4 text-[12px] uppercase tracking-[0.2em] text-ink-muted">
              {results.length} result{results.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {results.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map(({ film, worldSlug, emotionSlug }) => (
              <Link
                key={`${film.title}-${film.year}`}
                href={`/film/${filmToSlug(film)}`}
                className="group flex gap-4 rounded-2xl border border-white/8 bg-[#0b0d12]/70 p-4 hover:border-accent/30 transition-all no-underline"
              >
                {/* Poster swatch */}
                <div data-mood={film.mood} className="w-14 h-20 shrink-0 rounded-lg overflow-hidden" />

                <div className="flex flex-col justify-center gap-1 min-w-0">
                  <p className="text-[14px] font-semibold text-ink leading-tight group-hover:text-accent transition-colors truncate">
                    {film.title}
                  </p>
                  <p className="text-[11px] text-ink-muted">
                    {film.director} &middot; {film.year}
                  </p>
                  <Link
                    href={`/${worldSlug}/${emotionSlug}`}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1 inline-block rounded-full border border-accent/25 bg-accent/8 px-2 py-0.5 text-[9px] uppercase tracking-[0.15em] text-accent hover:bg-accent/20 transition-all no-underline w-fit"
                  >
                    {emotionSlug.replace(/-/g, ' ')}
                  </Link>
                </div>

                <div className="ml-auto flex flex-col items-end justify-center shrink-0">
                  <div className="flex items-baseline gap-0.5 rounded-full border border-accent/40 bg-accent/8 px-2.5 py-1">
                    <span className="text-[8px] uppercase tracking-[0.12em] text-accent">CS</span>
                    <span className="text-sm font-bold text-ink">{film.rating.toFixed(1)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!query && (
          <div className="text-center py-20 text-ink-faint">
            <p className="text-[14px]">Search across {UNIQUE_FILMS.length} curated films</p>
          </div>
        )}

        {query && results.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[16px] text-ink-muted">No films found for "{query}"</p>
            <p className="text-[13px] text-ink-faint mt-2">Try a different title or director</p>
          </div>
        )}
      </main>
      <div className="mx-auto max-w-[1440px] px-5 md:px-12">
        <Footer />
      </div>
    </>
  );
}
