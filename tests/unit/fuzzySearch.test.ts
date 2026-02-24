/**
 * Unit tests for fuzzy search
 * Tests Fuse.js search configuration and performance
 */

import {
  FUSE_OPTIONS,
  createSearchIndex,
  searchMovies,
  getSearchResultCount,
} from '@/lib/fuzzySearch';
import { Movie } from '@/types/movie';

const mockMovies: Movie[] = [
  {
    id: 'inception-2010',
    title: 'Inception',
    genres: ['Sci-Fi', 'Thriller'],
    releaseYear: 2010,
    rating: 4.5,
    thumbnailUrl: 'https://example.com/inception.jpg',
    description: 'A mind-bending thriller about dreams',
    director: 'Christopher Nolan',
    cast: ['Leonardo DiCaprio'],
  },
  {
    id: 'matrix-1999',
    title: 'The Matrix',
    genres: ['Sci-Fi', 'Action'],
    releaseYear: 1999,
    rating: 4.5,
    thumbnailUrl: 'https://example.com/matrix.jpg',
    description: 'A computer hacker discovers reality',
    director: 'Wachowski Sisters',
    cast: ['Keanu Reeves'],
  },
  {
    id: 'godfather-1972',
    title: 'The Godfather',
    genres: ['Crime', 'Drama'],
    releaseYear: 1972,
    rating: 5.0,
    thumbnailUrl: 'https://example.com/godfather.jpg',
    description: 'The aging patriarch of a crime dynasty',
    director: 'Francis Ford Coppola',
    cast: ['Marlon Brando', 'Al Pacino'],
  },
];

describe('fuzzySearch', () => {
  describe('FUSE_OPTIONS', () => {
    it('should have correct search keys', () => {
      expect(FUSE_OPTIONS.keys).toBeDefined();
      expect(FUSE_OPTIONS.keys).toHaveLength(5);
    });

    it('should prioritize title searches', () => {
      const titleKey = FUSE_OPTIONS.keys.find(
        (k) => 'name' in k && k.name === 'title'
      );
      expect(titleKey).toBeDefined();
      if (titleKey && 'weight' in titleKey) {
        expect(titleKey.weight).toBe(0.4);
      }
    });

    it('should have threshold for fuzzy matching', () => {
      expect(FUSE_OPTIONS.threshold).toBe(0.4);
    });

    it('should include scores in results', () => {
      expect(FUSE_OPTIONS.includeScore).toBe(true);
    });
  });

  describe('createSearchIndex', () => {
    it('should create a Fuse instance', () => {
      const index = createSearchIndex(mockMovies);
      expect(index).toBeDefined();
      expect(index.search).toBeDefined();
    });

    it('should handle empty movie array', () => {
      const index = createSearchIndex([]);
      expect(index).toBeDefined();
    });
  });

  describe('searchMovies', () => {
    let index: ReturnType<typeof createSearchIndex>;

    beforeEach(() => {
      index = createSearchIndex(mockMovies);
    });

    it('should find exact matches', () => {
      const results = searchMovies(index, 'Inception');
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Inception');
    });

    it('should find case-insensitive matches', () => {
      const results = searchMovies(index, 'inception');
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Inception');
    });

    it('should handle fuzzy matching with typos', () => {
      const results = searchMovies(index, 'Incepton');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].title).toBe('Inception');
    });

    it('should search across multiple fields', () => {
      const results = searchMovies(index, 'Nolan');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].director).toContain('Nolan');
    });

    it('should search in cast', () => {
      const results = searchMovies(index, 'DiCaprio');
      expect(results).toHaveLength(1);
      expect(results[0].cast).toContain('Leonardo DiCaprio');
    });

    it('should search in description', () => {
      const results = searchMovies(index, 'dreams');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].description).toContain('dreams');
    });

    it('should return empty array for short queries', () => {
      const results = searchMovies(index, 'a');
      expect(results).toEqual([]);
    });

    it('should return empty array for empty query', () => {
      const results = searchMovies(index, '');
      expect(results).toEqual([]);
    });

    it('should return empty array for whitespace-only query', () => {
      const results = searchMovies(index, '   ');
      expect(results).toEqual([]);
    });

    it('should rank exact title matches higher', () => {
      const results = searchMovies(index, 'Matrix');
      expect(results[0].title).toBe('The Matrix');
    });
  });

  describe('getSearchResultCount', () => {
    let index: ReturnType<typeof createSearchIndex>;

    beforeEach(() => {
      index = createSearchIndex(mockMovies);
    });

    it('should return correct count', () => {
      const count = getSearchResultCount(index, 'Sci-Fi');
      expect(count).toBeGreaterThan(0);
    });

    it('should return 0 for no matches', () => {
      const count = getSearchResultCount(index, 'xyz123notfound');
      expect(count).toBe(0);
    });

    it('should return 0 for short queries', () => {
      const count = getSearchResultCount(index, 'a');
      expect(count).toBe(0);
    });
  });

  describe('search performance', () => {
    it('should search 1000 movies in <300ms', () => {
      const largeDataset: Movie[] = Array.from({ length: 1000 }, (_, i) => ({
        ...mockMovies[i % 3],
        id: `movie-${i}`,
        title: `${mockMovies[i % 3].title} ${i}`,
      }));

      const index = createSearchIndex(largeDataset);

      const start = performance.now();
      searchMovies(index, 'Inception');
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(300);
    });
  });
});
