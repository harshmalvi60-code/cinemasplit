import Link from 'next/link';

export function Wordmark() {
  return (
    <Link
      href="/"
      className="text-[20px] md:text-[22px] font-bold tracking-[-0.025em] text-ink leading-none flex items-center gap-2 no-underline"
    >
      Cinemasplit
      <span
        className="inline-block w-[7px] h-[7px] rounded-full mb-px bg-accent animate-pulse-soft"
        style={{ boxShadow: '0 0 14px var(--accent)' }}
      />
    </Link>
  );
}
