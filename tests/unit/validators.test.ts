/**
 * Unit tests for data validators
 * Tests movie data validation logic
 */

import {
  validateMovieArray,
  validateMovie,
  validateGenre,
  validateYearRange,
  validateRatingRange,
  validateRuntimeRange,
  sanitizeSearchTerm,
} from '@/lib/validators';
import { Movie } from '@/types/movie';

describe('validators', () => {
  const validMovie: Movie = {
    id: 'test-movie-2020',
    title: 'Test Movie',
    genres: ['Action', 'Drama'],
    releaseYear: 2020,
    rating: 4.5,
    thumbnailUrl: 'https://example.com/poster.jpg',
    description: 'A test movie description',
    runtime: 120,
    director: 'Test Director',
    cast: ['Actor 1', 'Actor 2'],
  };

  describe('validateMovieArray', () => {
    it('should validate array of valid movies', () => {
      const movies = validateMovieArray([validMovie]);
      expect(movies).toHaveLength(1);
      expect(movies[0]).toEqual(validMovie);
    });

    it('should filter out invalid movies', () => {
      const movies = validateMovieArray([
        validMovie,
        { invalid: 'data' },
        validMovie,
      ]);
      expect(movies).toHaveLength(2);
    });

    it('should throw error for non-array input', () => {
      expect(() => validateMovieArray('not an array')).toThrow();
    });

    it('should reject movies with invalid rating', () => {
      const invalidMovie = { ...validMovie, rating: 6 };
      const movies = validateMovieArray([invalidMovie]);
      expect(movies).toHaveLength(0);
    });

    it('should reject movies with invalid year', () => {
      const invalidMovie = { ...validMovie, releaseYear: 1800 };
      const movies = validateMovieArray([invalidMovie]);
      expect(movies).toHaveLength(0);
    });
  });

  describe('validateMovie', () => {
    it('should validate a valid movie', () => {
      const result = validateMovie(validMovie);
      expect(result).toEqual(validMovie);
    });

    it('should throw for invalid movie object', () => {
      expect(() => validateMovie({ invalid: 'data' })).toThrow();
    });

    it('should throw for rating out of range', () => {
      const invalid = { ...validMovie, rating: -1 };
      expect(() => validateMovie(invalid)).toThrow('Invalid rating');
    });

    it('should throw for year out of range', () => {
      const invalid = { ...validMovie, releaseYear: 2100 };
      expect(() => validateMovie(invalid)).toThrow('Invalid release year');
    });
  });

  describe('validateGenre', () => {
    it('should validate valid genre', () => {
      expect(validateGenre('Action')).toBe('Action');
      expect(validateGenre('Sci-Fi')).toBe('Sci-Fi');
    });

    it('should throw for invalid genre', () => {
      expect(() => validateGenre('InvalidGenre')).toThrow();
    });
  });

  describe('validateYearRange', () => {
    it('should validate valid year range', () => {
      expect(validateYearRange(1990, 2020)).toBe(true);
    });

    it('should reject min > max', () => {
      expect(validateYearRange(2020, 1990)).toBe(false);
    });

    it('should reject years before 1888', () => {
      expect(validateYearRange(1800)).toBe(false);
    });

    it('should reject future years', () => {
      expect(validateYearRange(undefined, 2100)).toBe(false);
    });
  });

  describe('validateRatingRange', () => {
    it('should validate valid rating range', () => {
      expect(validateRatingRange(0, 5)).toBe(true);
      expect(validateRatingRange(2.5, 4.5)).toBe(true);
    });

    it('should reject min > max', () => {
      expect(validateRatingRange(4, 2)).toBe(false);
    });

    it('should reject negative ratings', () => {
      expect(validateRatingRange(-1)).toBe(false);
    });

    it('should reject ratings > 5', () => {
      expect(validateRatingRange(undefined, 6)).toBe(false);
    });
  });

  describe('validateRuntimeRange', () => {
    it('should validate valid runtime range', () => {
      expect(validateRuntimeRange(60, 180)).toBe(true);
    });

    it('should reject min > max', () => {
      expect(validateRuntimeRange(180, 60)).toBe(false);
    });

    it('should reject negative runtime', () => {
      expect(validateRuntimeRange(-10)).toBe(false);
    });
  });

  describe('sanitizeSearchTerm', () => {
    it('should trim whitespace', () => {
      expect(sanitizeSearchTerm('  test  ')).toBe('test');
    });

    it('should limit length to 100 characters', () => {
      const longString = 'a'.repeat(150);
      expect(sanitizeSearchTerm(longString)).toHaveLength(100);
    });

    it('should handle empty string', () => {
      expect(sanitizeSearchTerm('')).toBe('');
    });
  });
});
