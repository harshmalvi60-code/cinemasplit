import Link from 'next/link';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { MoodWorldCard } from '@/components/MoodWorldCard';
import EmotionQuiz from '@/components/EmotionQuiz';
import HomepageBanner from '@/components/HomepageBanner';
import TonightsPick from '@/components/TonightsPick';
import { moodWorlds } from '@/lib/data/taxonomy';
import { totalCuratedFilms } from '@/lib/data/films';

export default function HomePage() {
  const filmCount    = totalCuratedFilms();
  const emotionCount = moodWorlds.flatMap((w) => w.emotions).length;

  return (
    <>
      <div className="glow cyan" />
      <div className="glow deep" />

      {/* ── CINEMATIC BANNER ─────────────────────────────────────── */}
      <HomepageBanner />

      <Nav currentPath="/" />

      <main className="relative z-[1] mx-auto max-w-[1440px] px-5 md:px-12">

        {/* ── HERO ──────────────────────────────────────────────── */}
        <section className="pb-14 pt-14 md:pb-20 md:pt-20">
          <div className="mb-8 flex items-center gap-3">
            <span className="inline-block h-px w-8 bg-accent" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.42em] text-accent">
              An emotional atlas of cinema
            </span>
          </div>
          <h1 className="max-w-[1240px] text-[52px] font-bold leading-[0.92] tracking-[-0.035em] text-ink sm:text-[76px] md:text-[108px] lg:text-[136px]">
            Cinema,{' '}
            <span className="text-accent">split</span>
            <br />by the way
            <br />you feel.
          </h1>
          <p className="mt-8 max-w-[540px] text-[16px] font-normal leading-[1.65] text-ink-soft md:text-[18px]">
            Tell us what is happening inside you. We will find the exact film &mdash; from{' '}
            <span className="font-semibold text-ink">{filmCount} curated films</span> across{' '}
            <span className="font-semibold text-ink">{emotionCount} emotional states</span>.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/search" className="rounded-full border border-white/20 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-soft hover:border-accent/40 hover:text-accent transition-all no-underline">
              Search Films →
            </Link>
            <Link href="/watchlist" className="rounded-full border border-white/20 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-soft hover:border-accent/40 hover:text-accent transition-all no-underline">
              My Watchlist →
            </Link>
          </div>
        </section>

        {/* ── TONIGHT'S PICK ───────────────────────────────────── */}
        <TonightsPick />

        {/* ── EMOTION QUIZ ─────────────────────────────────────── */}
        <section className="mb-20 md:mb-28">
          <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-[#0b0d12]/80 px-6 py-10 backdrop-blur-sm md:px-12 md:py-14">
            <div aria-hidden
              className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[600px] -translate-x-1/2 rounded-full blur-3xl"
              style={{ background: 'radial-gradient(ellipse, rgba(19,237,255,0.07) 0%, transparent 70%)' }} />
            <EmotionQuiz />
          </div>
          <div className="mt-6 flex items-center gap-4">
            <span className="h-px flex-1 bg-white/6" />
            <Link href="#worlds" className="shrink-0 text-[11px] uppercase tracking-[0.28em] text-ink-faint transition-colors hover:text-ink-muted no-underline">
              or browse all worlds &darr;
            </Link>
            <span className="h-px flex-1 bg-white/6" />
          </div>
        </section>

        {/* ── STATS BAR ────────────────────────────────────────── */}
        <section className="mb-20 grid grid-cols-2 overflow-hidden rounded-2xl border border-white/8 gap-px md:grid-cols-4">
          {[
            { value: String(filmCount),    label: 'Curated Films' },
            { value: String(emotionCount), label: 'Emotional States' },
            { value: String(moodWorlds.length), label: 'Mood Worlds' },
            { value: '100%',               label: 'Spoiler-Free' },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col gap-1.5 bg-[#0b0d12]/60 px-6 py-7 backdrop-blur-sm">
              <span className="text-3xl font-bold tracking-tight text-ink">{value}</span>
              <span className="text-[11px] uppercase tracking-[0.2em] text-ink-muted">{label}</span>
            </div>
          ))}
        </section>

        {/* ── WORLDS GRID ──────────────────────────────────────── */}
        <section id="worlds" className="scroll-mt-24 pb-28 md:pb-36">
          <div className="mb-10 md:mb-14">
            <div className="mb-4 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-ink-muted">
              <span className="inline-block h-px w-5 bg-ink-faint" />
              All emotional worlds
            </div>
            <h2 className="max-w-[640px] text-[32px] font-bold leading-[1.05] tracking-[-0.025em] text-ink md:text-[48px] lg:text-[56px]">
              Pick the world that matches your weight.
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6">
            {moodWorlds.map((world) => (
              <MoodWorldCard key={world.slug} world={world} />
            ))}
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
