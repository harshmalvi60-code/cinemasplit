import { NextRequest, NextResponse } from 'next/server';

const KEY  = '4c5a6908e94d6a7fde3b001b69011428';
const BASE = 'https://api.themoviedb.org/3';
const IMG  = 'https://image.tmdb.org/t/p/w500';
const LOGO = 'https://image.tmdb.org/t/p/w92';
const SIM  = 'https://image.tmdb.org/t/p/w154';

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=604800, stale-while-revalidate=86400',
};

async function tmdb(path: string) {
  const r = await fetch(`${BASE}${path}${path.includes('?') ? '&' : '?'}api_key=${KEY}`, {
    next: { revalidate: 604800 },
  });
  return r.ok ? r.json() : null;
}

export interface CastMember {
  name: string;
  character?: string;
  profileUrl?: string;
}

export interface OttProvider {
  name: string;
  logoUrl: string;
}

export interface SimilarFilm {
  title: string;
  year: number;
  posterUrl?: string;
  tmdbId: number;
}

export interface PosterResult {
  tmdbId: number;
  posterUrl: string;
  backdropUrl?: string;
  // Cast & crew
  cast: CastMember[];
  // Playback
  trailerKey?: string;       // YouTube video ID
  ottLink?: string;          // JustWatch deep-link for this specific film (India)
  ottProviders: OttProvider[];
  // Film meta
  runtime?: number;
  certification?: string;    // U/A · PG-13 · R · A
  originalLanguage?: string;
  country?: string;
  genres: string[];
  tagline?: string;
  collection?: string;       // e.g. "Before Trilogy"
  spokenLanguages: string[];
  productionCompanies: string[];
  // Numbers
  budget?: number;
  revenue?: number;
  popularity?: number;
  voteCount?: number;
  voteAverage?: number;
  // Discovery
  similar: SimilarFilm[];
}

export async function GET(req: NextRequest) {
  const title = req.nextUrl.searchParams.get('title') ?? '';
  const year  = req.nextUrl.searchParams.get('year')  ?? '';
  if (!title) return NextResponse.json(null, { status: 400 });

  try {
    // ── Step 1: search for the film ──────────────────────────────────────────
    const search = await tmdb(
      `/search/movie?query=${encodeURIComponent(title)}&year=${year}&include_adult=false&language=en-US`
    );
    const movie = search?.results?.[0];
    if (!movie?.id) return NextResponse.json(null);

    const id = movie.id as number;

    // ── Step 2: fetch everything in parallel ─────────────────────────────────
    const [details, credits, releases, videos, watchProviders, recommendations] =
      await Promise.all([
        tmdb(`/movie/${id}?language=en-US`),
        tmdb(`/movie/${id}/credits`),
        tmdb(`/movie/${id}/release_dates`),
        tmdb(`/movie/${id}/videos?language=en-US`),
        tmdb(`/movie/${id}/watch/providers`),
        tmdb(`/movie/${id}/recommendations?language=en-US&page=1`),
      ]);

    // ── Cast ─────────────────────────────────────────────────────────────────
    const PROFILE = 'https://image.tmdb.org/t/p/w185';
    const cast: CastMember[] = (credits?.cast ?? [])
      .sort((a: { order: number }, b: { order: number }) => a.order - b.order)
      .slice(0, 5)
      .map((c: { name: string; character?: string; profile_path?: string }) => ({
        name:       c.name,
        character:  c.character ?? undefined,
        profileUrl: c.profile_path ? `${PROFILE}${c.profile_path}` : undefined,
      }));

    // ── Trailer (official YouTube trailer first) ─────────────────────────────
    const trailerKey: string | undefined = (videos?.results ?? [])
      .filter((v: { site: string; type: string; official?: boolean }) =>
        v.site === 'YouTube' && v.type === 'Trailer'
      )
      .sort((a: { official?: boolean }, b: { official?: boolean }) =>
        (b.official ? 1 : 0) - (a.official ? 1 : 0)
      )[0]?.key;

    // ── OTT providers (India first, fall back to US) ─────────────────────────
    const regionData =
      watchProviders?.results?.IN ??
      watchProviders?.results?.US ??
      null;

    const ottLink: string | undefined = regionData?.link;
    const rawProviders: { provider_name: string; logo_path: string }[] =
      regionData?.flatrate ?? regionData?.rent ?? [];
    const ottProviders: OttProvider[] = rawProviders.slice(0, 5).map((p) => ({
      name:    p.provider_name,
      logoUrl: `${LOGO}${p.logo_path}`,
    }));

    // ── Certification (India first, US fallback) ─────────────────────────────
    const allReleaseDates: { iso_3166_1: string; release_dates: { certification: string }[] }[] =
      releases?.results ?? [];
    const certEntry =
      allReleaseDates.find((r) => r.iso_3166_1 === 'IN') ??
      allReleaseDates.find((r) => r.iso_3166_1 === 'US');
    const certification: string | undefined =
      certEntry?.release_dates?.find((d) => d.certification)?.certification;

    // ── Genres ───────────────────────────────────────────────────────────────
    const genres: string[] = (details?.genres ?? []).map((g: { name: string }) => g.name);

    // ── Languages ────────────────────────────────────────────────────────────
    const spokenLanguages: string[] = (details?.spoken_languages ?? []).map(
      (l: { english_name: string }) => l.english_name
    );

    // ── Production companies ─────────────────────────────────────────────────
    const productionCompanies: string[] = (details?.production_companies ?? [])
      .slice(0, 3)
      .map((c: { name: string }) => c.name);

    // ── Country ──────────────────────────────────────────────────────────────
    const country: string | undefined =
      details?.production_countries?.[0]?.iso_3166_1;

    // ── Collection ───────────────────────────────────────────────────────────
    const collection: string | undefined =
      details?.belongs_to_collection?.name?.replace(/ Collection$/i, '').trim();

    // ── Similar films (top 3 with posters) ──────────────────────────────────
    const similar: SimilarFilm[] = (recommendations?.results ?? [])
      .filter((f: { poster_path?: string }) => !!f.poster_path)
      .slice(0, 3)
      .map((f: { id: number; title: string; release_date?: string; poster_path?: string }) => ({
        tmdbId:    f.id,
        title:     f.title,
        year:      f.release_date ? parseInt(f.release_date.split('-')[0]) : 0,
        posterUrl: f.poster_path ? `${SIM}${f.poster_path}` : undefined,
      }));

    const result: PosterResult = {
      tmdbId:   id,
      posterUrl: movie.poster_path ? `${IMG}${movie.poster_path}` : '',
      backdropUrl: details?.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}`
        : undefined,
      cast,
      trailerKey,
      ottLink,
      ottProviders,
      runtime:           details?.runtime ?? undefined,
      certification,
      originalLanguage:  details?.original_language ?? undefined,
      country,
      genres,
      tagline:           details?.tagline || undefined,
      collection,
      spokenLanguages,
      productionCompanies,
      budget:            details?.budget || undefined,
      revenue:           details?.revenue || undefined,
      popularity:        details?.popularity ?? undefined,
      voteCount:         details?.vote_count ?? undefined,
      voteAverage:       details?.vote_average ?? undefined,
      similar,
    };

    return NextResponse.json(result, { headers: CACHE_HEADERS });
  } catch {
    return NextResponse.json(null);
  }
}
