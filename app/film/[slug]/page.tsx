'use client';

import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { getFilmBySlug, getFilmEmotions } from '@/lib/filmSlug';
import { getAwards } from '@/lib/data/awards';
import { justWatchUrl, youTubeTrailerUrl } from '@/lib/data/films';
import type { PosterResult, CastMember, OttProvider, SimilarFilm } from '@/app/api/poster/route';
import { moodWorlds } from '@/lib/data/taxonomy';
import WatchedToggle from '@/components/WatchedToggle';

const posterCache = new Map<string, PosterResult | null>();

function worldName(slug: string) {
  return moodWorlds.find((w) => w.slug === slug)?.name ?? slug;
}

function emotionName(worldSlug: string, emotionSlug: string) {
  const world = moodWorlds.find((w) => w.slug === worldSlug);
  return world?.emotions.find((e) => e.slug === emotionSlug)?.name ?? emotionSlug;
}

function fmt(n: number) {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

export default function FilmDetailPage() {
  const params = useParams<{ slug: string }>();
  const result = getFilmBySlug(params.slug);
  if (!result) notFound();

  const { film, worldSlug, emotionSlug } = result;
  const awards    = getAwards(film.title, film.year);
  const emotions  = getFilmEmotions(film.title);
  const filmKey   = `${film.title}-${film.year}`;

  const [tmdb, setTmdb]         = useState<PosterResult | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [trailerOpen, setTrailer] = useState(false);

  useEffect(() => {
    if (posterCache.has(filmKey)) { setTmdb(posterCache.get(filmKey) ?? null); return; }
    const p = new URLSearchParams({ title: film.title, year: String(film.year) });
    fetch(`/api/poster?${p}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d: PosterResult | null) => { posterCache.set(filmKey, d); setTmdb(d); })
      .catch(() => posterCache.set(filmKey, null));
  }, [filmKey, film.title, film.year]);

  const cast       = tmdb?.cast        ?? (film.cast?.map((n) => ({ name: n })) ?? []) as CastMember[];
  const genres     = tmdb?.genres      ?? [];
  const providers  = tmdb?.ottProviders ?? [];
  const similar    = tmdb?.similar     ?? [];
  const tagline    = tmdb?.tagline;
  const collection = tmdb?.collection;
  const voteAvg    = tmdb?.voteAverage;
  const voteCount  = tmdb?.voteCount;
  const runtime    = tmdb?.runtime     ?? film.runtime;
  const cert       = tmdb?.certification;
  const budget     = tmdb?.budget;
  const revenue    = tmdb?.revenue;
  const langs      = tmdb?.spokenLanguages  ?? [];
  const companies  = tmdb?.productionCompanies ?? [];
  const ottHref     = tmdb?.ottLink ?? justWatchUrl(film, 'in');
  const trailerEmbed = tmdb?.trailerKey ? `https://www.youtube.com/embed/${tmdb.trailerKey}?autoplay=1&rel=0` : null;

  return (
    <>
      {/* ── BACKDROP HERO ──────────────────────────────────────────── */}
      <div className="relative min-h-[55vh] overflow-hidden">
        {/* Backdrop image */}
        {tmdb?.backdropUrl ? (
          <Image src={tmdb.backdropUrl} alt={film.title} fill priority
            className="object-cover object-center transition-opacity duration-1000"
            style={{ opacity: imgLoaded ? 1 : 0 }}
            sizes="100vw"
            onLoad={() => setImgLoaded(true)} />
        ) : (
          <div data-mood={film.mood} className="absolute inset-0" />
        )}
        {/* Gradient overlays */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(6,7,10,0.6) 0%, rgba(6,7,10,0.2) 40%, rgba(6,7,10,0.95) 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(6,7,10,0.7) 0%, transparent 60%)' }} />

        <Nav currentPath="/" />

        {/* Hero content */}
        <div className="relative z-10 mx-auto max-w-[1440px] px-5 md:px-12 pb-16 pt-10">
          {/* Back link */}
          <Link href={`/${worldSlug}/${emotionSlug}`}
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-ink-muted hover:text-accent transition-colors mb-10 no-underline">
            ← {worldName(worldSlug)} / {emotionName(worldSlug, emotionSlug)}
          </Link>

          <div className="flex flex-col md:flex-row gap-10 md:gap-14 items-start">
            {/* Poster */}
            <div className="relative w-[180px] shrink-0 rounded-xl overflow-hidden shadow-2xl">
              <div className="aspect-[2/3]">
                <div data-mood={film.mood} className="absolute inset-0 transition-opacity duration-700"
                  style={{ opacity: tmdb?.posterUrl && imgLoaded ? 0 : 1 }} />
                {tmdb?.posterUrl && (
                  <Image src={tmdb.posterUrl} alt={film.title} fill className="object-cover" sizes="180px" />
                )}
              </div>
              <div className="absolute left-2 top-2 z-10">
                <div className="flex items-baseline gap-1 rounded-full border border-accent/50 bg-black/70 px-2.5 py-1">
                  <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-accent">CS</span>
                  <span className="text-sm font-semibold text-ink">{film.rating.toFixed(1)}</span>
                </div>
              </div>
              <div className="absolute bottom-2 right-2 z-10">
                <WatchedToggle filmKey={filmKey} />
              </div>
            </div>

            {/* Meta */}
            <div className="flex-1">
              {collection && <p className="text-[10px] uppercase tracking-[0.3em] text-accent/80 mb-2">{collection}</p>}
              <h1 className="text-[40px] sm:text-[56px] md:text-[68px] font-bold leading-[0.95] tracking-[-0.03em] text-ink mb-3">
                {film.title}
              </h1>
              <p className="text-[16px] text-ink-muted mb-4">{film.director} &middot; {film.year}</p>
              {tagline && <p className="text-[17px] italic text-ink-soft mb-5">"{tagline}"</p>}

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-2 mb-5">
                {runtime && <Pill>{runtime}m</Pill>}
                {cert    && <Pill>{cert}</Pill>}
                {voteAvg && voteCount && (
                  <Pill>{voteAvg.toFixed(1)} ★ &middot; {voteCount >= 1000 ? `${(voteCount/1000).toFixed(0)}K` : voteCount} votes</Pill>
                )}
                {genres.slice(0, 3).map((g) => <Pill key={g}>{g}</Pill>)}
              </div>

              {/* Awards */}
              {awards && (
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-2 mb-5">
                  <span className="text-amber-400 text-sm">🏆</span>
                  <span className="text-[11px] font-semibold text-amber-300">{awards}</span>
                </div>
              )}

              {/* Emotion tags */}
              <div className="flex flex-wrap gap-2 mt-1">
                {emotions.map(({ worldSlug: ws, emotionSlug: es }) => (
                  <Link key={`${ws}/${es}`} href={`/${ws}/${es}`}
                    className="rounded-full border border-accent/30 bg-accent/8 px-3 py-1 text-[10px] font-medium text-accent hover:bg-accent/20 transition-all no-underline">
                    {emotionName(ws, es)}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY ──────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-[1440px] px-5 md:px-12 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12 lg:gap-16">

          {/* LEFT — main content */}
          <div className="space-y-12">

            {/* Story */}
            <Section label="The Story">
              <p className="text-[17px] leading-[1.8] text-ink-soft">{film.story}</p>
            </Section>

            {/* Why this film */}
            <Section label="Why This Film">
              <p className="text-[17px] leading-[1.8] text-ink-soft">{film.why}</p>
              <p className="mt-6 text-[15px] italic text-ink-muted border-l-2 border-accent/40 pl-5">— {film.after}</p>
            </Section>

            {/* 5-section review */}
            <Section label="Cinemasplit Review">
              <div className="space-y-8">
                {([
                  ['Direction',          film.direction],
                  ['Cinematography',     film.cinematography],
                  ['Music & Sound',      film.musicSound],
                  ['Emotional Impact',   film.impact],
                  ['Overall Experience', film.overall],
                ] as [string, string][]).map(([label, body]) => (
                  <div key={label} className="border-b border-white/6 pb-8 last:border-0 last:pb-0">
                    <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-accent/70 mb-2">{label}</p>
                    <p className="text-[15px] leading-[1.75] text-ink-soft">{body}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* Cast */}
            {cast.length > 0 && (
              <Section label="Cast">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {cast.map((c: CastMember) => (
                    <div key={c.name} className="flex flex-col items-center text-center gap-2">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden bg-white/8 border border-white/10">
                        {c.profileUrl ? (
                          <Image src={c.profileUrl} alt={c.name} fill className="object-cover" sizes="64px" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-ink-faint text-xl">
                            {c.name[0]}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-ink leading-tight">{c.name}</p>
                        {c.character && <p className="text-[10px] text-ink-muted leading-tight mt-0.5">{c.character}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Similar films */}
            {similar.length > 0 && (
              <Section label="You Might Also Feel">
                <div className="grid grid-cols-3 gap-4">
                  {similar.map((s: SimilarFilm) => (
                    <div key={s.tmdbId} className="flex flex-col gap-2">
                      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-white/5">
                        {s.posterUrl && <Image src={s.posterUrl} alt={s.title} fill className="object-cover" sizes="120px" />}
                      </div>
                      <p className="text-[11px] font-medium text-ink-soft leading-tight">{s.title}</p>
                      <p className="text-[10px] text-ink-faint">{s.year}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>

          {/* RIGHT — sidebar */}
          <div className="space-y-8 lg:sticky lg:top-24 lg:self-start">

            {/* Trailer */}
            <div className="rounded-2xl overflow-hidden border border-white/8 bg-[#0b0d12]">
              {trailerOpen && trailerEmbed ? (
                <div className="relative aspect-video">
                  <iframe src={trailerEmbed} title={`${film.title} trailer`}
                    className="absolute inset-0 h-full w-full" allow="autoplay; encrypted-media" allowFullScreen />
                </div>
              ) : (
                <button onClick={() => trailerEmbed ? setTrailer(true) : window.open(youTubeTrailerUrl(film), '_blank')}
                  className="flex w-full items-center justify-center gap-3 p-6 text-[12px] font-semibold uppercase tracking-[0.2em] text-ink-soft hover:text-accent hover:border-accent/40 transition-all">
                  <span className="text-2xl">▸</span> Watch Trailer
                </button>
              )}
            </div>

            {/* OTT providers */}
            <div className="rounded-2xl border border-white/8 bg-[#0b0d12] p-5">
              <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-accent/70 mb-4">Where to Watch</p>
              {providers.length > 0 ? (
                <div className="space-y-2">
                  {providers.map((p: OttProvider) => (
                    <a key={p.name} href={ottHref} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/4 px-4 py-3 hover:border-accent/40 hover:bg-accent/8 transition-all no-underline">
                      <Image src={p.logoUrl} alt={p.name} width={24} height={24} className="rounded-md" />
                      <span className="text-[12px] font-medium text-ink-soft">{p.name}</span>
                    </a>
                  ))}
                </div>
              ) : (
                <a href={ottHref} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-accent hover:bg-accent hover:text-black transition-all no-underline">
                  Find on Streaming →
                </a>
              )}
            </div>

            {/* Film facts */}
            <div className="rounded-2xl border border-white/8 bg-[#0b0d12] p-5 space-y-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-accent/70">Film Details</p>
              {budget  && budget  > 0 && <Fact label="Budget"      value={fmt(budget)}  />}
              {revenue && revenue > 0 && <Fact label="Box Office"  value={fmt(revenue)} />}
              {langs.length > 0        && <Fact label="Languages"  value={langs.slice(0,2).join(', ')} />}
              {companies.length > 0    && <Fact label="Studio"     value={companies[0]} />}
              {tmdb?.originalLanguage  && <Fact label="Original"   value={tmdb.originalLanguage.toUpperCase()} />}
              {tmdb?.country           && <Fact label="Country"    value={tmdb.country} />}
            </div>
          </div>
        </div>
      </main>

      <div className="mx-auto max-w-[1440px] px-5 md:px-12">
        <Footer />
      </div>
    </>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="h-px w-5 bg-accent/60" />
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent/70">{label}</p>
      </div>
      {children}
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/12 bg-white/6 px-3 py-1 text-[11px] text-ink-muted">
      {children}
    </span>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline">
      <p className="text-[10px] uppercase tracking-[0.18em] text-ink-faint">{label}</p>
      <p className="text-[12px] text-ink-soft font-medium">{value}</p>
    </div>
  );
}
