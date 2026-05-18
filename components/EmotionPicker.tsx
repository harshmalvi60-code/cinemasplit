import Link from 'next/link';
import { MoodWorld } from '@/lib/types';

export function EmotionPicker({
  world,
  activeEmotion,
}: {
  world: MoodWorld;
  activeEmotion: string;
}) {
  return (
    <section className="border-b border-line">
      <div className="flex items-center gap-3 text-[11px] tracking-[0.32em] uppercase text-ink-muted font-semibold pt-10 pb-4">
        <span className="inline-block w-5 h-px bg-ink-faint" />
        Choose an emotion
      </div>
      <div className="flex flex-wrap gap-2 md:gap-3 pb-8">
        {world.emotions.map((e) => {
          const isActive = e.slug === activeEmotion;
          return (
            <Link
              key={e.slug}
              href={`/${world.slug}/${e.slug}`}
              className={`text-[14px] md:text-[15px] font-semibold tracking-[-0.005em] px-5 py-2.5 rounded-full transition-all duration-300 no-underline ${
                isActive
                  ? 'bg-accent text-bg shadow-[0_0_24px_rgba(19,237,255,0.35)]'
                  : 'bg-white/[0.06] text-ink-soft hover:text-ink hover:bg-white/[0.10] border border-white/[0.08]'
              }`}
            >
              {e.name}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
