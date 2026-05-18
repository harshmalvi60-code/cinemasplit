import cache from './tmdb-cache.json';

export interface TmdbEntry {
  tmdbId: number | null;
  posterUrl: string | null;
  cast: string[];
  runtime: number | null;
  overview: string | null;
}

type CacheMap = Record<string, TmdbEntry>;
const tmdbCache = cache as CacheMap;

/**
 * Look up TMDB data for a film by its cache key (title-year).
 * Returns null if the sync script hasn't been run yet.
 */
export function getTmdbData(title: string, year: number): TmdbEntry | null {
  const key = `${title}-${year}`;
  return tmdbCache[key] ?? null;
}

export function hasTmdbData(): boolean {
  return Object.keys(tmdbCache).length > 0;
}

export { tmdbCache };
