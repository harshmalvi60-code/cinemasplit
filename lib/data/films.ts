import { Film } from '../types';
import { films } from './films-by-world';

export { films };

export function getFilms(worldSlug: string, emotionSlug: string): Film[] {
  return films[`${worldSlug}/${emotionSlug}`] ?? [];
}

export function totalCuratedFilms(): number {
  return Object.values(films).reduce((sum, list) => sum + list.length, 0);
}

export function justWatchUrl(film: Film, region = 'in'): string {
  const q = encodeURIComponent(`${film.title} ${film.year}`);
  return `https://www.justwatch.com/${region}/search?q=${q}`;
}

export function youTubeTrailerUrl(film: Film): string {
  const q = encodeURIComponent(`${film.title} ${film.year} official trailer`);
  return `https://www.youtube.com/results?search_query=${q}`;
}
