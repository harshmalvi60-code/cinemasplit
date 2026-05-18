'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { Wordmark } from './Wordmark';
import { useAuth } from './AuthProvider';

export function Nav({ currentPath = '/' }: { currentPath?: string }) {
  const { user, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const links = [
    { href: '/',           label: 'Worlds'    },
    { href: '/search',     label: 'Search'    },
    { href: '/watchlist',  label: 'Watchlist' },
  ];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function openAuthModal() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cs_auth_dismissed');
      window.dispatchEvent(new CustomEvent('cs:show-auth'));
    }
  }

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

        <div className="flex items-center gap-3">
          <Link href="/search"
            className="sm:hidden flex items-center justify-center w-9 h-9 rounded-full border border-white/15 text-ink-muted hover:text-ink hover:border-accent/40 transition-all no-underline text-base">
            ⌕
          </Link>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 pl-2.5 pr-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-accent transition-all hover:bg-accent/20"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-[10px] font-bold text-accent">
                  {(user.email ?? 'U')[0].toUpperCase()}
                </span>
                <span className="hidden sm:block max-w-[120px] truncate">
                  {user.email?.split('@')[0]}
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-xl border border-white/10 bg-[#0d0f14] shadow-2xl">
                  <div className="border-b border-white/8 px-4 py-3">
                    <p className="text-[11px] text-ink-muted truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/admin"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-[12px] text-ink-muted transition-colors hover:bg-white/5 hover:text-ink no-underline"
                  >
                    Admin Dashboard →
                  </Link>
                  <button
                    onClick={() => { signOut(); setDropdownOpen(false); }}
                    className="flex w-full items-center gap-2 px-4 py-3 text-[12px] text-ink-muted transition-colors hover:bg-white/5 hover:text-ink text-left"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="hidden sm:flex items-center rounded-full border border-white/15 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-ink-muted transition-all hover:border-accent/40 hover:text-accent"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
