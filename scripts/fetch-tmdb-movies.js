/**
 * Fetch real movie data from The Movie Database (TMDB) API
 * This script fetches popular, top-rated, and trending movies with images
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

async function fetchMovies() {
  console.log('Fetching movies from TMDB...');

  const endpoints = [
    `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=1`,
    `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=2`,
    `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&page=1`,
    `${BASE_URL}/trending/movie/week?api_key=${API_KEY}`,
    `${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=vote_average.desc&vote_count.gte=1000&page=1`,
  ];

  const results = await Promise.all(endpoints.map(url => fetchJSON(url)));

  const allMovies = new Map();

  results.forEach(response => {
    response.results.forEach(movie => {
      if (!allMovies.has(movie.id)) {
        allMovies.set(movie.id, movie);
      }
    });
  });

  console.log(`Fetched ${allMovies.size} unique movies`);

  const movies = Array.from(allMovies.values()).map((movie, index) => {
    const genres = movie.genre_ids
      .map(id => GENRE_MAP[id])
      .filter(Boolean)
      .slice(0, 3); // Max 3 genres per movie

    if (genres.length === 0) return null;

    // Generate realistic runtime based on genres
    let runtime = 120;
    if (genres.includes('Animation')) runtime = 95;
    if (genres.includes('Action')) runtime = 135;
    if (genres.includes('Drama')) runtime = 145;

    // Add some variation
    runtime += Math.floor(Math.random() * 30) - 15;

    return {
      id: `tmdb-${movie.id}`,
      title: movie.title,
      releaseYear: movie.release_date ? parseInt(movie.release_date.split('-')[0]) : 2024,
      rating: Math.round((movie.vote_average / 2) * 10) / 10, // Convert 0-10 to 0-5 scale
      genres: genres,
      runtime: runtime,
      description: movie.overview || 'No description available.',
      thumbnailUrl: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : null,
      director: 'Unknown', // TMDB list endpoint doesn't include director
      cast: [], // Would need individual movie requests
    };
  }).filter(movie => movie !== null && movie.thumbnailUrl !== null);

  console.log(`Processed ${movies.length} movies with posters`);

  return movies.slice(0, 100); // Limit to 100 movies
}

async function main() {
  try {
    const movies = await fetchMovies();

    const outputPath = path.join(__dirname, '../src/data/movies.json');
    fs.writeFileSync(outputPath, JSON.stringify(movies, null, 2));

    console.log(`✅ Successfully wrote ${movies.length} movies to ${outputPath}`);
    console.log('Sample movie:', JSON.stringify(movies[0], null, 2));
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
