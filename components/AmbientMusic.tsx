'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Cinemasplit ambient music player.
 *
 * Drop a legally licensed track at /public/ambient.mp3 to enable.
 * The toggle appears in the bottom-right of every page.
 * Plays only after the first user interaction (browser autoplay policy).
 *
 * Sourcing tips for cinematic-ambient that lands like Hans Zimmer's "Time"
 * without infringement:
 *   - Pixabay Music (CC0)  → search "cinematic ambient piano"
 *   - Mubert              → AI-generated, commercial license from ~$15/mo
 *   - Pond5 / Artlist     → licensed cinematic ambient, $20-50/track
 *   - Fiverr / Upwork     → $100-300 for a custom 5-min loop you own outright
 *
 * NEVER embed copyrighted scores (Inception, Interstellar, etc.).
 * The site will be served a DMCA takedown within days.
 */
export default function AmbientMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [muted, setMuted] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Check whether /ambient.mp3 actually exists before showing the toggle
  useEffect(() => {
    let mounted = true;
    fetch('/ambient.mp3', { method: 'HEAD' })
      .then((res) => {
        if (mounted && res.ok) setEnabled(true);
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  // Wait for first user interaction before starting playback
  useEffect(() => {
    if (!enabled) return;
    const onFirstInteract = () => {
      setHasInteracted(true);
      window.removeEventListener('click', onFirstInteract);
      window.removeEventListener('keydown', onFirstInteract);
      window.removeEventListener('touchstart', onFirstInteract);
    };
    window.addEventListener('click', onFirstInteract);
    window.addEventListener('keydown', onFirstInteract);
    window.addEventListener('touchstart', onFirstInteract);
    return () => {
      window.removeEventListener('click', onFirstInteract);
      window.removeEventListener('keydown', onFirstInteract);
      window.removeEventListener('touchstart', onFirstInteract);
    };
  }, [enabled]);

  // Start playback when interaction has happened + audio is enabled + not muted
  useEffect(() => {
    if (!enabled || !hasInteracted || !audioRef.current) return;
    audioRef.current.volume = 0.25; // subtle by default
    if (!muted) {
      audioRef.current.play().catch(() => {
        // ignore — browser blocked it
      });
    } else {
      audioRef.current.pause();
    }
  }, [enabled, hasInteracted, muted]);

  if (!enabled) return null;

  return (
    <>
      <audio ref={audioRef} src="/ambient.mp3" loop preload="auto" />
      <button
        type="button"
        onClick={() => setMuted((m) => !m)}
        aria-label={muted ? 'Unmute ambient music' : 'Mute ambient music'}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-accent/40 bg-black/70 text-accent backdrop-blur-md transition-all duration-300 hover:border-accent hover:bg-accent/15"
      >
        {muted ? <IconMuted /> : <IconPlaying />}
      </button>
    </>
  );
}

function IconMuted() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5L6 9H2v6h4l5 4V5z" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

function IconPlaying() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5L6 9H2v6h4l5 4V5z" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}
