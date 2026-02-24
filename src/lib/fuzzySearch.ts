/**
 * Fuzzy search configuration
 * Fuse.js configuration for movie search
 */

import Fuse from 'fuse.js';
import { Movie } from '@/types/movie';

/**
 * Fuse.js options for movie search
 * Configured for <300ms response time per constitution
 */
export const FUSE_OPTIONS = {
  // Fields to search (weighted by importance)
  keys: [
    {
      name: 'title',
      weight: 0.4,
    },
    {
      name: 'director',
      weight: 0.2,
    },
    {
      name: 'cast',
      weight: 0.2,
    },
    {
      name: 'description',
      weight: 0.1,
    },
    {
      name: 'genres',
      weight: 0.1,
    },
  ],

  // Fuzzy matching threshold (0.0 = exact, 1.0 = match anything)
  threshold: 0.4,

  // Search algorithm location
  location: 0,

  // How far to search from location
  distance: 100,

  // Minimum character length before searching
  minMatchCharLength: 2,

  // Include score in results
  includeScore: true,

  // Include matched indices
  includeMatches: false,

  // Case sensitivity
  isCaseSensitive: false,

  // Use extended search
  useExtendedSearch: false,

  // Ignore field length when scoring
  ignoreLocation: true,

  // Field length norm
  fieldNormWeight: 1,
};

/**
 * Create a new Fuse instance with movie data
 */
export function createSearchIndex(movies: Movie[]): Fuse<Movie> {
  return new Fuse(movies, FUSE_OPTIONS);
}

/**
 * Search movies with fuzzy matching
 */
export function searchMovies(fuse: Fuse<Movie>, term: string): Movie[] {
  if (!term || term.trim().length < 2) {
    return [];
  }

  const results = fuse.search(term.trim());
  return results.map((result) => result.item);
}

/**
 * Get search result count
 */
export function getSearchResultCount(fuse: Fuse<Movie>, term: string): number {
  if (!term || term.trim().length < 2) {
    return 0;
  }

  return fuse.search(term.trim()).length;
}
