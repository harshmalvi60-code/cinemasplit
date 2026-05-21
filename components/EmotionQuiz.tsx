'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

// ─── Data ─────────────────────────────────────────────────────────────────────

interface WorldOption {
  label: string;
  sub: string;
  worldSlug: string;
  /** If omitted, a step-2 refinement follows */
  emotionSlug?: string;
  step2?: {
    question: string;
    options: { label: string; sub: string; emotionSlug: string }[];
  };
}

const worldOptions: WorldOption[] = [
  {
    label: 'My heart is broken',
    sub: 'from a love lost or ending',
    worldSlug: 'healing',
    step2: {
      question: 'How are you carrying it?',
      options: [
        { label: 'Fresh and sharp', sub: 'I still feel everything', emotionSlug: 'heartbreak-recovery' },
        { label: 'Quiet and numb', sub: "I've stopped feeling much at all", emotionSlug: 'emotional-numbness' },
      ],
    },
  },
  {
    label: 'I feel completely alone',
    sub: 'even when people are around',
    worldSlug: 'loneliness',
    step2: {
      question: 'What kind of alone?',
      options: [
        { label: 'The silence of being isolated', sub: "there's no one close enough", emotionSlug: 'quiet-isolation' },
        { label: 'The ache of being unseen', sub: "I'm there — but no one notices", emotionSlug: 'feeling-invisible' },
      ],
    },
  },
  {
    label: "I don't know who I am",
    sub: 'or who I was supposed to become',
    worldSlug: 'identity-crisis',
    emotionSlug: 'not-knowing-yourself',
  },
  {
    label: 'People feel dangerous',
    sub: 'connection is hard and I pull back',
    worldSlug: 'social-anxiety',
    emotionSlug: 'fear-of-connection',
  },
  {
    label: "I'm not enough",
    sub: 'nothing I do ever quite measures up',
    worldSlug: 'self-worth',
    emotionSlug: 'not-enough',
  },
  {
    label: "I'm lost in my life",
    sub: 'no direction, no clear next step',
    worldSlug: 'purpose-and-direction',
    emotionSlug: 'feeling-lost-in-life',
  },
  {
    label: 'Nothing feels meaningful',
    sub: 'questioning why any of this matters',
    worldSlug: 'existential-confusion',
    emotionSlug: 'meaning-of-life',
  },
  {
    label: "I'm carrying grief",
    sub: 'learning to live after a real loss',
    worldSlug: 'grief',
    emotionSlug: 'learning-to-live-again',
  },
  {
    label: 'I need to slow down',
    sub: 'the world is moving too fast',
    worldSlug: 'inner-peace',
    emotionSlug: 'slowing-down',
  },
  {
    label: 'Something in me is shifting',
    sub: 'a quiet awakening I cannot name',
    worldSlug: 'spiritual-awakening',
    emotionSlug: 'beyond-ego',
  },
  {
    label: 'I need to believe in something',
    sub: 'looking for light after a long dark',
    worldSlug: 'hope',
    emotionSlug: 'light-after-darkness',
  },
  {
    label: "I'm ready to change",
    sub: "tired of the version of me I\u2019ve been",
    worldSlug: 'emotional-growth',
    emotionSlug: 'becoming',
  },
  {
    label: 'Something has taken over me',
    sub: 'a love, a work, a need I cannot stop',
    worldSlug: 'obsession',
    step2: {
      question: 'What kind of obsession?',
      options: [
        { label: 'A person I cannot stop thinking about', sub: 'love that knows better but keeps going', emotionSlug: 'destructive-love' },
        { label: 'A work I cannot stop making', sub: 'art, ambition, or a project that consumed me', emotionSlug: 'creative-obsession' },
      ],
    },
  },
  {
    label: "I'm completely burned out",
    sub: 'empty despite doing everything right',
    worldSlug: 'burnout',
    step2: {
      question: 'Where is the emptiness?',
      options: [
        { label: 'I achieved everything and feel nothing', sub: "the summit I reached didn't feel like anything", emotionSlug: 'empty-achievement' },
        { label: "I've given everything to others", sub: "there's nothing left inside for me", emotionSlug: 'compassion-fatigue' },
      ],
    },
  },
];

// ─── Component ─────────────────────────────────────────────────────────────────

type Step = 'q1' | 'q2' | 'routing';

export default function EmotionQuiz() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('q1');
  const [selected, setSelected] = useState<WorldOption | null>(null);
  const [routingText, setRoutingText] = useState('');

  function handleWorldSelect(option: WorldOption) {
    setSelected(option);
    if (option.emotionSlug) {
      // Single emotion world — route immediately
      route(option.worldSlug, option.emotionSlug, option.label);
    } else {
      // Needs a refinement step
      setStep('q2');
    }
  }

  function handleEmotionSelect(emotionSlug: string, label: string) {
    if (!selected) return;
    route(selected.worldSlug, emotionSlug, label);
  }

  function route(worldSlug: string, emotionSlug: string, label: string) {
    setRoutingText(label);
    setStep('routing');
    setTimeout(() => {
      router.push(`/${worldSlug}/${emotionSlug}`);
    }, 900);
  }

  // ── Routing transition ──────────────────────────────────────────────────────
  if (step === 'routing') {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-4">
        <div className="h-px w-12 animate-pulse bg-accent" />
        <p className="text-center text-sm uppercase tracking-[0.3em] text-accent">
          Finding your films
        </p>
        <p className="max-w-xs text-center text-xs text-ink-muted">{routingText}</p>
      </div>
    );
  }

  // ── Step 2 — emotion refinement ─────────────────────────────────────────────
  if (step === 'q2' && selected?.step2) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.3em] text-accent/70">Step 2 of 2</p>
          <h2 className="text-2xl font-light text-ink sm:text-3xl">
            {selected.step2.question}
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {selected.step2.options.map((opt) => (
            <button
              key={opt.emotionSlug}
              type="button"
              onClick={() => handleEmotionSelect(opt.emotionSlug, opt.label)}
              className="group flex flex-col gap-1.5 rounded-2xl border border-white/10 bg-white/4 p-6 text-left transition-all duration-300 hover:border-accent/50 hover:bg-accent/8"
            >
              <span className="text-base font-medium text-ink transition-colors group-hover:text-accent">
                {opt.label}
              </span>
              <span className="text-sm text-ink-muted">{opt.sub}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setStep('q1')}
          className="text-xs uppercase tracking-[0.2em] text-ink-faint transition-colors hover:text-ink-muted"
        >
          ← Back
        </button>
      </div>
    );
  }

  // ── Step 1 — world selection ────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-[0.3em] text-accent/70">Where are you tonight?</p>
        <h2 className="text-2xl font-light leading-snug text-ink sm:text-3xl">
          What&apos;s happening inside you?
        </h2>
      </div>

      <div className="flex flex-wrap gap-3">
        {worldOptions.map((opt) => (
          <button
            key={opt.worldSlug}
            type="button"
            onClick={() => handleWorldSelect(opt)}
            className="group flex flex-col gap-0.5 rounded-xl border border-white/10 bg-white/4 px-5 py-4 text-left transition-all duration-300 hover:border-accent/50 hover:bg-accent/8"
          >
            <span className="text-sm font-medium text-ink transition-colors group-hover:text-accent">
              {opt.label}
            </span>
            <span className="text-xs text-ink-muted">{opt.sub}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
