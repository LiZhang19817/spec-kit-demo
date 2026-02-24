/**
 * useMovieSearch Hook
 * Custom hook for movie search with debouncing
 */

import { useState, useEffect, useMemo } from 'react';
import { useMovieStore } from '@/store/movieStore';
import { useSearchStore } from '@/store/searchStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useDebounce } from './useDebounce';
import { Movie } from '@/types/movie';

export interface UseMovieSearchResult {
  /** Current search term */
  searchTerm: string;

  /** Set search term */
  setSearchTerm: (term: string) => void;

  /** Clear search */
  clearSearch: () => void;

  /** Search results */
  results: Movie[];

  /** Whether search is in progress (debouncing) */
  isSearching: boolean;

  /** Number of results */
  resultCount: number;
}

/**
 * Hook for searching movies with debouncing
 */
export function useMovieSearch(): UseMovieSearchResult {
  const movies = useMovieStore((state) => state.movies);
  const setSearchTermStore = useSearchStore((state) => state.setSearchTerm);
  const applyFiltersAndSearch = useSearchStore((state) => state.applyFiltersAndSearch);
  const favorites = useFavoritesStore((state) => state.favorites);

  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search term (300ms)
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Update search store when debounced term changes
  useEffect(() => {
    if (searchTerm !== debouncedSearchTerm) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  }, [searchTerm, debouncedSearchTerm]);

  // Apply search and filters when debounced term changes
  useEffect(() => {
    setSearchTermStore(debouncedSearchTerm);
    applyFiltersAndSearch(movies, favorites);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm]);

  const filteredMovies = useSearchStore((state) => state.filteredMovies);

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    setSearchTermStore('');
    applyFiltersAndSearch(movies, favorites);
  };

  // Get results
  const results = useMemo(() => {
    return filteredMovies.length > 0 || debouncedSearchTerm ? filteredMovies : movies;
  }, [filteredMovies, movies, debouncedSearchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    clearSearch,
    results,
    isSearching,
    resultCount: results.length,
  };
}
