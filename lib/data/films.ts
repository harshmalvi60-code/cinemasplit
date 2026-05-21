import { Film } from '../types';
import { films } from './films-by-world';

export { films };

export function getFilms(worldSlug: string, emotionSlug: string): Film[] {
  return films[`${worldSlug}/${emotionSlug}`] ?? [];
}

export function totalCuratedFilms(): number {
  const all: Set<string> = new Set();
  for (const list of Object.values(films)) {
    for (const f of list) all.add(f.title);
  }
  return all.size;
}

export function filmsForWorld(worldSlug: string): number {
  return Object.entries(films)
    .filter(([key]) => key.startsWith(`${worldSlug}/`))
    .reduce((sum, [, list]) => sum + list.length, 0);
}

export function justWatchUrl(film: Film, region = 'in'): string {
  const q = encodeURIComponent(`${film.title} ${film.year}`);
  return `https://www.justwatch.com/${region}/search?q=${q}`;
}

export function youTubeTrailerUrl(film: Film): string {
  const q = encodeURIComponent(`${film.title} ${film.year} official trailer`);
  return `https://www.youtube.com/results?search_query=${q}`;
}
