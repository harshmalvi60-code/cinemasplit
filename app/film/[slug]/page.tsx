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

const MOOD_LABELS: Record<string, string> = {
  dawn:   'Warm & Amber',
  dusk:   'Purple & Bruised',
  night:  'Dark & Starlit',
  fire:   'Burning & Intense',
  water:  'Cool & Still',
  violet: 'Deep & Introspective',
  gold:   'Rich & Nostalgic',
  ice:    'Cold & Distant',
  rose:   'Tender & Aching',
  ash:    'Grey & Haunted',
};

const MOOD_VIBES: Record<string, string[]> = {
  dawn:   ['Hopeful', 'Bittersweet', 'Tender'],
  dusk:   ['Melancholic', 'Searching', 'Restless'],
  night:  ['Lonely', 'Introspective', 'Silent'],
  fire:   ['Intense', 'Passionate', 'Turbulent'],
  water:  ['Calm', 'Reflective', 'Drifting'],
  violet: ['Mysterious', 'Layered', 'Psychological'],
  gold:   ['Nostalgic', 'Warm', 'Wistful'],
  ice:    ['Detached', 'Precise', 'Stark'],
  rose:   ['Romantic', 'Fragile', 'Longing'],
  ash:    ['Quiet', 'Resigned', 'Honest'],
};

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
  const awards   = getAwards(film.title, film.year);
  const emotions = getFilmEmotions(film.title);
  const filmKey  = `${film.title}-${film.year}`;

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

  const cast       = tmdb?.cast ?? (film.cast?.map((n) => ({ name: n })) ?? []) as CastMember[];
  const genres     = tmdb?.genres ?? [];
  const providers  = tmdb?.ottProviders ?? [];
  const similar    = tmdb?.similar ?? [];
  const tagline    = tmdb?.tagline;
  const collection = tmdb?.collection;
  const voteAvg    = tmdb?.voteAverage;
  const voteCount  = tmdb?.voteCount;
  const runtime    = tmdb?.runtime ?? film.runtime;
  const cert       = tmdb?.certification;
  const budget     = tmdb?.budget;
  const revenue    = tmdb?.revenue;
  const langs      = tmdb?.spokenLanguages ?? [];
  const companies  = tmdb?.productionCompanies ?? [];
  const ottHref    = tmdb?.ottLink ?? justWatchUrl(film, 'in');
  const trailerEmbed = tmdb?.trailerKey ? `https://www.youtube.com/embed/${tmdb.trailerKey}?autoplay=1&rel=0` : null;

  const moodLabel = MOOD_LABELS[film.mood] ?? film.mood;
  const vibes     = MOOD_VIBES[film.mood] ?? [];

  const reviewSections = [
    { label: 'Direction',          icon: '⬡', body: film.direction },
    { label: 'Cinematography',     icon: '◈', body: film.cinematography },
    { label: 'Music & Sound',      icon: '♬', body: film.musicSound },
    { label: 'Emotional Impact',   icon: '◉', body: film.impact },
    { label: 'Overall Experience', icon: '◌', body: film.overall },
  ];

  return (
    <>
      {/* ── BACKDROP HERO ────────────────────────────────────────── */}
      <div className="relative min-h-[60vh] overflow-hidden">
        {tmdb?.backdropUrl ? (
          <Image src={tmdb.backdropUrl} alt={film.title} fill priority
            className="object-cover object-center transition-opacity duration-1000"
            style={{ opacity: imgLoaded ? 1 : 0 }}
            sizes="100vw"
            onLoad={() => setImgLoaded(true)} />
        ) : (
          <div data-mood={film.mood} className="absolute inset-0" />
        )}

        {/* Multi-layer cinematic overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(6,7,10,0.55) 0%, rgba(6,7,10,0.15) 35%, rgba(6,7,10,0.97) 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(6,7,10,0.75) 0%, transparent 55%)' }} />
        <div className="absolute inset-0 grain opacity-[0.12] mix-blend-overlay" />

        <Nav currentPath="/" />

        {/* Hero content */}
        <div className="relative z-10 mx-auto max-w-[1440px] px-5 md:px-12 pb-20 pt-8">
          <Link href={`/${worldSlug}/${emotionSlug}`}
            className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-ink-muted hover:text-accent transition-colors duration-300 mb-10 no-underline">
            ← {worldName(worldSlug)} / {emotionName(worldSlug, emotionSlug)}
          </Link>

          <div className="flex flex-col md:flex-row gap-10 md:gap-14 items-start">
            {/* Poster */}
            <div className="relative w-[160px] sm:w-[200px] shrink-0 rounded-xl overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.6)]">
              <div className="aspect-[2/3]">
                <div data-mood={film.mood} className="absolute inset-0 transition-opacity duration-700"
                  style={{ opacity: tmdb?.posterUrl ? 0 : 1 }} />
                {tmdb?.posterUrl && (
                  <Image src={tmdb.posterUrl} alt={film.title} fill className="object-cover" sizes="200px" />
                )}
              </div>
              <div className="absolute left-2 top-2 z-10">
                <div className="flex items-baseline gap-0.5 rounded-full border border-accent/50 bg-black/70 px-2 py-0.5">
                  <span className="text-[7px] font-bold uppercase tracking-[0.15em] text-accent">CS</span>
                  <span className="text-sm font-semibold text-ink">{film.rating.toFixed(1)}</span>
                </div>
              </div>
              <div className="absolute bottom-2 right-2 z-10">
                <WatchedToggle filmKey={filmKey} />
              </div>
            </div>

            {/* Meta */}
            <div className="flex-1 min-w-0">
              {collection && <p className="text-[10px] uppercase tracking-[0.3em] text-accent/80 mb-2">{collection}</p>}
              <h1 className="text-[36px] sm:text-[52px] md:text-[64px] font-bold leading-[0.95] tracking-[-0.03em] text-ink mb-3">
                {film.title}
              </h1>
              <p className="text-[15px] text-ink-muted mb-4 tracking-[0.02em]">
                {film.director} &middot; {film.year}
              </p>
              {tagline && (
                <p className="text-[16px] italic text-ink-soft mb-5 max-w-[600px] leading-[1.5]">
                  &ldquo;{tagline}&rdquo;
                </p>
              )}

              {/* Meta pills */}
              <div className="flex flex-wrap items-center gap-2 mb-6">
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
                  <span className="text-amber-400 text-sm">◈</span>
                  <span className="text-[11px] font-semibold text-amber-300">{awards}</span>
                </div>
              )}

              {/* Mood atmosphere chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/6 px-3 py-1 text-[10px] text-ink-muted">
                  <span className="opacity-60">◑</span> {moodLabel}
                </span>
                {vibes.map((v) => (
                  <span key={v} className="rounded-full border border-white/8 bg-white/4 px-3 py-1 text-[10px] text-ink-faint">
                    {v}
                  </span>
                ))}
              </div>

              {/* Emotion journey tags */}
              {emotions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {emotions.map(({ worldSlug: ws, emotionSlug: es }) => (
                    <Link key={`${ws}/${es}`} href={`/${ws}/${es}`}
                      className="rounded-full border border-accent/30 bg-accent/8 px-3 py-1 text-[10px] font-medium text-accent hover:bg-accent/20 transition-all duration-300 no-underline">
                      {worldName(ws)} / {emotionName(ws, es)}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY ─────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-[1440px] px-5 md:px-12 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 lg:gap-16">

          {/* ── LEFT — main content ─────────────────────────────── */}
          <div className="space-y-14">

            {/* Story */}
            <Section label="The Story">
              <p className="text-[16px] sm:text-[17px] leading-[1.85] text-ink-soft">{film.story}</p>
            </Section>

            {/* Why This Film + After Quote */}
            <Section label="Why This Film">
              <p className="text-[16px] sm:text-[17px] leading-[1.85] text-ink-soft mb-8">{film.why}</p>
              {/* Prominent after-watch quote */}
              <blockquote className="relative pl-6 border-l-2 border-accent/50">
                <p className="text-[15px] italic leading-[1.75] text-accent/90">{film.after}</p>
              </blockquote>
            </Section>

            {/* Cinemasplit Review — 5 sections */}
            <Section label="Cinemasplit Review">
              <div className="space-y-0 divide-y divide-white/6">
                {reviewSections.map(({ label, icon, body }) => (
                  <div key={label} className="py-7 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-accent/50 text-sm">{icon}</span>
                      <p className="text-[9px] font-bold uppercase tracking-[0.32em] text-accent/70">{label}</p>
                    </div>
                    <p className="text-[15px] leading-[1.78] text-ink-soft">{body}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* Cast */}
            {cast.length > 0 && (
              <Section label="Cast">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5">
                  {cast.map((c: CastMember) => (
                    <div key={c.name} className="flex flex-col items-center text-center gap-2.5">
                      <div className="relative w-14 h-14 rounded-full overflow-hidden bg-white/8 border border-white/10">
                        {c.profileUrl ? (
                          <Image src={c.profileUrl} alt={c.name} fill className="object-cover" sizes="56px" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-ink-faint text-lg font-semibold">
                            {c.name[0]}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-ink leading-tight">{c.name}</p>
                        {c.character && (
                          <p className="text-[9px] text-ink-muted leading-tight mt-0.5 italic">{c.character}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Similar films / emotional cousins */}
            {similar.length > 0 && (
              <Section label="Emotional Cousins">
                <p className="text-[12px] text-ink-muted mb-5 tracking-[0.05em]">Films that live in a similar emotional register.</p>
                <div className="grid grid-cols-3 gap-4 sm:gap-6">
                  {similar.map((s: SimilarFilm) => (
                    <div key={s.tmdbId} className="flex flex-col gap-2">
                      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-white/5 border border-white/6">
                        {s.posterUrl && <Image src={s.posterUrl} alt={s.title} fill className="object-cover" sizes="140px" />}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      </div>
                      <p className="text-[11px] font-medium text-ink-soft leading-tight line-clamp-2">{s.title}</p>
                      <p className="text-[9px] text-ink-faint">{s.year}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

          </div>

          {/* ── RIGHT — sidebar ─────────────────────────────────── */}
          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">

            {/* Trailer */}
            <div className="rounded-2xl overflow-hidden border border-white/8 bg-[#0b0d12]">
              {trailerOpen && trailerEmbed ? (
                <div className="relative aspect-video">
                  <iframe src={trailerEmbed} title={`${film.title} trailer`}
                    className="absolute inset-0 h-full w-full" allow="autoplay; encrypted-media" allowFullScreen />
                </div>
              ) : (
                <button
                  onClick={() => trailerEmbed ? setTrailer(true) : window.open(youTubeTrailerUrl(film), '_blank')}
                  className="flex w-full items-center justify-center gap-3 p-7 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-soft hover:text-accent transition-colors duration-300 group"
                >
                  <span className="flex items-center justify-center w-9 h-9 rounded-full border border-white/15 group-hover:border-accent/50 transition-colors duration-300 text-lg leading-none">▸</span>
                  Watch Trailer
                </button>
              )}
            </div>

            {/* Where to watch */}
            <div className="rounded-2xl border border-white/8 bg-[#0b0d12] p-5">
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-accent/70 mb-4">Where to Watch</p>
              {providers.length > 0 ? (
                <div className="space-y-2">
                  {providers.map((p: OttProvider) => (
                    <a key={p.name} href={ottHref} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/4 px-4 py-3 hover:border-accent/40 hover:bg-accent/8 transition-all duration-300 no-underline">
                      <Image src={p.logoUrl} alt={p.name} width={24} height={24} className="rounded-md" />
                      <span className="text-[12px] font-medium text-ink-soft">{p.name}</span>
                    </a>
                  ))}
                </div>
              ) : (
                <a href={ottHref} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-accent hover:bg-accent hover:text-black transition-all duration-300 no-underline">
                  Find on Streaming →
                </a>
              )}
            </div>

            {/* Emotional profile card */}
            {emotions.length > 0 && (
              <div className="rounded-2xl border border-white/8 bg-[#0b0d12] p-5">
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-accent/70 mb-4">Emotional Worlds</p>
                <div className="space-y-2">
                  {emotions.map(({ worldSlug: ws, emotionSlug: es }) => {
                    const world = moodWorlds.find((w) => w.slug === ws);
                    return (
                      <Link key={`${ws}/${es}`} href={`/${ws}/${es}`}
                        className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/3 px-4 py-3 hover:border-accent/30 hover:bg-accent/5 transition-all duration-300 no-underline group">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: world?.signature ?? '#13edff' }} />
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold text-ink-soft group-hover:text-accent transition-colors duration-300 truncate">
                            {emotionName(ws, es)}
                          </p>
                          <p className="text-[9px] text-ink-faint">{worldName(ws)}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Film facts */}
            <div className="rounded-2xl border border-white/8 bg-[#0b0d12] p-5 space-y-3.5">
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-accent/70">Film Details</p>
              {budget   && budget   > 0 && <Fact label="Budget"     value={fmt(budget)} />}
              {revenue  && revenue  > 0 && <Fact label="Box Office" value={fmt(revenue)} />}
              {langs.length > 0         && <Fact label="Languages"  value={langs.slice(0, 2).join(', ')} />}
              {companies.length > 0     && <Fact label="Studio"     value={companies[0]} />}
              {tmdb?.originalLanguage   && <Fact label="Language"   value={tmdb.originalLanguage.toUpperCase()} />}
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
      <div className="flex items-center gap-3 mb-7">
        <span className="h-px w-5 bg-accent/50" />
        <p className="text-[9px] font-bold uppercase tracking-[0.32em] text-accent/70">{label}</p>
      </div>
      {children}
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] text-ink-muted">
      {children}
    </span>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline border-b border-white/5 pb-3 last:border-0 last:pb-0">
      <p className="text-[9px] uppercase tracking-[0.2em] text-ink-faint">{label}</p>
      <p className="text-[11px] text-ink-soft font-medium">{value}</p>
    </div>
  );
}
