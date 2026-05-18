/**
 * Cinemasplit — TMDB API client
 *
 * Runs at Next.js build time (SSG). On Vercel this fetches real data.
 * In local dev without network access it returns null gracefully.
 *
 * API key: kept in source intentionally — TMDB is a public movie database
 * with a free tier designed for this use case. No payment data involved.
 */

const TMDB_KEY = '4c5a6908e94d6a7fde3b001b69011428';
const API   = 'https://api.themoviedb.org/3';
const IMG   = 'https://image.tmdb.org/t/p/w500';
const IMG_HD = 'https://image.tmdb.org/t/p/w780';

export interface TmdbFilmData {
  tmdbId: number;
  posterUrl: string;       // w500 for cards
  posterUrlHd: string;     // w780 for detail pages
  backdropUrl?: string;
  cast: string[];          // top 5 cast members
  runtime?: number;        // minutes
}

async function tmdbFetch(path: string): Promise<unknown> {
  const url = `${API}${path}${path.includes('?') ? '&' : '?'}api_key=${TMDB_KEY}`;
  const res = await fetch(url, {
    next: { revalidate: 604800 }, // cache for 7 days — poster URLs don't change
  });
  if (!res.ok) return null;
  return res.json();
}

/**
 * Search for a film on TMDB by title and year.
 * Returns enriched data or null if not found / network unavailable.
 */
export async function fetchTmdbData(
  title: string,
  year: number
): Promise<TmdbFilmData | null> {
  try {
    const query = encodeURIComponent(title);
    const searchData = await tmdbFetch(`/search/movie?query=${query}&year=${year}`) as {
      results?: { id: number; poster_path?: string; backdrop_path?: string }[];
    } | null;

    const movie = searchData?.results?.[0];
    if (!movie || !movie.poster_path) return null;

    const tmdbId = movie.id;
    const posterUrl   = `${IMG}${movie.poster_path}`;
    const posterUrlHd = `${IMG_HD}${movie.poster_path}`;
    const backdropUrl = movie.backdrop_path
      ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
      : undefined;

    // Fetch credits for cast
    const creditsData = await tmdbFetch(`/movie/${tmdbId}/credits`) as {
      cast?: { name: string; order: number }[];
    } | null;

    const cast = (creditsData?.cast ?? [])
      .sort((a, b) => a.order - b.order)
      .slice(0, 5)
      .map((c) => c.name);

    // Fetch runtime
    const detailData = await tmdbFetch(`/movie/${tmdbId}`) as {
      runtime?: number;
    } | null;

    const runtime = detailData?.runtime ?? undefined;

    return { tmdbId, posterUrl, posterUrlHd, backdropUrl, cast, runtime };
  } catch {
    // Network unavailable in local dev — fall back to mood gradient
    return null;
  }
}

/**
 * Batch-fetch TMDB data for a list of films.
 * Returns a map of "title-year" → TmdbFilmData | null
 */
export async function fetchTmdbBatch(
  films: { title: string; year: number }[]
): Promise<Record<string, TmdbFilmData | null>> {
  const results = await Promise.all(
    films.map(async (f) => {
      const data = await fetchTmdbData(f.title, f.year);
      return [`${f.title}-${f.year}`, data] as [string, TmdbFilmData | null];
    })
  );
  return Object.fromEntries(results);
}
