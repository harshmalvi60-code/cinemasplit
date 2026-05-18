import Link from 'next/link';
import { totalCuratedFilms } from '@/lib/data/films';
import { moodWorlds } from '@/lib/data/taxonomy';

export function Footer() {
  const filmCount    = totalCuratedFilms();
  const emotionCount = moodWorlds.flatMap((w) => w.emotions).length;

  return (
    <footer className="pt-20 pb-14 border-t border-line mt-20">
      <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr] gap-12 md:gap-16 items-start">
        <div>
          <p className="text-[22px] md:text-[26px] leading-[1.4] text-ink max-w-[560px] tracking-[-0.012em] font-medium">
            Films don&apos;t just entertain. They quietly confirm you were seen &mdash; long before
            anyone in your real life knew how to.
          </p>
          <div className="flex flex-wrap gap-x-8 gap-y-2 mt-8 text-[12px] tracking-[0.18em] uppercase text-ink-muted font-medium">
            <span>{emotionCount} emotional states</span>
            <span className="text-ink-faint">&middot;</span>
            <span>{filmCount} curated films</span>
            <span className="text-ink-faint">&middot;</span>
            <span className="text-accent">Growing weekly</span>
          </div>
        </div>
        <div className="md:text-right text-[12px] tracking-[0.18em] uppercase text-ink-muted font-medium leading-[2.6]">
          <Link href="/"          className="block hover:text-ink transition-colors no-underline">Worlds</Link>
          <Link href="/search"    className="block hover:text-ink transition-colors no-underline">Search</Link>
          <Link href="/watchlist" className="block hover:text-ink transition-colors no-underline">Watchlist</Link>
          <span className="block mt-6 text-[12px] tracking-[0.05em] normal-case text-ink-faint font-normal">
            Cinemasplit &middot; 2026
          </span>
        </div>
      </div>
    </footer>
  );
}
