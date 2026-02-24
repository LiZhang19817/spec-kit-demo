/**
 * Data validation utilities
 * Validators for runtime data validation
 */

import { Movie, Genre, isMovie, isGenre } from '@/types/movie';

/**
 * Validate movie array from API/file
 */
export function validateMovieArray(data: unknown): Movie[] {
  if (!Array.isArray(data)) {
    throw new Error('Movie data must be an array');
  }

  const movies: Movie[] = [];
  const errors: string[] = [];

  data.forEach((item, index) => {
    if (isMovie(item)) {
      // Additional validation
      if (item.rating < 0 || item.rating > 5) {
        errors.push(`Movie ${index}: Invalid rating ${item.rating}`);
        return;
      }

      if (item.releaseYear < 1888 || item.releaseYear > new Date().getFullYear()) {
        errors.push(`Movie ${index}: Invalid year ${item.releaseYear}`);
        return;
      }

      movies.push(item);
    } else {
      errors.push(`Movie ${index}: Invalid movie object`);
    }
  });

  if (errors.length > 0) {
    console.warn('Movie validation warnings:', errors);
  }

  return movies;
}

/**
 * Validate single movie object
 */
export function validateMovie(data: unknown): Movie {
  if (!isMovie(data)) {
    throw new Error('Invalid movie object');
  }

  if (data.rating < 0 || data.rating > 5) {
    throw new Error(`Invalid rating: ${data.rating}`);
  }

  if (data.releaseYear < 1888 || data.releaseYear > new Date().getFullYear()) {
    throw new Error(`Invalid release year: ${data.releaseYear}`);
  }

  return data;
}

/**
 * Validate genre value
 */
export function validateGenre(value: unknown): Genre {
  if (!isGenre(value)) {
    throw new Error(`Invalid genre: ${String(value)}`);
  }
  return value;
}

/**
 * Validate year range
 */
export function validateYearRange(min?: number, max?: number): boolean {
  const currentYear = new Date().getFullYear();

  if (min !== undefined && (min < 1888 || min > currentYear)) {
    return false;
  }

  if (max !== undefined && (max < 1888 || max > currentYear)) {
    return false;
  }

  if (min !== undefined && max !== undefined && min > max) {
    return false;
  }

  return true;
}

/**
 * Validate rating range
 */
export function validateRatingRange(min?: number, max?: number): boolean {
  if (min !== undefined && (min < 0 || min > 5)) {
    return false;
  }

  if (max !== undefined && (max < 0 || max > 5)) {
    return false;
  }

  if (min !== undefined && max !== undefined && min > max) {
    return false;
  }

  return true;
}

/**
 * Validate runtime range
 */
export function validateRuntimeRange(min?: number, max?: number): boolean {
  if (min !== undefined && min < 0) {
    return false;
  }

  if (max !== undefined && max < 0) {
    return false;
  }

  if (min !== undefined && max !== undefined && min > max) {
    return false;
  }

  return true;
}

/**
 * Sanitize search term
 */
export function sanitizeSearchTerm(term: string): string {
  return term.trim().slice(0, 100);
}
