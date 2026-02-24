/**
 * Fetch Netflix Singapore content from TMDB API
 * Uses TMDB's watch providers endpoint to get Netflix-specific content
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = '8265bd1679663a7ea12ac168da84d2e8';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const NETFLIX_PROVIDER_ID = 8; // Netflix provider ID in TMDB

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
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function fetchNetflixMovies() {
  console.log('Fetching Netflix movies from TMDB (2000-2026)...');

  // Discover movies on Netflix Singapore (region=SG) from 2000-2026
  const endpoints = [];
  for (let page = 1; page <= 10; page++) {
    endpoints.push(
      `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_watch_providers=${NETFLIX_PROVIDER_ID}&watch_region=SG&primary_release_date.gte=2000-01-01&primary_release_date.lte=2026-12-31&sort_by=popularity.desc&page=${page}`
    );
  }

  const results = await Promise.all(endpoints.map(url => fetchJSON(url).catch(() => ({ results: [] }))));

  const allMovies = new Map();
  results.forEach(response => {
    response.results.forEach(movie => {
      // Only include movies from 2000-2026 with posters
      const year = movie.release_date ? parseInt(movie.release_date.split('-')[0]) : 0;
      if (year >= 2000 && year <= 2026 && movie.poster_path && !allMovies.has(movie.id)) {
        allMovies.set(movie.id, movie);
      }
    });
  });

  console.log(`Fetched ${allMovies.size} Netflix movies (2000-2026)`);
  return Array.from(allMovies.values());
}

async function fetchNetflixSeries() {
  console.log('Fetching Netflix TV series from TMDB (2000-2026)...');

  const endpoints = [];
  for (let page = 1; page <= 10; page++) {
    endpoints.push(
      `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_watch_providers=${NETFLIX_PROVIDER_ID}&watch_region=SG&first_air_date.gte=2000-01-01&first_air_date.lte=2026-12-31&sort_by=popularity.desc&page=${page}`
    );
  }

  const results = await Promise.all(endpoints.map(url => fetchJSON(url).catch(() => ({ results: [] }))));

  const allSeries = new Map();
  results.forEach(response => {
    response.results.forEach(series => {
      // Only include series from 2000-2026 with posters
      const year = series.first_air_date ? parseInt(series.first_air_date.split('-')[0]) : 0;
      if (year >= 2000 && year <= 2026 && series.poster_path && !allSeries.has(series.id)) {
        allSeries.set(series.id, series);
      }
    });
  });

  console.log(`Fetched ${allSeries.size} Netflix TV series (2000-2026)`);
  return Array.from(allSeries.values());
}

async function getMovieDetails(movieId) {
  const url = `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=credits`;
  try {
    return await fetchJSON(url);
  } catch (e) {
    console.error(`Failed to fetch details for movie ${movieId}:`, e.message);
    return null;
  }
}

async function getSeriesDetails(seriesId) {
  const url = `${BASE_URL}/tv/${seriesId}?api_key=${API_KEY}&append_to_response=credits`;
  try {
    return await fetchJSON(url);
  } catch (e) {
    console.error(`Failed to fetch details for series ${seriesId}:`, e.message);
    return null;
  }
}

/**
 * Determine Singapore content rating based on genres and TMDB rating
 * G = General, PG = Parental Guidance, PG13 = 13+, NC16 = 16+, M18 = 18+, R21 = 21+
 */
function determineContentRating(genres, voteAverage, overview = '') {
  const rating = voteAverage || 0;
  const desc = (overview || '').toLowerCase();

  // R21 - Restricted content
  if (genres.includes('Horror') && rating > 7.5) return 'R21';
  if (desc.includes('explicit') || desc.includes('graphic violence')) return 'R21';

  // M18 - Mature content
  if (genres.includes('Horror')) return 'M18';
  if (genres.includes('Thriller') && rating > 7.0) return 'M18';
  if (genres.includes('Crime') && rating > 7.0) return 'M18';
  if (desc.includes('violence') || desc.includes('mature')) return 'M18';

  // NC16 - No children under 16
  if (genres.includes('Thriller')) return 'NC16';
  if (genres.includes('Crime')) return 'NC16';
  if (genres.includes('Action') && rating > 7.0) return 'NC16';
  if (genres.includes('Mystery')) return 'NC16';

  // PG13 - Parental guidance for 13+
  if (genres.includes('Action')) return 'PG13';
  if (genres.includes('Sci-Fi')) return 'PG13';
  if (genres.includes('Adventure') && !genres.includes('Animation')) return 'PG13';

  // PG - Parental guidance
  if (genres.includes('Drama')) return 'PG';
  if (genres.includes('Romance')) return 'PG';
  if (genres.includes('Comedy') && !genres.includes('Animation')) return 'PG';

  // G - General (default for Animation and family content)
  if (genres.includes('Animation')) return 'G';

  // Default to PG for unknown
  return 'PG';
}

function processMovie(movie, details) {
  // Must have poster image
  if (!movie.poster_path) return null;

  const genres = movie.genre_ids
    .map(id => GENRE_MAP[id])
    .filter(Boolean)
    .slice(0, 3);

  if (genres.length === 0) return null;

  // Must have release year between 2000-2026
  const year = movie.release_date ? parseInt(movie.release_date.split('-')[0]) : 0;
  if (year < 2000 || year > 2026) return null;

  let runtime = details?.runtime || 120;
  if (runtime === 0 || !runtime) {
    runtime = 120;
    if (genres.includes('Animation')) runtime = 95;
    if (genres.includes('Action')) runtime = 135;
    if (genres.includes('Drama')) runtime = 145;
    runtime += Math.floor(Math.random() * 30) - 15;
  }

  const director = details?.credits?.crew?.find(p => p.job === 'Director')?.name || 'Unknown';
  const cast = details?.credits?.cast?.slice(0, 5).map(p => p.name) || [];
  const contentRating = determineContentRating(genres, movie.vote_average, movie.overview);

  return {
    id: `netflix-movie-${movie.id}`,
    title: movie.title,
    releaseYear: year,
    rating: Math.round((movie.vote_average / 2) * 10) / 10,
    genres: genres,
    runtime: runtime,
    description: movie.overview || 'No description available.',
    thumbnailUrl: `${IMAGE_BASE_URL}${movie.poster_path}`,
    director: director,
    cast: cast,
    contentRating: contentRating,
    type: 'movie',
    netflixId: movie.id,
  };
}

function processSeries(series, details) {
  // Must have poster image
  if (!series.poster_path) return null;

  const genres = series.genre_ids
    .map(id => GENRE_MAP[id])
    .filter(Boolean)
    .slice(0, 3);

  if (genres.length === 0) return null;

  // Must have release year between 2000-2026
  const year = series.first_air_date ? parseInt(series.first_air_date.split('-')[0]) : 0;
  if (year < 2000 || year > 2026) return null;

  // For series, use episode runtime or estimate
  let runtime = details?.episode_run_time?.[0] || 45;
  if (runtime === 0 || !runtime) {
    runtime = genres.includes('Comedy') ? 30 : 50;
  }

  const creator = details?.created_by?.[0]?.name || 'Unknown';
  const cast = details?.credits?.cast?.slice(0, 5).map(p => p.name) || [];
  const contentRating = determineContentRating(genres, series.vote_average, series.overview);

  return {
    id: `netflix-series-${series.id}`,
    title: series.name,
    releaseYear: year,
    rating: Math.round((series.vote_average / 2) * 10) / 10,
    genres: genres,
    runtime: runtime,
    description: series.overview || 'No description available.',
    thumbnailUrl: `${IMAGE_BASE_URL}${series.poster_path}`,
    director: creator,
    cast: cast,
    contentRating: contentRating,
    type: 'series',
    netflixId: series.id,
  };
}

async function main() {
  try {
    console.log('🎬 Fetching Netflix Singapore content...\n');

    // Fetch movies and series
    const [movies, series] = await Promise.all([
      fetchNetflixMovies(),
      fetchNetflixSeries(),
    ]);

    console.log(`\n📊 Processing ${movies.length} movies and ${series.length} series...`);

    // Process ALL movies with valid posters
    const processedMovies = [];
    let movieCount = 0;
    for (const movie of movies) {
      if (!movie.poster_path) continue; // Skip if no poster

      movieCount++;
      console.log(`Processing movie ${movieCount}/${movies.length}: ${movie.title}`);

      const details = await getMovieDetails(movie.id);
      const processed = processMovie(movie, details);
      if (processed && processed.thumbnailUrl) {
        processedMovies.push(processed);
      }

      // Rate limit - 250ms between requests
      await new Promise(resolve => setTimeout(resolve, 250));
    }

    // Process ALL series with valid posters
    const processedSeries = [];
    let seriesCount = 0;
    for (const s of series) {
      if (!s.poster_path) continue; // Skip if no poster

      seriesCount++;
      console.log(`Processing series ${seriesCount}/${series.length}: ${s.name}`);

      const details = await getSeriesDetails(s.id);
      const processed = processSeries(s, details);
      if (processed && processed.thumbnailUrl) {
        processedSeries.push(processed);
      }

      // Rate limit - 250ms between requests
      await new Promise(resolve => setTimeout(resolve, 250));
    }

    // Combine and shuffle
    const allContent = [...processedMovies, ...processedSeries];

    console.log(`\n✅ Processed:`);
    console.log(`   - ${processedMovies.length} movies`);
    console.log(`   - ${processedSeries.length} series`);
    console.log(`   - ${allContent.length} total items`);

    // Save to both src and public folders
    const srcOutputPath = path.join(__dirname, '../src/data/movies.json');
    const publicOutputPath = path.join(__dirname, '../public/data/movies.json');

    const jsonContent = JSON.stringify(allContent, null, 2);
    fs.writeFileSync(srcOutputPath, jsonContent);
    fs.writeFileSync(publicOutputPath, jsonContent);

    console.log(`\n💾 Saved to:`);
    console.log(`   - ${srcOutputPath}`);
    console.log(`   - ${publicOutputPath}`);
    console.log('\n📺 Sample content:');
    console.log(JSON.stringify(allContent.slice(0, 2), null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
