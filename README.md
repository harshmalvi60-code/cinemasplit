# Cinemasplit

> Cinema, split by the way you feel.
>
> An emotional atlas of cinema. 36 curated emotional states across 9 mood worlds. Find the films that have already understood you.

---

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** with custom design tokens
- **next/font** for Inter + Instrument Serif
- Static-only data layer (TypeScript objects) — no DB until we need one

## Local development

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

To build for production:

```bash
npm run build
npm run start
```

## Project structure

```
app/
  globals.css                  design tokens, base styles, grain texture
  layout.tsx                   root layout, fonts, metadata
  page.tsx                     homepage — 9 mood world cards
  [world]/
    [emotion]/
      page.tsx                 dynamic emotion page (e.g. /healing/heartbreak-recovery)

components/
  Wordmark.tsx                 logotype with cyan brand dot
  Nav.tsx                      top nav
  Footer.tsx                   manifesto + social meta
  MoodWorldCard.tsx            world card with atmospheric still + cursor spotlight
  EmotionPicker.tsx            4-emotion tab picker for a world
  FilmCard.tsx                 editorial film card with reasoning + after-feeling

lib/
  types.ts                     TypeScript model
  data/
    taxonomy.ts                all 9 mood worlds × 4 emotions (36 total)
    films.ts                   curated films by world/emotion key
```

## Routing

- `/` — homepage with 9 mood world cards
- `/[world]/[emotion]` — every emotion gets its own SEO-friendly URL
  - e.g. `/healing/heartbreak-recovery`, `/loneliness/feeling-invisible`, etc.

All 36 emotion pages are generated at build time via `generateStaticParams`.

## Design language

- **Background:** warm-black canvas (`#0a0908`) with film grain overlay and a vignette
- **Brand accent:** electric cyan `#13edff` — used for CTAs, highlights, hover states, the wordmark dot, and the italic emphasis in headlines. When cyan appears, Cinemasplit is speaking.
- **Mood-world atmospheres:** each world has a unique warm gradient signature (amber for Healing, blue for Loneliness, crimson for Insecurity, etc.). When you enter a world, the entire viewport bleeds that world's atmosphere.
- **Fonts:**
  - Display: **Instrument Serif** (regular + italic) — wordmark, headlines, world titles, film titles, manifesto
  - Body: **Inter** — all functional and readable text

## Content roadmap

The taxonomy is fully wired. The curation work is the IP layer:

- [x] World 01 / Healing / Heartbreak Recovery — 6 films curated
- [ ] World 01 / Healing / Self-acceptance
- [ ] World 01 / Healing / Forgiveness
- [ ] World 01 / Healing / Inner peace
- [ ] World 02–09 (all 32 remaining emotions)

Add new film lists in `lib/data/films.ts`. Key is `${worldSlug}/${emotionSlug}`.

Empty emotions render a "Curation in progress" state — no broken pages.

## Deployment

### GitHub

```bash
git init
git add .
git commit -m "Cinemasplit — initial scaffold"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/cinemasplit.git
git push -u origin main
```

### Vercel

1. Go to <https://vercel.com/new>
2. Import the GitHub repo
3. Framework preset: Next.js (auto-detected)
4. Click Deploy

Once deployed, point `cinemasplit.com` at Vercel via the Domains tab.

## TMDB integration (next milestone)

Real poster art will replace the atmospheric placeholders. Steps when ready:

1. Get a free TMDB API key: <https://www.themoviedb.org/settings/api>
2. Add `TMDB_API_KEY=...` to `.env.local` and Vercel project env vars
3. We'll add a `lib/tmdb.ts` fetcher and a `posterUrl` field to the `Film` type

## License

All curation copy and design are © Cinemasplit. Films referenced are credited to their respective directors and studios; this project does not host, embed, or reproduce film content.
