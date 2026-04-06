/**
 * Fetch Netflix + Max (HBO Max) catalog metadata from TMDB discover API.
 * - All pages per date slice (TMDB caps at 500 pages per query; script splits ranges when needed).
 * - Movies & TV since configurable min year through current calendar year (no fixed end year).
 *
 * Requires TMDB API key: TMDB_API_KEY or VITE_TMDB_API_KEY in env or project root .env
 *
 * Optional env:
 *   TMDB_WATCH_REGION   — ISO country (default SG). Max catalog varies heavily by region; try US for broader Max data.
 *   TMDB_MIN_YEAR       — default 2000
 *   TMDB_STREAMING_PROVIDER_IDS — comma-separated TMDB provider IDs (default "8,1899" = Netflix, Max)
 *   TMDB_DISCOVER_DELAY_MS — delay between discover requests (default 55, TMDB ~40 req / 10s)
 *   TMDB_DETAILS_DELAY_MS  — delay between detail requests (default 250)
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

/** Default: Netflix (8), Max / HBO Max as TMDB lists it (1899) — override via TMDB_STREAMING_PROVIDER_IDS */
const DEFAULT_PROVIDER_IDS = [8, 1899];

const PROVIDER_SLUGS = {
  8: 'netflix',
  1899: 'max',
  384: 'max', // alternate HBO Max id seen in some regions
};

function loadRootEnv() {
  const envPath = path.join(__dirname, '../.env');
  if (!fs.existsSync(envPath)) return;
  const text = fs.readFileSync(envPath, 'utf8');
  for (const line of text.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const idx = t.indexOf('=');
    if (idx === -1) continue;
    const key = t.slice(0, idx).trim();
    let val = t.slice(idx + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadRootEnv();

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function getConfig() {
  const apiKey = (process.env.TMDB_API_KEY || process.env.VITE_TMDB_API_KEY || '').trim();

  const watchRegion = (process.env.TMDB_WATCH_REGION || 'SG').trim();
  const minYear = Math.max(
    1888,
    parseInt(process.env.TMDB_MIN_YEAR || '2000', 10) || 2000
  );
  const maxYear = new Date().getFullYear();

  const providerIds = (process.env.TMDB_STREAMING_PROVIDER_IDS || DEFAULT_PROVIDER_IDS.join(','))
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !Number.isNaN(n));

  const discoverDelay = Math.max(
    0,
    parseInt(process.env.TMDB_DISCOVER_DELAY_MS || '55', 10) || 55
  );
  const detailsDelay = Math.max(
    0,
    parseInt(process.env.TMDB_DETAILS_DELAY_MS || '250', 10) || 250
  );

  return {
    apiKey,
    watchRegion,
    minYear,
    maxYear,
    providerIds: providerIds.length ? providerIds : DEFAULT_PROVIDER_IDS,
    discoverDelay,
    detailsDelay,
  };
}

function providerSlug(id) {
  return PROVIDER_SLUGS[id] || `provider-${id}`;
}

// TMDB genre ID to our Genre mapping
const GENRE_MAP = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  18: 'Drama',
  14: 'Fantasy',
  27: 'Horror',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  53: 'Thriller',
};

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 300)}`));
            return;
          }
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', reject);
  });
}

function formatISODate(d) {
  return d.toISOString().slice(0, 10);
}

function addDays(isoDate, days) {
  const d = new Date(isoDate + 'T12:00:00.000Z');
  d.setUTCDate(d.getUTCDate() + days);
  return formatISODate(d);
}

/**
 * Fetch every page for one discover query; if TMDB reports >500 pages, split the date range and recurse.
 */
async function fetchDiscoverRange(media, providerId, dateGte, dateLte, cfg) {
  const { apiKey, watchRegion, discoverDelay } = cfg;
  const dateField = media === 'movie' ? 'primary_release_date' : 'first_air_date';
  const pathSeg = media === 'movie' ? 'discover/movie' : 'discover/tv';

  const buildUrl = (page) =>
    `${BASE_URL}/${pathSeg}?api_key=${apiKey}&watch_region=${watchRegion}&with_watch_providers=${providerId}&${dateField}.gte=${dateGte}&${dateField}.lte=${dateLte}&sort_by=popularity.desc&include_adult=false&page=${page}`;

  const first = await fetchJSON(buildUrl(1));
  if (discoverDelay) await sleep(discoverDelay);

  if (first.status_code && first.success === false) {
    throw new Error(first.status_message || `TMDB error for ${pathSeg}`);
  }

  const totalPagesReported = first.total_pages || 1;
  const totalResults = first.total_results ?? 0;

  if (totalPagesReported > 500) {
    const start = new Date(dateGte + 'T12:00:00.000Z');
    const end = new Date(dateLte + 'T12:00:00.000Z');
    if (start >= end) {
      console.warn(
        `Cannot shard further (${media} provider ${providerId} ${dateGte}..${dateLte}); taking first 500 pages only.`
      );
      return await fetchAllPagesUpTo(buildUrl, 500, discoverDelay, first.results || []);
    }
    const midTime = start.getTime() + Math.floor((end.getTime() - start.getTime()) / 2);
    const mid = new Date(midTime);
    const midStr = formatISODate(mid);
    const leftEnd = midStr;
    const rightStart = addDays(midStr, 1);
    console.log(
      `  Splitting ${media} (provider ${providerId}) ${dateGte}..${dateLte} — ${totalResults} results, ${totalPagesReported} pages (>500)`
    );
    const left = await fetchDiscoverRange(media, providerId, dateGte, leftEnd, cfg);
    const right = await fetchDiscoverRange(media, providerId, rightStart, dateLte, cfg);
    return [...left, ...right];
  }

  return await fetchAllPagesUpTo(
    buildUrl,
    totalPagesReported,
    discoverDelay,
    first.results || []
  );
}

async function fetchAllPagesUpTo(buildUrl, totalPages, discoverDelay, firstPageResults) {
  const all = [...firstPageResults];
  for (let page = 2; page <= totalPages; page++) {
    const res = await fetchJSON(buildUrl(page));
    if (discoverDelay) await sleep(discoverDelay);
    if (res.results?.length) all.push(...res.results);
  }
  return all;
}

async function fetchProviderMediaForYear(media, providerId, year, cfg) {
  const dateGte = `${year}-01-01`;
  const dateLte = `${year}-12-31`;
  return fetchDiscoverRange(media, providerId, dateGte, dateLte, cfg);
}

/**
 * All titles for one provider + media type from minYear through maxYear (deduped by TMDB id).
 */
async function fetchAllForProvider(media, providerId, cfg) {
  const { minYear, maxYear } = cfg;
  const byId = new Map();
  const slug = providerSlug(providerId);

  for (let year = minYear; year <= maxYear; year++) {
    const batch = await fetchProviderMediaForYear(media, providerId, year, cfg);
    for (const item of batch) {
      if (!byId.has(item.id)) byId.set(item.id, item);
    }
    console.log(
      `  ${slug} ${media} ${year}: +${batch.length} rows, cumulative unique ${byId.size}`
    );
  }
  return byId;
}

function mergeProviderMaps(providerMaps) {
  const merged = new Map();
  for (const { providerId, byId } of providerMaps) {
    const slug = providerSlug(providerId);
    for (const [tmdbNumericId, item] of byId) {
      const key = tmdbNumericId;
      const cur = merged.get(key);
      if (!cur) {
        merged.set(key, { item, providers: new Set([slug]) });
      } else {
        cur.providers.add(slug);
      }
    }
  }
  return merged;
}

function toRating510(voteAverage) {
  const raw = (Number(voteAverage) || 0) / 2;
  return Math.min(5, Math.max(0, Math.round(raw * 100) / 100));
}

function determineContentRating(genres, voteAverage, overview = '') {
  const rating = voteAverage || 0;
  const desc = (overview || '').toLowerCase();

  if (genres.includes('Horror') && rating > 7.5) return 'R21';
  if (desc.includes('explicit') || desc.includes('graphic violence')) return 'R21';

  if (genres.includes('Horror')) return 'M18';
  if (genres.includes('Thriller') && rating > 7.0) return 'M18';
  if (genres.includes('Crime') && rating > 7.0) return 'M18';
  if (desc.includes('violence') || desc.includes('mature')) return 'M18';

  if (genres.includes('Thriller')) return 'NC16';
  if (genres.includes('Crime')) return 'NC16';
  if (genres.includes('Action') && rating > 7.0) return 'NC16';
  if (genres.includes('Mystery')) return 'NC16';

  if (genres.includes('Action')) return 'PG13';
  if (genres.includes('Sci-Fi')) return 'PG13';
  if (genres.includes('Adventure') && !genres.includes('Animation')) return 'PG13';

  if (genres.includes('Drama')) return 'PG';
  if (genres.includes('Romance')) return 'PG';
  if (genres.includes('Comedy') && !genres.includes('Animation')) return 'PG';

  if (genres.includes('Animation')) return 'G';

  return 'PG';
}

function watchUrlFields(title, providers) {
  const enc = encodeURIComponent(title);
  const netflixSearch = providers.has('netflix')
    ? `https://www.netflix.com/search?q=${enc}`
    : undefined;
  const maxSearch = providers.has('max')
    ? `https://play.max.com/search?q=${enc}`
    : undefined;
  // Existing UI uses netflixUrl as the primary "watch" link; fall back to Max when Netflix is absent.
  const netflixUrl = netflixSearch || maxSearch;
  const out = { netflixUrl };
  if (netflixSearch && maxSearch) out.maxUrl = maxSearch;
  return out;
}

function processMovie(movie, details, providers, cfg) {
  if (!movie.poster_path) return null;

  const genres = movie.genre_ids
    .map((id) => GENRE_MAP[id])
    .filter(Boolean)
    .slice(0, 3);

  if (genres.length === 0) return null;

  const year = movie.release_date ? parseInt(movie.release_date.split('-')[0], 10) : 0;
  if (year < cfg.minYear || year > cfg.maxYear) return null;

  let runtime = details?.runtime || 120;
  if (runtime === 0 || !runtime) {
    runtime = 120;
    if (genres.includes('Animation')) runtime = 95;
    if (genres.includes('Action')) runtime = 135;
    if (genres.includes('Drama')) runtime = 145;
    runtime += Math.floor(Math.random() * 30) - 15;
  }

  const director =
    details?.credits?.crew?.find((p) => p.job === 'Director')?.name || 'Unknown';
  const cast = details?.credits?.cast?.slice(0, 5).map((p) => p.name) || [];
  const contentRating = determineContentRating(genres, movie.vote_average, movie.overview);

  return {
    id: `tmdb-movie-${movie.id}`,
    title: movie.title,
    releaseYear: year,
    rating: toRating510(movie.vote_average),
    genres,
    runtime,
    description: movie.overview || 'No description available.',
    thumbnailUrl: `${IMAGE_BASE_URL}${movie.poster_path}`,
    director,
    cast,
    contentRating,
    type: 'movie',
    tmdbId: movie.id,
    watchProviders: Array.from(providers),
    ...watchUrlFields(movie.title, providers),
  };
}

function processSeries(series, details, providers, cfg) {
  if (!series.poster_path) return null;

  const genres = series.genre_ids
    .map((id) => GENRE_MAP[id])
    .filter(Boolean)
    .slice(0, 3);

  if (genres.length === 0) return null;

  const year = series.first_air_date ? parseInt(series.first_air_date.split('-')[0], 10) : 0;
  if (year < cfg.minYear || year > cfg.maxYear) return null;

  let runtime = details?.episode_run_time?.[0] || 45;
  if (runtime === 0 || !runtime) {
    runtime = genres.includes('Comedy') ? 30 : 50;
  }

  const creator = details?.created_by?.[0]?.name || 'Unknown';
  const cast = details?.credits?.cast?.slice(0, 5).map((p) => p.name) || [];
  const contentRating = determineContentRating(genres, series.vote_average, series.overview);

  return {
    id: `tmdb-tv-${series.id}`,
    title: series.name,
    releaseYear: year,
    rating: toRating510(series.vote_average),
    genres,
    runtime,
    description: series.overview || 'No description available.',
    thumbnailUrl: `${IMAGE_BASE_URL}${series.poster_path}`,
    director: creator,
    cast,
    contentRating,
    type: 'series',
    tmdbId: series.id,
    watchProviders: Array.from(providers),
    ...watchUrlFields(series.name, providers),
  };
}

async function getMovieDetails(movieId, apiKey) {
  const url = `${BASE_URL}/movie/${movieId}?api_key=${apiKey}&append_to_response=credits`;
  try {
    return await fetchJSON(url);
  } catch (e) {
    console.error(`Failed to fetch details for movie ${movieId}:`, e.message);
    return null;
  }
}

async function getSeriesDetails(seriesId, apiKey) {
  const url = `${BASE_URL}/tv/${seriesId}?api_key=${apiKey}&append_to_response=credits`;
  try {
    return await fetchJSON(url);
  } catch (e) {
    console.error(`Failed to fetch details for series ${seriesId}:`, e.message);
    return null;
  }
}

async function main() {
  const cfg = getConfig();

  if (!cfg.apiKey) {
    console.error(
      'Missing API key. Set TMDB_API_KEY or VITE_TMDB_API_KEY in the environment or .env'
    );
    process.exit(1);
  }

  console.log('TMDB streaming catalog fetch');
  console.log(`  Region: ${cfg.watchRegion}`);
  console.log(`  Years: ${cfg.minYear}–${cfg.maxYear} (inclusive)`);
  console.log(`  Provider IDs: ${cfg.providerIds.join(', ')}`);
  console.log(`  Discover delay: ${cfg.discoverDelay}ms, Details delay: ${cfg.detailsDelay}ms\n`);

  const movieProviderMaps = [];
  const tvProviderMaps = [];

  for (const providerId of cfg.providerIds) {
    console.log(`\n━━ Provider ${providerId} (${providerSlug(providerId)}) ━━`);
    console.log('Movies…');
    const moviesById = await fetchAllForProvider('movie', providerId, cfg);
    movieProviderMaps.push({ providerId, byId: moviesById });

    console.log('TV…');
    const tvById = await fetchAllForProvider('tv', providerId, cfg);
    tvProviderMaps.push({ providerId, byId: tvById });
  }

  const mergedMovies = mergeProviderMaps(movieProviderMaps);
  const mergedTv = mergeProviderMaps(tvProviderMaps);

  const movies = Array.from(mergedMovies.values());
  const series = Array.from(mergedTv.values());

  console.log(`\n📊 Merged unique: ${movies.length} movies, ${series.length} series`);
  console.log('\nFetching credits/details (this is slow)…\n');

  const processedMovies = [];
  let mi = 0;
  for (const { item: movie, providers } of movies) {
    if (!movie.poster_path) continue;
    mi++;
    console.log(`Movie ${mi}/${movies.length}: ${movie.title}`);
    const details = await getMovieDetails(movie.id, cfg.apiKey);
    const processed = processMovie(movie, details, providers, cfg);
    if (processed?.thumbnailUrl) processedMovies.push(processed);
    if (cfg.detailsDelay) await sleep(cfg.detailsDelay);
  }

  const processedSeries = [];
  let si = 0;
  for (const { item: s, providers } of series) {
    if (!s.poster_path) continue;
    si++;
    console.log(`Series ${si}/${series.length}: ${s.name}`);
    const details = await getSeriesDetails(s.id, cfg.apiKey);
    const processed = processSeries(s, details, providers, cfg);
    if (processed?.thumbnailUrl) processedSeries.push(processed);
    if (cfg.detailsDelay) await sleep(cfg.detailsDelay);
  }

  const allContent = [...processedMovies, ...processedSeries];

  console.log(`\n✅ Processed ${processedMovies.length} movies, ${processedSeries.length} series`);
  console.log(`   Total JSON rows: ${allContent.length}`);

  const srcOutputPath = path.join(__dirname, '../src/data/movies.json');
  const publicOutputPath = path.join(__dirname, '../public/data/movies.json');
  const jsonContent = JSON.stringify(allContent, null, 2);
  fs.writeFileSync(srcOutputPath, jsonContent);
  fs.writeFileSync(publicOutputPath, jsonContent);

  console.log(`\n💾 Saved to:\n   ${srcOutputPath}\n   ${publicOutputPath}`);
}

main().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
