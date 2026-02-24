/**
 * Unit tests for SearchStore
 * Tests search store state management
 */

import { useSearchStore } from '@/store/searchStore';
import { createSearchIndex } from '@/lib/fuzzySearch';
import { Movie } from '@/types/movie';

const mockMovies: Movie[] = [
  {
    id: 'inception-2010',
    title: 'Inception',
    genres: ['Sci-Fi', 'Thriller'],
    releaseYear: 2010,
    rating: 4.5,
    thumbnailUrl: 'https://example.com/1.jpg',
    description: 'A mind-bending thriller',
  },
  {
    id: 'matrix-1999',
    title: 'The Matrix',
    genres: ['Sci-Fi', 'Action'],
    releaseYear: 1999,
    rating: 4.5,
    thumbnailUrl: 'https://example.com/2.jpg',
    description: 'A hacker discovers reality',
  },
  {
    id: 'godfather-1972',
    title: 'The Godfather',
    genres: ['Crime', 'Drama'],
    releaseYear: 1972,
    rating: 5.0,
    thumbnailUrl: 'https://example.com/3.jpg',
    description: 'The aging patriarch',
  },
];

describe('SearchStore', () => {
  beforeEach(() => {
    useSearchStore.setState({
      searchTerm: '',
      filters: { genres: [], showFavoritesOnly: false },
      sort: { field: 'title', order: 'asc' },
      searchIndex: null,
      filteredMovies: [],
    });
  });

  describe('setSearchTerm', () => {
    it('should update search term', () => {
      const { setSearchTerm } = useSearchStore.getState();
      setSearchTerm('Inception');

      expect(useSearchStore.getState().searchTerm).toBe('Inception');
    });
  });

  describe('initializeSearchIndex', () => {
    it('should create search index', () => {
      const { initializeSearchIndex } = useSearchStore.getState();
      initializeSearchIndex(mockMovies);

      const { searchIndex } = useSearchStore.getState();
      expect(searchIndex).toBeDefined();
      expect(searchIndex?.search).toBeDefined();
    });
  });

  describe('applyFiltersAndSearch', () => {
    beforeEach(() => {
      const index = createSearchIndex(mockMovies);
      useSearchStore.setState({ searchIndex: index });
    });

    it('should return all movies when no search term', () => {
      const { applyFiltersAndSearch } = useSearchStore.getState();
      applyFiltersAndSearch(mockMovies, new Set());

      const { filteredMovies } = useSearchStore.getState();
      expect(filteredMovies).toHaveLength(3);
    });

    it('should filter movies by search term', () => {
      const { setSearchTerm, applyFiltersAndSearch } = useSearchStore.getState();

      setSearchTerm('Inception');
      applyFiltersAndSearch(mockMovies, new Set());

      const { filteredMovies } = useSearchStore.getState();
      expect(filteredMovies.length).toBeGreaterThan(0);
      expect(filteredMovies[0].title).toBe('Inception');
    });

    it('should handle fuzzy search with typos', () => {
      const { setSearchTerm, applyFiltersAndSearch } = useSearchStore.getState();

      setSearchTerm('Incepton');
      applyFiltersAndSearch(mockMovies, new Set());

      const { filteredMovies } = useSearchStore.getState();
      expect(filteredMovies.length).toBeGreaterThan(0);
    });

    it('should combine search with genre filters', () => {
      const { setSearchTerm, setFilters, applyFiltersAndSearch } = useSearchStore.getState();

      setSearchTerm('Sci');
      setFilters({ genres: ['Sci-Fi'] });
      applyFiltersAndSearch(mockMovies, new Set());

      const { filteredMovies } = useSearchStore.getState();
      filteredMovies.forEach(movie => {
        expect(movie.genres).toContain('Sci-Fi');
      });
    });

    it('should sort results', () => {
      const { setSort, applyFiltersAndSearch } = useSearchStore.getState();

      setSort({ field: 'releaseYear', order: 'desc' });
      applyFiltersAndSearch(mockMovies, new Set());

      const { filteredMovies } = useSearchStore.getState();
      expect(filteredMovies[0].releaseYear).toBeGreaterThanOrEqual(
        filteredMovies[filteredMovies.length - 1].releaseYear
      );
    });

    it('should filter by favorites', () => {
      const { setFilters, applyFiltersAndSearch } = useSearchStore.getState();
      const favorites = new Set(['inception-2010']);

      setFilters({ showFavoritesOnly: true });
      applyFiltersAndSearch(mockMovies, favorites);

      const { filteredMovies } = useSearchStore.getState();
      expect(filteredMovies).toHaveLength(1);
      expect(filteredMovies[0].id).toBe('inception-2010');
    });
  });

  describe('resetFilters', () => {
    it('should reset filters and search term', () => {
      const { setSearchTerm, setFilters, resetFilters } = useSearchStore.getState();

      setSearchTerm('test');
      setFilters({ genres: ['Action'] });

      resetFilters();

      const state = useSearchStore.getState();
      expect(state.searchTerm).toBe('');
      expect(state.filters.genres).toEqual([]);
    });
  });
});
