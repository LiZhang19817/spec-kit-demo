/**
 * Unit tests for fuzzy search
 * Tests Fuse.js search configuration and performance
 */

import {
  FUSE_OPTIONS,
  createSearchIndex,
  searchMovies,
  getSearchResultCount,
  meaningfulSearchTokens,
  tokenMatchesAsWholeWord,
  normalizeForTitleMatch,
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
  {
    id: 'unspeakable-sins',
    title: 'Unspeakable Sins',
    genres: ['Drama'],
    releaseYear: 2020,
    rating: 3.5,
    thumbnailUrl: 'https://example.com/us.jpg',
    description: 'A crime drama.',
    director: 'Jane Doe',
    cast: ['Actor One'],
  },
  {
    id: 'prison-drama',
    title: 'The Prison',
    genres: ['Drama'],
    releaseYear: 2018,
    rating: 4.0,
    thumbnailUrl: 'https://example.com/p.jpg',
    description:
      'A correctional officer has an unspeakable urge to reconnect with his past.',
    director: 'John Smith',
    cast: ['Actor Two'],
  },
  {
    id: 'hit-squad',
    title: 'Hit Squad',
    genres: ['Action'],
    releaseYear: 2019,
    rating: 3.0,
    thumbnailUrl: 'https://example.com/hit.jpg',
    description: 'Elite assassins face unspeakable danger in this action film.',
    director: 'Alex Lee',
    cast: ['Actor Three'],
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
      expect(FUSE_OPTIONS.threshold).toBe(0.32);
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
      const results = searchMovies(index, mockMovies, 'Inception');
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Inception');
    });

    it('should find case-insensitive matches', () => {
      const results = searchMovies(index, mockMovies, 'inception');
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Inception');
    });

    it('should handle fuzzy matching with typos', () => {
      const results = searchMovies(index, mockMovies, 'Incepton');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].title).toBe('Inception');
    });

    it('should search across multiple fields', () => {
      const results = searchMovies(index, mockMovies, 'Nolan');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].director).toContain('Nolan');
    });

    it('should search in cast', () => {
      const results = searchMovies(index, mockMovies, 'DiCaprio');
      expect(results).toHaveLength(1);
      expect(results[0].cast).toContain('Leonardo DiCaprio');
    });

    it('should search in description', () => {
      const results = searchMovies(index, mockMovies, 'dreams');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].description).toContain('dreams');
    });

    it('should return empty array for short queries', () => {
      const results = searchMovies(index, mockMovies, 'a');
      expect(results).toEqual([]);
    });

    it('should return empty array for empty query', () => {
      const results = searchMovies(index, mockMovies, '');
      expect(results).toEqual([]);
    });

    it('should return empty array for whitespace-only query', () => {
      const results = searchMovies(index, mockMovies, '   ');
      expect(results).toEqual([]);
    });

    it('should rank exact title matches higher', () => {
      const results = searchMovies(index, mockMovies, 'Matrix');
      expect(results[0].title).toBe('The Matrix');
    });

    it('should require all meaningful tokens to match for multi-word queries', () => {
      const fullIndex = createSearchIndex(mockMovies);
      const results = searchMovies(fullIndex, mockMovies, 'unspeakable sins');
      expect(results.map((m) => m.id)).toEqual(['unspeakable-sins']);
    });

    it('should return only exact title matches when query matches a title (case/spacing)', () => {
      const fullIndex = createSearchIndex(mockMovies);
      expect(searchMovies(fullIndex, mockMovies, '  Unspeakable   Sins  ').map((m) => m.id)).toEqual([
        'unspeakable-sins',
      ]);
    });

    it('should return empty when movie list is empty (no fuzzy against stale index)', () => {
      const fullIndex = createSearchIndex(mockMovies);
      expect(searchMovies(fullIndex, [], 'unspeakable sins')).toEqual([]);
    });

    it('should still find "the matrix" when stop words are stripped for AND', () => {
      const fullIndex = createSearchIndex(mockMovies);
      const results = searchMovies(fullIndex, mockMovies, 'the matrix');
      expect(results.some((m) => m.title === 'The Matrix')).toBe(true);
    });
  });

  describe('normalizeForTitleMatch', () => {
    it('collapses whitespace and lowercases', () => {
      expect(normalizeForTitleMatch('  Foo   Bar  ')).toBe('foo bar');
    });
  });

  describe('tokenMatchesAsWholeWord', () => {
    it('does not match sins inside assassins', () => {
      expect(tokenMatchesAsWholeWord('elite assassins strike', 'sins')).toBe(false);
    });

    it('matches sins as a standalone word', () => {
      expect(tokenMatchesAsWholeWord('seven deadly sins', 'sins')).toBe(true);
    });
  });

  describe('meaningfulSearchTokens', () => {
    it('returns null for single-word queries', () => {
      expect(meaningfulSearchTokens('inception')).toBeNull();
    });

    it('returns two tokens when both are meaningful', () => {
      expect(meaningfulSearchTokens('unspeakable sins')).toEqual(['unspeakable', 'sins']);
    });

    it('returns null when only stop words plus one term (uses full phrase search)', () => {
      expect(meaningfulSearchTokens('the matrix')).toBeNull();
    });
  });

  describe('getSearchResultCount', () => {
    let index: ReturnType<typeof createSearchIndex>;

    beforeEach(() => {
      index = createSearchIndex(mockMovies);
    });

    it('should return correct count', () => {
      const count = getSearchResultCount(index, mockMovies, 'Sci-Fi');
      expect(count).toBeGreaterThan(0);
    });

    it('should return 0 for no matches', () => {
      const count = getSearchResultCount(index, mockMovies, 'xyz123notfound');
      expect(count).toBe(0);
    });

    it('should return 0 for short queries', () => {
      const count = getSearchResultCount(index, mockMovies, 'a');
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
      searchMovies(index, largeDataset, 'Inception');
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(300);
    });
  });
});
