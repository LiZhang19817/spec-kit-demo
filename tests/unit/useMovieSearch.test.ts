/**
 * Unit tests for useMovieSearch hook
 * Tests search hook with debouncing
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useMovieSearch } from '@/hooks/useMovieSearch';
import { useMovieStore } from '@/store/movieStore';
import { useSearchStore } from '@/store/searchStore';
import { Movie } from '@/types/movie';

const mockMovies: Movie[] = [
  {
    id: 'movie-1',
    title: 'Inception',
    genres: ['Sci-Fi'],
    releaseYear: 2010,
    rating: 4.5,
    thumbnailUrl: 'https://example.com/1.jpg',
    description: 'Description',
  },
  {
    id: 'movie-2',
    title: 'The Matrix',
    genres: ['Sci-Fi'],
    releaseYear: 1999,
    rating: 4.5,
    thumbnailUrl: 'https://example.com/2.jpg',
    description: 'Description',
  },
];

describe('useMovieSearch', () => {
  beforeEach(() => {
    // Reset stores
    useMovieStore.setState({ movies: mockMovies, isLoading: false, error: null, lastFetched: Date.now() });
    useSearchStore.setState({
      searchTerm: '',
      filters: { genres: [], showFavoritesOnly: false },
      sort: { field: 'title', order: 'asc' },
      searchIndex: null,
      filteredMovies: [],
    });
  });

  it('should initialize with empty search term', () => {
    const { result } = renderHook(() => useMovieSearch());

    expect(result.current.searchTerm).toBe('');
    expect(result.current.results).toEqual(mockMovies);
  });

  it('should update search term', () => {
    const { result } = renderHook(() => useMovieSearch());

    act(() => {
      result.current.setSearchTerm('Inception');
    });

    expect(result.current.searchTerm).toBe('Inception');
  });

  it('should debounce search updates', async () => {
    const { result } = renderHook(() => useMovieSearch());

    act(() => {
      result.current.setSearchTerm('Inc');
    });

    // Search should not execute immediately
    expect(result.current.isSearching).toBe(true);

    // Wait for debounce
    await waitFor(() => {
      expect(result.current.isSearching).toBe(false);
    }, { timeout: 400 });
  });

  it('should clear search', () => {
    const { result } = renderHook(() => useMovieSearch());

    act(() => {
      result.current.setSearchTerm('test');
    });

    act(() => {
      result.current.clearSearch();
    });

    expect(result.current.searchTerm).toBe('');
  });

  it('should return all movies when search is empty', () => {
    const { result } = renderHook(() => useMovieSearch());

    expect(result.current.results).toEqual(mockMovies);
  });

  it('should handle multiple rapid changes', async () => {
    const { result } = renderHook(() => useMovieSearch());

    act(() => {
      result.current.setSearchTerm('I');
    });

    act(() => {
      result.current.setSearchTerm('In');
    });

    act(() => {
      result.current.setSearchTerm('Inc');
    });

    // Should only search once after debounce
    await waitFor(() => {
      expect(result.current.isSearching).toBe(false);
    }, { timeout: 400 });
  });
});
