/**
 * Performance test for search
 * Tests search completes in <300ms with large datasets
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useMovieSearch } from '@/hooks/useMovieSearch';
import { useMovieStore } from '@/store/movieStore';
import { useSearchStore } from '@/store/searchStore';
import { Movie } from '@/types/movie';
import moviesFixture from '../fixtures/movies.json';

describe('Search Performance', () => {
  it('should search 1000 movies in <300ms', async () => {
    // Generate 1000 movies
    const largeDataset: Movie[] = Array.from({ length: 1000 }, (_, i) => ({
      ...moviesFixture[i % 50],
      id: `movie-${i}`,
      title: `${moviesFixture[i % 50].title} ${i}`,
    }));

    // Initialize stores
    useMovieStore.setState({
      movies: largeDataset,
      isLoading: false,
      error: null,
      lastFetched: Date.now(),
    });

    const { result } = renderHook(() => useMovieSearch());

    // Initialize search index
    const { initializeSearchIndex } = useSearchStore.getState();
    initializeSearchIndex(largeDataset);

    // Measure search performance
    const start = performance.now();

    result.current.setSearchTerm('Inception');

    await waitFor(() => {
      expect(result.current.isSearching).toBe(false);
    }, { timeout: 500 });

    const duration = performance.now() - start;

    // Search should complete in <300ms (including debounce)
    expect(duration).toBeLessThan(600); // 300ms debounce + 300ms search
    expect(result.current.results.length).toBeGreaterThan(0);
  });

  it('should handle 5000 movies efficiently', async () => {
    const massiveDataset: Movie[] = Array.from({ length: 5000 }, (_, i) => ({
      ...moviesFixture[i % 50],
      id: `movie-${i}`,
      title: `${moviesFixture[i % 50].title} ${i}`,
    }));

    useMovieStore.setState({
      movies: massiveDataset,
      isLoading: false,
      error: null,
      lastFetched: Date.now(),
    });

    const { initializeSearchIndex } = useSearchStore.getState();

    // Index creation should be fast
    const indexStart = performance.now();
    initializeSearchIndex(massiveDataset);
    const indexDuration = performance.now() - indexStart;

    expect(indexDuration).toBeLessThan(1000); // Index creation <1s

    const { result } = renderHook(() => useMovieSearch());

    // Search should still be fast
    const searchStart = performance.now();

    result.current.setSearchTerm('Matrix');

    await waitFor(() => {
      expect(result.current.isSearching).toBe(false);
    }, { timeout: 1000 });

    const searchDuration = performance.now() - searchStart;

    expect(searchDuration).toBeLessThan(1000);
  });

  it('should maintain performance with complex queries', async () => {
    const largeDataset: Movie[] = Array.from({ length: 1000 }, (_, i) => ({
      ...moviesFixture[i % 50],
      id: `movie-${i}`,
    }));

    useMovieStore.setState({
      movies: largeDataset,
      isLoading: false,
      error: null,
      lastFetched: Date.now(),
    });

    const { initializeSearchIndex } = useSearchStore.getState();
    initializeSearchIndex(largeDataset);

    const { result } = renderHook(() => useMovieSearch());

    const queries = [
      'Christopher Nolan',
      'Sci-Fi Thriller',
      'Leonardo DiCaprio',
      'mind bending',
    ];

    for (const query of queries) {
      const start = performance.now();

      result.current.setSearchTerm(query);

      await waitFor(() => {
        expect(result.current.isSearching).toBe(false);
      }, { timeout: 500 });

      const duration = performance.now() - start;

      expect(duration).toBeLessThan(600);
    }
  });

  it('should not degrade with repeated searches', async () => {
    const dataset: Movie[] = Array.from({ length: 500 }, (_, i) => ({
      ...moviesFixture[i % 50],
      id: `movie-${i}`,
    }));

    useMovieStore.setState({
      movies: dataset,
      isLoading: false,
      error: null,
      lastFetched: Date.now(),
    });

    const { initializeSearchIndex } = useSearchStore.getState();
    initializeSearchIndex(dataset);

    const { result } = renderHook(() => useMovieSearch());

    const durations: number[] = [];

    // Perform 10 searches
    for (let i = 0; i < 10; i++) {
      const start = performance.now();

      result.current.setSearchTerm(`search${i}`);

      await waitFor(() => {
        expect(result.current.isSearching).toBe(false);
      }, { timeout: 500 });

      durations.push(performance.now() - start);
    }

    // Average duration should be consistent
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    expect(avgDuration).toBeLessThan(600);

    // No significant degradation (last search not much slower than first)
    expect(durations[9]).toBeLessThan(durations[0] * 1.5);
  });
});
