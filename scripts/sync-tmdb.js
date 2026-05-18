#!/usr/bin/env node
/**
 * Cinemasplit — TMDB Sync Script
 * ─────────────────────────────────────────────────────────────────────────────
 * Fetches real poster art, top 5 cast, runtime, and TMDB ID for every film.
 * Saves results to lib/data/tmdb-cache.json.
 * FilmCard reads the cache — real poster when present, mood gradient fallback.
 *
 * USAGE
 *   node scripts/sync-tmdb.js YOUR_TMDB_API_KEY
 *
 * Or with env var:
 *   TMDB_KEY=your_key node scripts/sync-tmdb.js
 *
 * Get a free key in 2 minutes at: https://www.themoviedb.org/settings/api
 * (Free tier — no credit card, no usage limits for indie projects)
 *
 * The script makes ~200 API calls. Runs in about 35–40 seconds.
 * Re-run any time you add new films to the data.
 */

const fs   = require('fs');
const path = require('path');
const https = require('https');

// ─── Config ────────────────────────────────────────────────────────────────────

const API_KEY  = process.argv[2] || process.env.TMDB_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p/w500';
const OUT_FILE = path.join(__dirname, '..', 'lib', 'data', 'tmdb-cache.json');
const DELAY_MS = 160; // stay well under TMDB's 40 req/10s limit

if (!API_KEY) {
  console.error('\n  ✗  No API key provided.\n');
  console.error('  Usage: node scripts/sync-tmdb.js YOUR_KEY\n');
  console.error('  Get a free key: https://www.themoviedb.org/settings/api\n');
  process.exit(1);
}

// ─── All 97 unique films across 14 emotions ────────────────────────────────────
// key = the same "title-year" string used as the cache lookup in FilmCard

const FILMS = [
  // Healing
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
  // Healing — Numbness
  { title: 'Manchester by the Sea', year: 2016 },
  { title: 'Drive My Car', year: 2021 },
  { title: 'Aftersun', year: 2022 },
  { title: 'A Ghost Story', year: 2017 },
  { title: 'Melancholia', year: 2011 },
  { title: 'The Wrestler', year: 2008 },
  { title: 'Into the Wild', year: 2007 },
  { title: 'Nomadland', year: 2020 },
  { title: 'The Secret Life of Walter Mitty', year: 2013 },
  // Loneliness
  { title: 'Taxi Driver', year: 1976 },
  { title: 'Blade Runner 2049', year: 2017 },
  { title: 'Chungking Express', year: 1994 },
  { title: 'Paris, Texas', year: 1984 },
  { title: 'Lars and the Real Girl', year: 2007 },
  { title: 'The Lobster', year: 2015 },
  { title: 'Perfect Days', year: 2023 },
  { title: 'Fallen Angels', year: 1995 },
  // Loneliness — Invisible
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
  // Identity
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
  // Social Anxiety
  { title: 'Punch-Drunk Love', year: 2002 },
  { title: 'Amelie', year: 2001 },
  { title: 'A Silent Voice', year: 2016 },
  { title: 'Cha Cha Real Smooth', year: 2022 },
  { title: 'Columbus', year: 2017 },
  { title: 'Submarine', year: 2010 },
  // Self-Worth
  { title: 'Good Will Hunting', year: 1997 },
  { title: 'Rocky', year: 1976 },
  { title: 'The Pursuit of Happyness', year: 2006 },
  { title: 'Little Miss Sunshine', year: 2006 },
  { title: 'Dead Poets Society', year: 1989 },
  { title: 'Silver Linings Playbook', year: 2012 },
  { title: 'The Peanut Butter Falcon', year: 2019 },
  { title: 'Chef', year: 2014 },
  // Purpose
  { title: 'Ikiru', year: 1952 },
  { title: 'Wild', year: 2014 },
  { title: 'Garden State', year: 2004 },
  { title: 'Paterson', year: 2016 },
  // Existential
  { title: 'The Tree of Life', year: 2011 },
  { title: 'Stalker', year: 1979 },
  { title: 'The Seventh Seal', year: 1957 },
  { title: 'Waking Life', year: 2001 },
  { title: 'Enter the Void', year: 2009 },
  // Grief
  { title: 'The Farewell', year: 2019 },
  { title: 'Coco', year: 2017 },
  { title: 'Rabbit Hole', year: 2010 },
  { title: 'Three Colors: Blue', year: 1993 },
  { title: 'Arrival', year: 2016 },
  { title: 'Big Fish', year: 2003 },
  // Inner Peace
  { title: 'Before Sunrise', year: 1995 },
  { title: 'Minari', year: 2020 },
  { title: 'The Straight Story', year: 1999 },
  { title: 'My Neighbor Totoro', year: 1988 },
  { title: 'Spring, Summer, Fall, Winter... and Spring', year: 2003 },
  { title: 'After Yang', year: 2021 },
  // Spiritual Awakening
  { title: 'The Matrix', year: 1999 },
  { title: 'Life of Pi', year: 2012 },
  { title: 'Samsara', year: 2011 },
  { title: 'The Fountain', year: 2006 },
  { title: 'Baraka', year: 1992 },
  // Hope
  { title: 'The Shawshank Redemption', year: 1994 },
  { title: 'Life is Beautiful', year: 1997 },
  { title: 'Jojo Rabbit', year: 2019 },
  { title: 'About Time', year: 2013 },
  { title: 'The Intouchables', year: 2011 },
  { title: 'Wonder', year: 2017 },
  // Emotional Growth
  { title: 'Before Midnight', year: 2013 },
  { title: 'Boyhood', year: 2014 },
  { title: 'Little Women', year: 2019 },
  { title: 'The Holdovers', year: 2023 },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`Parse error for ${url}: ${e.message}`)); }
      });
    }).on('error', reject);
  });
}

function cacheKey(title, year) {
  return `${title}-${year}`;
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function run() {
  console.log(`\n  Cinemasplit × TMDB sync`);
  console.log(`  Fetching data for ${FILMS.length} films...\n`);

  // Load existing cache so we can resume if interrupted
  let cache = {};
  if (fs.existsSync(OUT_FILE)) {
    try { cache = JSON.parse(fs.readFileSync(OUT_FILE, 'utf8')); }
    catch { cache = {}; }
    const existing = Object.keys(cache).length;
    if (existing > 0) console.log(`  Resuming — ${existing} films already cached.\n`);
  }

  let fetched = 0;
  let skipped = 0;
  let failed  = 0;

  for (const film of FILMS) {
    const key = cacheKey(film.title, film.year);

    if (cache[key]) {
      skipped++;
      continue; // already cached
    }

    try {
      // 1 ── Search for the film
      const searchUrl = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(film.title)}&year=${film.year}&language=en-US`;
      const searchRes = await get(searchUrl);

      if (!searchRes.results || searchRes.results.length === 0) {
        console.warn(`  ⚠  Not found: ${film.title} (${film.year})`);
        failed++;
        await sleep(DELAY_MS);
        continue;
      }

      const movie = searchRes.results[0];
      await sleep(DELAY_MS);

      // 2 ── Fetch credits for top cast
      const creditsUrl = `${BASE_URL}/movie/${movie.id}/credits?api_key=${API_KEY}`;
      const creditsRes = await get(creditsUrl);
      const cast = (creditsRes.cast || [])
        .slice(0, 5)
        .map((c) => c.name);

      cache[key] = {
        tmdbId    : movie.id,
        posterUrl : movie.poster_path ? `${IMG_BASE}${movie.poster_path}` : null,
        cast,
        runtime   : movie.runtime || null,
        overview  : movie.overview || null,
      };

      fetched++;
      process.stdout.write(`  ✓  ${film.title} (${film.year})\n`);
      await sleep(DELAY_MS);

    } catch (err) {
      console.warn(`  ✗  Error for ${film.title}: ${err.message}`);
      failed++;
      await sleep(DELAY_MS * 2);
    }

    // Save incrementally every 10 films
    if ((fetched + failed) % 10 === 0) {
      fs.writeFileSync(OUT_FILE, JSON.stringify(cache, null, 2));
    }
  }

  // Final save
  fs.writeFileSync(OUT_FILE, JSON.stringify(cache, null, 2));

  const total = Object.keys(cache).length;
  console.log(`\n  ─────────────────────────────────`);
  console.log(`  Done.`);
  console.log(`  Fetched : ${fetched}`);
  console.log(`  Skipped : ${skipped} (already cached)`);
  console.log(`  Failed  : ${failed}`);
  console.log(`  Total   : ${total} films in cache`);
  console.log(`  Saved   : lib/data/tmdb-cache.json`);
  console.log(`\n  Now run: git add lib/data/tmdb-cache.json && git push\n`);
}

run().catch((err) => {
  console.error('\n  Fatal error:', err.message);
  process.exit(1);
});
