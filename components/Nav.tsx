import Link from 'next/link';
import { Wordmark } from './Wordmark';

export function Nav({ currentPath = '/' }: { currentPath?: string }) {
  const links = [
    { href: '/',           label: 'Worlds'    },
    { href: '/search',     label: 'Search'    },
    { href: '/watchlist',  label: 'Watchlist' },
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-nav bg-bg/70 border-b border-line">
      <div className="max-w-[1440px] mx-auto px-5 md:px-12 flex justify-between items-center h-[68px]">
        <Wordmark />
        <div className="hidden sm:flex gap-7 md:gap-10">
          {links.map((l) => {
            const active =
              l.href === '/'
                ? currentPath === '/'
                : currentPath.startsWith(l.href);
            return (
              <Link
                key={l.label}
                href={l.href}
                className={`text-[12px] font-medium tracking-[0.18em] uppercase no-underline transition-colors duration-300 relative ${
                  active ? 'text-ink' : 'text-ink-muted hover:text-ink'
                }`}
              >
                {l.label}
                {active && (
                  <span aria-hidden
                    className="absolute -bottom-2 left-0 right-0 h-[2px] bg-accent rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
        <Link href="/search"
          className="sm:hidden flex items-center justify-center w-9 h-9 rounded-full border border-white/15 text-ink-muted hover:text-ink hover:border-accent/40 transition-all no-underline text-base">
          ⌕
        </Link>
      </div>
    </nav>
  );
}
