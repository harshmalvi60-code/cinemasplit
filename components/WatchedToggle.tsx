'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'cinemasplit_watched';

function getWatched(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function setWatched(set: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    // storage full or unavailable
  }
}

interface WatchedToggleProps {
  filmKey: string; // title-year, unique per film
}

export default function WatchedToggle({ filmKey }: WatchedToggleProps) {
  const [watched, setWatchedState] = useState(false);

  // Hydrate from localStorage after mount
  useEffect(() => {
    setWatchedState(getWatched().has(filmKey));
  }, [filmKey]);

  function toggle(e: React.MouseEvent) {
    e.stopPropagation();
    const current = getWatched();
    if (current.has(filmKey)) {
      current.delete(filmKey);
    } else {
      current.add(filmKey);
    }
    setWatched(current);
    setWatchedState(current.has(filmKey));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={watched ? 'Mark as unwatched' : 'Mark as watched'}
      title={watched ? 'Watched — click to unmark' : 'Mark as watched'}
      className={`absolute bottom-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300 ${
        watched
          ? 'border-accent bg-accent/20 text-accent'
          : 'border-white/20 bg-black/40 text-ink-faint hover:border-white/40 hover:text-ink-muted'
      } backdrop-blur-sm`}
    >
      {watched ? (
        // Checkmark
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="2,7 5,10 11,3" />
        </svg>
      ) : (
        // Circle outline
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="5.5" cy="5.5" r="4" />
        </svg>
      )}
    </button>
  );
}
