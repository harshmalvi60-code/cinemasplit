import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { EmotionPicker } from '@/components/EmotionPicker';
import FilmCard from '@/components/FilmCard';
import WorldHeroBanner from '@/components/WorldHeroBanner';
import FilmSlider from '@/components/FilmSlider';
import { getEmotion, moodWorlds } from '@/lib/data/taxonomy';
import { getFilms } from '@/lib/data/films';
import type { Emotion, MoodWorld } from '@/lib/types';

interface PageProps {
  params: { world: string; emotion: string };
}

// Statically generate every world/emotion page at build time
export function generateStaticParams() {
  return moodWorlds.flatMap((w: MoodWorld) =>
    w.emotions.map((e: Emotion) => ({ world: w.slug, emotion: e.slug }))
  );
}

export function generateMetadata({ params }: PageProps): Metadata {
  const data = getEmotion(params.world, params.emotion);
  if (!data) return { title: 'Not found — Cinemasplit' };
  const { world, emotion } = data;
  return {
    title: `${emotion.name} — ${world.name} — Cinemasplit`,
    description: `${emotion.tagline} Curated films for ${emotion.name.toLowerCase()} from Cinemasplit.`,
  };
}

export default function EmotionPage({ params }: PageProps) {
  const data = getEmotion(params.world, params.emotion);
  if (!data) notFound();

  const { world, emotion } = data;
  const films = getFilms(world.slug, emotion.slug);

  // What comes next
  const idx = world.emotions.findIndex((e: Emotion) => e.slug === emotion.slug);
  const nextInWorld =
    world.emotions.length > 1
      ? world.emotions[(idx + 1) % world.emotions.length]
      : null;

  const worldIdx = moodWorlds.findIndex((w) => w.slug === world.slug);
  const nextWorld = moodWorlds[(worldIdx + 1) % moodWorlds.length];

  return (
    <>
      {/* Page-level world atmosphere */}
      <div aria-hidden className="fixed inset-0 pointer-events-none z-0"
        style={{ background: world.pageAtmosphere }} />

      {/* Cinematic backdrop banner */}
      <div className="relative overflow-hidden">
        <WorldHeroBanner worldSlug={world.slug} />

        <Nav currentPath={`/${world.slug}/${emotion.slug}`} />

        <div className="relative z-10 max-w-[1440px] mx-auto px-5 md:px-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-3 text-[11px] tracking-[0.2em] uppercase text-ink-muted pt-10 pb-5 font-semibold">
            <Link href="/" className="hover:text-ink transition-colors duration-300 no-underline flex items-center gap-2">
              &larr; All worlds
            </Link>
            <span className="text-ink-faint">/</span>
            <span className="text-ink">World {world.number}</span>
          </div>

          {/* WORLD HERO */}
          <section className="pb-20 md:pb-28">
            <div className="mb-8 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.42em] text-accent">
              <span className="inline-block h-px w-8 bg-accent" />
              World {world.number} &middot; {world.emotions.length}{' '}
              {world.emotions.length === 1 ? 'state' : 'states'}
            </div>
            <h1 className="text-[64px] sm:text-[100px] md:text-[140px] lg:text-[180px] font-bold leading-[0.92] tracking-[-0.035em] text-ink mb-6">
              {world.name}
            </h1>
            <p className="text-[18px] md:text-[24px] lg:text-[28px] leading-[1.4] text-ink-soft max-w-[760px] font-normal tracking-[-0.005em]">
              {world.description}
            </p>
          </section>
        </div>
      </div>

      <main className="max-w-[1440px] mx-auto px-5 md:px-12 relative z-[1]">

        {/* EMOTION PICKER */}
        <EmotionPicker world={world} activeEmotion={emotion.slug} />

        {/* EDITORIAL INTRO */}
        {emotion.editorial && (
          <section className="border-b border-white/8 py-12 md:py-16">
            <div className="max-w-[720px]">
              <div className="mb-5 flex items-center gap-3">
                <span className="h-px w-6 bg-accent/60" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-accent/70">
                  On {emotion.name}
                </span>
              </div>
              <p className="text-[16px] font-normal leading-[1.8] text-ink-soft md:text-[18px]">
                {emotion.editorial}
              </p>
            </div>
          </section>
        )}
        <section className="py-16 md:py-20">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 md:mb-14">
            <div>
              <div className="flex items-center gap-3 mb-4 text-[11px] tracking-[0.32em] uppercase text-ink-muted font-semibold">
                <span className="inline-block w-5 h-px bg-ink-faint" />
                {emotion.name}
              </div>
              <h2 className="text-[32px] md:text-[44px] lg:text-[56px] font-bold leading-[1.05] tracking-[-0.025em] text-ink max-w-[820px]">
                {emotion.tagline}
              </h2>
            </div>
            <div className="text-[12px] tracking-[0.18em] uppercase text-ink-muted font-semibold md:text-right shrink-0">
              <span className="block text-[44px] md:text-[56px] text-ink font-bold tracking-[-0.03em] normal-case leading-none">
                {String(films.length).padStart(2, '0')}
              </span>
              <span className="mt-2 block">Curated films</span>
            </div>
          </div>

          {films.length > 0 && (
            <div className="py-10 border-b border-white/6 mb-10">
              <FilmSlider films={films} label={`${films.length} films — quick browse`} />
            </div>
          )}

          {films.length === 0 ? (
            <div className="py-24 text-center border border-line rounded-xl bg-bg-card/40">
              <p className="text-[24px] md:text-[28px] text-ink-soft max-w-[520px] mx-auto leading-[1.4] font-medium">
                Curation in progress. This emotion is being written with care.
              </p>
              <p className="mt-6 text-[12px] tracking-[0.25em] uppercase text-ink-faint font-semibold">
                Pick another emotion above &mdash; or check back soon.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 sm:gap-x-5 sm:gap-y-7">
              {films.map((film) => (
                <FilmCard
                  key={`${film.title}-${film.year}`}
                  film={film}
                />
              ))}
            </div>
          )}
        </section>

        {/* NEXT CTAs */}
        <section className="py-16 md:py-20 border-t border-line grid grid-cols-1 md:grid-cols-2 gap-6">
          {nextInWorld && (
            <Link
              href={`/${world.slug}/${nextInWorld.slug}`}
              className="group block p-8 md:p-10 rounded-xl border border-line hover:border-accent/40 bg-bg-card/40 hover:bg-bg-card/70 transition-all duration-500 no-underline relative overflow-hidden"
            >
              <span
                aria-hidden
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background:
                    'radial-gradient(circle 320px at 20% 50%, rgba(19,237,255,0.10), transparent 70%)',
                }}
              />
              <div className="relative z-[1]">
                <div className="text-[11px] tracking-[0.28em] uppercase text-accent font-semibold mb-3">
                  Next in {world.name}
                </div>
                <div className="text-[28px] md:text-[32px] font-bold text-ink tracking-[-0.02em] inline-flex items-center gap-3 group-hover:gap-5 transition-all duration-300">
                  {nextInWorld.name} <span className="text-accent" aria-hidden>&rarr;</span>
                </div>
                <p className="mt-2 text-[14px] text-ink-soft leading-[1.5]">
                  {nextInWorld.tagline}
                </p>
              </div>
            </Link>
          )}

          <Link
            href={`/${nextWorld.slug}/${nextWorld.emotions[0].slug}`}
            className="group block p-8 md:p-10 rounded-xl border border-line hover:border-accent/40 bg-bg-card/40 hover:bg-bg-card/70 transition-all duration-500 no-underline relative overflow-hidden"
          >
            <span
              aria-hidden
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background:
                  'radial-gradient(circle 320px at 80% 50%, rgba(19,237,255,0.10), transparent 70%)',
              }}
            />
            <div className="relative z-[1]">
              <div className="text-[11px] tracking-[0.28em] uppercase text-ink-muted font-semibold mb-3">
                Next world &middot; {nextWorld.number}
              </div>
              <div className="text-[28px] md:text-[32px] font-bold text-ink tracking-[-0.02em] inline-flex items-center gap-3 group-hover:gap-5 transition-all duration-300">
                {nextWorld.name} <span className="text-accent" aria-hidden>&rarr;</span>
              </div>
              <p className="mt-2 text-[14px] text-ink-soft leading-[1.5]">
                {nextWorld.tagline}
              </p>
            </div>
          </Link>
        </section>

        <Footer />
      </main>
    </>
  );
}
