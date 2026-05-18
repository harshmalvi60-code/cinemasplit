import { Film, FilmIndex } from './types';
import { films } from './data/films';

export function filmToSlug(film: Film): string {
  return `${film.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${film.year}`;
}

export interface FilmLocation {
  film: Film;
  worldSlug: string;
  emotionSlug: string;
}

/** Find a film by its URL slug across all emotions */
export function getFilmBySlug(slug: string): FilmLocation | null {
  for (const [key, list] of Object.entries(films as FilmIndex)) {
    const [worldSlug, emotionSlug] = key.split('/');
    for (const film of list) {
      if (filmToSlug(film) === slug) return { film, worldSlug, emotionSlug };
    }
  }
  return null;
}

/** Get all emotion locations for a film title (it may appear in multiple emotions) */
export function getFilmEmotions(title: string): { worldSlug: string; emotionSlug: string }[] {
  const locations: { worldSlug: string; emotionSlug: string }[] = [];
  const seen = new Set<string>();
  for (const [key, list] of Object.entries(films as FilmIndex)) {
    if (list.some((f) => f.title === title)) {
      const [worldSlug, emotionSlug] = key.split('/');
      const k = `${worldSlug}/${emotionSlug}`;
      if (!seen.has(k)) { seen.add(k); locations.push({ worldSlug, emotionSlug }); }
    }
  }
  return locations;
}

/** Generate all unique film slugs for static params */
export function getAllFilmSlugs(): string[] {
  const slugs = new Set<string>();
  for (const list of Object.values(films as FilmIndex)) {
    for (const film of list) slugs.add(filmToSlug(film));
  }
  return [...slugs];
}
