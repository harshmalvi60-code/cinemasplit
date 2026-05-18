// Cinemasplit — data model

export type PosterMood =
  | 'dawn'
  | 'dusk'
  | 'night'
  | 'fire'
  | 'water'
  | 'violet'
  | 'gold'
  | 'ice'
  | 'rose'
  | 'ash';

export interface Emotion {
  slug: string;
  name: string;
  tagline: string;
  /** 80–120 word editorial intro displayed at the top of each emotion page */
  editorial?: string;
}

export interface MoodWorld {
  slug: string;
  number: string;
  name: string;
  tagline: string;
  description: string;
  emotions: Emotion[];
  tile: string;
  hero?: string;
  pageAtmosphere: string;
  signature: string;
}

export interface Film {
  title: string;
  director: string;
  year: number;
  rating: number;             // Cinemasplit Score, 0–10
  mood: PosterMood;
  story: string;              // 1–2 sentence spoiler-free synopsis
  // emotion-specific
  why: string;
  after: string;
  // 5-section review
  direction: string;
  cinematography: string;
  musicSound: string;
  impact: string;
  overall: string;
  // Filled in later by the TMDB sync milestone
  cast?: string[];
  cinematographer?: string;
  composer?: string;
  runtime?: number;
  tmdbId?: number;
  posterUrl?: string;       // https://image.tmdb.org/t/p/w500{poster_path}
  ottLink?: string;         // JustWatch movie-specific page (from TMDB watch/providers)
  ottProviders?: string[];  // e.g. ['Netflix', 'Mubi', 'Amazon Prime Video']
}

/** key = `${worldSlug}/${emotionSlug}` */
export type FilmIndex = Record<string, Film[]>;
