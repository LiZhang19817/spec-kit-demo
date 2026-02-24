/**
 * Unit tests for MovieStore
 * Tests movie store state management
 */

import { useMovieStore } from '@/store/movieStore';
import { Movie } from '@/types/movie';

// Mock fetch
global.fetch = jest.fn();

const mockMovies: Movie[] = [
  {
    id: 'movie-1',
    title: 'Test Movie 1',
    genres: ['Action'],
    releaseYear: 2020,
    rating: 4.5,
    thumbnailUrl: 'https://example.com/1.jpg',
    description: 'Description 1',
  },
  {
    id: 'movie-2',
    title: 'Test Movie 2',
    genres: ['Drama'],
    releaseYear: 2021,
    rating: 4.0,
    thumbnailUrl: 'https://example.com/2.jpg',
    description: 'Description 2',
  },
];

describe('MovieStore', () => {
  beforeEach(() => {
    // Reset store state
    useMovieStore.setState({
      movies: [],
      isLoading: false,
      error: null,
      lastFetched: null,
    });

    // Reset mocks
    (global.fetch as jest.Mock).mockReset();
  });

  describe('loadMovies', () => {
    it('should load movies successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMovies,
      });

      const { loadMovies } = useMovieStore.getState();
      await loadMovies();

      const state = useMovieStore.getState();
      expect(state.movies).toEqual(mockMovies);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.lastFetched).toBeGreaterThan(0);
    });

    it('should set loading state while fetching', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ ok: true, json: async () => [] }), 100)
          )
      );

      const { loadMovies } = useMovieStore.getState();
      const promise = loadMovies();

      expect(useMovieStore.getState().isLoading).toBe(true);

      await promise;

      expect(useMovieStore.getState().isLoading).toBe(false);
    });

    it('should handle HTTP errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const { loadMovies } = useMovieStore.getState();
      await loadMovies();

      const state = useMovieStore.getState();
      expect(state.movies).toEqual([]);
      expect(state.error).toContain('HTTP error');
      expect(state.isLoading).toBe(false);
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      const { loadMovies } = useMovieStore.getState();
      await loadMovies();

      const state = useMovieStore.getState();
      expect(state.movies).toEqual([]);
      expect(state.error).toBe('Network error');
      expect(state.isLoading).toBe(false);
    });

    it('should validate loaded movies', async () => {
      const invalidData = [
        mockMovies[0],
        { invalid: 'movie' },
        mockMovies[1],
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => invalidData,
      });

      const { loadMovies } = useMovieStore.getState();
      await loadMovies();

      const state = useMovieStore.getState();
      expect(state.movies).toHaveLength(2);
    });
  });

  describe('setMovies', () => {
    it('should set movies directly', () => {
      const { setMovies } = useMovieStore.getState();
      setMovies(mockMovies);

      const state = useMovieStore.getState();
      expect(state.movies).toEqual(mockMovies);
      expect(state.error).toBeNull();
      expect(state.lastFetched).toBeGreaterThan(0);
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      useMovieStore.setState({ error: 'Test error' });

      const { clearError } = useMovieStore.getState();
      clearError();

      expect(useMovieStore.getState().error).toBeNull();
    });
  });
});
