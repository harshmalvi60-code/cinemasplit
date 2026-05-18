'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { films } from '@/lib/data/films';
import { filmToSlug } from '@/lib/filmSlug';
import { Film, FilmIndex } from '@/lib/types';

function getWatched(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try { return new Set(JSON.parse(localStorage.getItem('cinemasplit_watched') ?? '[]')); }
  catch { return new Set(); }
}

function getWatchlist(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try { return new Set(JSON.parse(localStorage.getItem('cinemasplit_watchlist') ?? '[]')); }
  catch { return new Set(); }
}

function findFilm(key: string): Film | undefined {
  for (const list of Object.values(films as FilmIndex)) {
    const f = list.find((f) => `${f.title}-${f.year}` === key);
    if (f) return f;
  }
}

function filmEmotion(title: string): string {
  for (const [key, list] of Object.entries(films as FilmIndex)) {
    if (list.some((f) => f.title === title)) return key.split('/')[1].replace(/-/g, ' ');
  }
  return '';
}

export default function WatchlistPage() {
  const [watched,   setWatched]   = useState<Set<string>>(new Set());
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());

  useEffect(() => {
    setWatched(getWatched());
    setWatchlist(getWatchlist());
  }, []);

  const watchedFilms   = [...watched].map(findFilm).filter(Boolean) as Film[];
  const watchlistFilms = [...watchlist].filter((k) => !watched.has(k)).map(findFilm).filter(Boolean) as Film[];

  return (
    <>
      <Nav currentPath="/watchlist" />
      <main className="mx-auto max-w-[1440px] px-5 md:px-12 py-16 min-h-screen">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-6 bg-accent" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-accent">Your Cinema</span>
          </div>
          <h1 className="text-[40px] md:text-[64px] font-bold tracking-[-0.03em] text-ink">
            Your Films.
          </h1>
          <div className="flex gap-6 mt-4 text-[12px] uppercase tracking-[0.2em] text-ink-muted">
            <span><span className="text-ink font-semibold">{watchedFilms.length}</span> watched</span>
            <span><span className="text-ink font-semibold">{watchlistFilms.length}</span> saved</span>
          </div>
        </div>

        {watchedFilms.length === 0 && watchlistFilms.length === 0 && (
          <div className="text-center py-24">
            <p className="text-[16px] text-ink-muted">You haven&apos;t saved any films yet.</p>
            <p className="text-[13px] text-ink-faint mt-2">
              Mark films as watched using the ✓ button on each film card.
            </p>
            <Link href="/" className="mt-6 inline-block rounded-full border border-accent bg-accent/10 px-6 py-3 text-[11px] uppercase tracking-[0.2em] text-accent hover:bg-accent hover:text-black transition-all no-underline">
              Browse Films →
            </Link>
          </div>
        )}

        {watchedFilms.length > 0 && (
          <div className="mb-16">
            <SectionHeader label="Watched" count={watchedFilms.length} />
            <FilmGrid films={watchedFilms} />
          </div>
        )}

        {watchlistFilms.length > 0 && (
          <div>
            <SectionHeader label="Saved for Later" count={watchlistFilms.length} />
            <FilmGrid films={watchlistFilms} />
          </div>
        )}
      </main>
      <div className="mx-auto max-w-[1440px] px-5 md:px-12">
        <Footer />
      </div>
    </>
  );
}

function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="h-px w-5 bg-accent/60" />
      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent/70">{label}</p>
      <span className="rounded-full bg-accent/10 border border-accent/25 px-2 py-0.5 text-[9px] text-accent font-semibold">{count}</span>
    </div>
  );
}

function FilmGrid({ films: list }: { films: Film[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {list.map((film) => (
        <Link
          key={`${film.title}-${film.year}`}
          href={`/film/${filmToSlug(film)}`}
          className="group flex gap-4 rounded-2xl border border-white/8 bg-[#0b0d12]/70 p-4 hover:border-accent/30 transition-all no-underline"
        >
          <div data-mood={film.mood} className="w-14 h-20 shrink-0 rounded-lg overflow-hidden" />
          <div className="flex flex-col justify-center gap-1 min-w-0">
            <p className="text-[13px] font-semibold text-ink leading-tight group-hover:text-accent transition-colors truncate">{film.title}</p>
            <p className="text-[11px] text-ink-muted">{film.director} &middot; {film.year}</p>
            <p className="text-[10px] text-ink-faint capitalize">{filmEmotion(film.title)}</p>
          </div>
          <div className="ml-auto flex items-center shrink-0">
            <div className="flex items-baseline gap-0.5 rounded-full border border-accent/40 bg-accent/8 px-2.5 py-1">
              <span className="text-[8px] uppercase tracking-[0.12em] text-accent">CS</span>
              <span className="text-sm font-bold text-ink">{film.rating.toFixed(1)}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
