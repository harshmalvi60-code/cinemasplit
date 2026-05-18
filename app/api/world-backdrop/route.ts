import { NextRequest, NextResponse } from 'next/server';

const KEY      = '4c5a6908e94d6a7fde3b001b69011428';
const BASE     = 'https://api.themoviedb.org/3';
const BACKDROP = 'https://image.tmdb.org/t/p/w1280';

const SIGNATURE: Record<string, { title: string; year: number }> = {
  'healing':               { title: 'Eternal Sunshine of the Spotless Mind', year: 2004 },
  'loneliness':            { title: 'Lost in Translation',                    year: 2003 },
  'identity-crisis':       { title: 'Fight Club',                             year: 1999 },
  'social-anxiety':        { title: 'Her',                                    year: 2013 },
  'self-worth':            { title: 'Good Will Hunting',                      year: 1997 },
  'purpose-and-direction': { title: 'Into the Wild',                          year: 2007 },
  'existential-confusion': { title: 'The Tree of Life',                       year: 2011 },
  'grief':                 { title: 'Manchester by the Sea',                  year: 2016 },
  'inner-peace':           { title: 'Perfect Days',                           year: 2023 },
  'spiritual-awakening':   { title: 'Arrival',                                year: 2016 },
  'hope':                  { title: 'The Shawshank Redemption',               year: 1994 },
  'emotional-growth':      { title: 'Boyhood',                                year: 2014 },
};

export async function GET(req: NextRequest) {
  const world = req.nextUrl.searchParams.get('world') ?? '';
  const film  = SIGNATURE[world];
  if (!film) return NextResponse.json(null);

  try {
    const res = await fetch(
      `${BASE}/search/movie?api_key=${KEY}&query=${encodeURIComponent(film.title)}&year=${film.year}`,
      { next: { revalidate: 2592000 } }
    );
    if (!res.ok) return NextResponse.json(null);

    const data  = await res.json();
    const movie = data?.results?.[0] as { backdrop_path?: string } | undefined;
    if (!movie?.backdrop_path) return NextResponse.json(null);

    return NextResponse.json(
      { backdropUrl: `${BACKDROP}${movie.backdrop_path}` },
      { headers: { 'Cache-Control': 'public, s-maxage=2592000, stale-while-revalidate=86400' } }
    );
  } catch {
    return NextResponse.json(null);
  }
}
