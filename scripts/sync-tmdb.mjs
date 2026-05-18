/**
 * Cinemasplit — TMDB Sync Script
 * ─────────────────────────────────────────────────────────────
 * Run once locally after cloning:
 *   node scripts/sync-tmdb.mjs
 *
 * What it does:
 *   1. Searches TMDB for every film by title + year
 *   2. Fetches poster, runtime, top-5 cast, cinematographer, composer
 *   3. Fetches watch providers for India (IN) → real OTT page URL
 *   4. Writes lib/data/tmdb-data.json
 *
 * Then: git add lib/data/tmdb-data.json && git commit -m "feat: TMDB enrichment" && git push
 * Vercel re-deploys with real poster art, cast, and OTT links.
 *
 * ⚠️  Move the API key to .env.local for production:
 *     TMDB_API_KEY=your_key_here
 *     Then read it with: process.env.TMDB_API_KEY
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const API_KEY   = process.env.TMDB_API_KEY || '4c5a6908e94d6a7fde3b001b69011428';
const BASE      = 'https://api.themoviedb.org/3';
const IMG       = 'https://image.tmdb.org/t/p/w500';
const REGION    = 'IN'; // India — change for other markets

// ─── Full film list ────────────────────────────────────────────────────────────
// Deduplicated: some films appear in multiple emotion lists
const ALL_FILMS = [
  // HEALING
  { title: 'Eternal Sunshine of the Spotless Mind', year: 2004 },
  { title: 'Her', year: 2013 },
  { title: 'Blue Valentine', year: 2010 },
  { title: 'Marriage Story', year: 2019 },
  { title: 'Before Sunset', year: 2004 },
  { title: 'Lost in Translation', year: 2003 },
  { title: 'La La Land', year: 2016 },
  { title: 'Call Me by Your Name', year: 2017 },
  { title: 'Past Lives', year: 2023 },
  { title: '(500) Days of Summer', year: 2009 },
  { title: 'Manchester by the Sea', year: 2016 },
  { title: 'Drive My Car', year: 2021 },
  { title: 'Aftersun', year: 2022 },
  { title: 'A Ghost Story', year: 2017 },
  { title: 'Melancholia', year: 2011 },
  { title: 'The Wrestler', year: 2008 },
  { title: 'Into the Wild', year: 2007 },
  { title: 'Nomadland', year: 2020 },
  { title: 'The Secret Life of Walter Mitty', year: 2013 },
  // LONELINESS
  { title: 'Taxi Driver', year: 1976 },
  { title: 'Blade Runner 2049', year: 2017 },
  { title: 'Chungking Express', year: 1994 },
  { title: 'Paris, Texas', year: 1984 },
  { title: 'Lars and the Real Girl', year: 2007 },
  { title: 'The Lobster', year: 2015 },
  { title: 'Perfect Days', year: 2023 },
  { title: 'Fallen Angels', year: 1995 },
  { title: 'The Perks of Being a Wallflower', year: 2012 },
  { title: 'Moonlight', year: 2016 },
  { title: 'The Whale', year: 2022 },
  { title: 'Joker', year: 2019 },
  { title: 'Lady Bird', year: 2017 },
  { title: 'Frances Ha', year: 2012 },
  { title: 'Eighth Grade', year: 2018 },
  { title: 'The Edge of Seventeen', year: 2016 },
  { title: 'Mary and Max', year: 2009 },
  { title: 'Inside Llewyn Davis', year: 2013 },
  // IDENTITY
  { title: 'Fight Club', year: 1999 },
  { title: 'Black Swan', year: 2010 },
  { title: 'The Truman Show', year: 1998 },
  { title: 'Donnie Darko', year: 2001 },
  { title: 'Persona', year: 1966 },
  { title: 'Everything Everywhere All at Once', year: 2022 },
  { title: 'Synecdoche, New York', year: 2008 },
  { title: 'Mr. Nobody', year: 2009 },
  { title: 'Enemy', year: 2013 },
  { title: 'Soul', year: 2020 },
  // SOCIAL ANXIETY
  { title: 'Punch-Drunk Love', year: 2002 },
  { title: 'Amelie', year: 2001 },
  { title: 'A Silent Voice', year: 2016 },
  { title: 'Cha Cha Real Smooth', year: 2022 },
  { title: 'Columbus', year: 2017 },
  { title: 'Submarine', year: 2010 },
  // SELF-WORTH
  { title: 'Good Will Hunting', year: 1997 },
  { title: 'Rocky', year: 1976 },
  { title: 'The Pursuit of Happyness', year: 2006 },
  { title: 'Little Miss Sunshine', year: 2006 },
  { title: 'Dead Poets Society', year: 1989 },
  { title: 'Silver Linings Playbook', year: 2012 },
  { title: 'The Peanut Butter Falcon', year: 2019 },
  { title: 'Chef', year: 2014 },
  // PURPOSE
  { title: 'Ikiru', year: 1952 },
  { title: 'Wild', year: 2014 },
  { title: 'Garden State', year: 2004 },
  { title: 'Paterson', year: 2016 },
  // EXISTENTIAL
  { title: 'The Tree of Life', year: 2011 },
  { title: 'Stalker', year: 1979 },
  { title: 'The Seventh Seal', year: 1957 },
  { title: 'Waking Life', year: 2001 },
  { title: 'Enter the Void', year: 2009 },
  // GRIEF
  { title: 'The Farewell', year: 2019 },
  { title: 'Coco', year: 2017 },
  { title: 'Rabbit Hole', year: 2010 },
  { title: 'Three Colors: Blue', year: 1993 },
  { title: 'Arrival', year: 2016 },
  { title: 'Big Fish', year: 2003 },
  // INNER PEACE
  { title: 'Before Sunrise', year: 1995 },
  { title: 'Minari', year: 2020 },
  { title: 'The Straight Story', year: 1999 },
  { title: 'My Neighbor Totoro', year: 1988 },
  { title: 'Spring, Summer, Fall, Winter… and Spring', year: 2003 },
  { title: 'After Yang', year: 2021 },
  // SPIRITUAL
  { title: 'The Matrix', year: 1999 },
  { title: 'Life of Pi', year: 2012 },
  { title: 'Samsara', year: 2011 },
  { title: 'The Fountain', year: 2006 },
  { title: 'Baraka', year: 1992 },
  // HOPE
  { title: 'The Shawshank Redemption', year: 1994 },
  { title: 'Life is Beautiful', year: 1997 },
  { title: 'Jojo Rabbit', year: 2019 },
  { title: 'About Time', year: 2013 },
  { title: 'The Intouchables', year: 2011 },
  { title: 'Wonder', year: 2017 },
  // GROWTH
  { title: 'Before Midnight', year: 2013 },
  { title: 'Boyhood', year: 2014 },
  { title: 'Little Women', year: 2019 },
  { title: 'The Holdovers', year: 2023 },
];

// ─── API helpers ───────────────────────────────────────────────────────────────

async function get(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB ${res.status}: ${url}`);
  return res.json();
}

async function searchFilm(title, year) {
  const q   = encodeURIComponent(title);
  const url = `${BASE}/search/movie?api_key=${API_KEY}&query=${q}&year=${year}&language=en-US`;
  const data = await get(url);
  return data.results?.[0] ?? null;
}

async function getCredits(id) {
  return get(`${BASE}/movie/${id}/credits?api_key=${API_KEY}`);
}

async function getProviders(id) {
  const data = await get(`${BASE}/movie/${id}/watch/providers?api_key=${API_KEY}`);
  return data.results?.[REGION] ?? null;
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const output = {};
  let success = 0;
  let failed  = 0;

  console.log(`\nCinemasplit TMDB Sync — ${ALL_FILMS.length} films\n${'─'.repeat(50)}`);

  for (const { title, year } of ALL_FILMS) {
    const key = `${title}-${year}`;
    process.stdout.write(`  ${title} (${year}) … `);

    try {
      const movie = await searchFilm(title, year);
      if (!movie) {
        console.log('NOT FOUND');
        failed++;
        continue;
      }

      const [credits, providers] = await Promise.all([
        getCredits(movie.id),
        getProviders(movie.id),
      ]);

      // Top 5 cast
      const cast = (credits.cast ?? []).slice(0, 5).map(c => c.name);

      // Crew: DP + Composer
      const crew          = credits.crew ?? [];
      const cinematographer = crew.find(c => c.job === 'Director of Photography')?.name ?? null;
      const composer      = crew.find(c =>
        c.job === 'Original Music Composer' || c.department === 'Sound'
      )?.name ?? null;

      // OTT providers for the region
      const ottLink      = providers?.link ?? null;
      const ottProviders = (providers?.flatrate ?? []).map(p => p.provider_name);

      output[key] = {
        tmdbId:         movie.id,
        posterUrl:      movie.poster_path  ? `${IMG}${movie.poster_path}` : null,
        runtime:        movie.runtime ?? null,
        cast:           cast.length  ? cast  : null,
        cinematographer: cinematographer,
        composer:        composer,
        ottLink:         ottLink,
        ottProviders:    ottProviders.length ? ottProviders : null,
      };

      console.log(`✓  (${cast.length} cast · ${ottProviders.join(', ') || 'no OTT data'})`);
      success++;
    } catch (err) {
      console.log(`✗  ${err.message}`);
      failed++;
    }

    // Respect TMDB rate limit (~40 req/10s). 3 calls per film → 280ms gap is safe.
    await delay(280);
  }

  // Write output
  const outPath = join(__dirname, '../lib/data/tmdb-data.json');
  writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`✓  ${success} films enriched`);
  if (failed) console.log(`✗  ${failed} not found (check titles above)`);
  console.log(`\nWritten → lib/data/tmdb-data.json`);
  console.log(`\nNext steps:`);
  console.log(`  git add lib/data/tmdb-data.json`);
  console.log(`  git commit -m "feat: TMDB poster + cast + OTT enrichment"`);
  console.log(`  git push\n`);
}

main().catch(console.error);
