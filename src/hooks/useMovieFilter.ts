/**
 * useMovieFilter Hook
 * Manages movie filtering logic with combined filters
 */

import { useState, useMemo } from 'react';
import { Movie, Genre } from '@/types/movie';
import { FilterCriteria } from '@/types/filters';

export interface ActiveFilter {
  type: 'genre' | 'year' | 'rating' | 'runtime';
  label: string;
}

export interface UseMovieFilterResult {
  filteredMovies: Movie[];
  activeFilters: ActiveFilter[];
  setGenreFilter: (genres: Genre[]) => void;
  setYearRange: (minYear: number, maxYear: number) => void;
  setMinRating: (rating: number | null) => void;
  setMinRuntime: (runtime: number | null) => void;
  setMaxRuntime: (runtime: number | null) => void;
  clearAllFilters: () => void;
}

/**
 * Custom hook for filtering movies
 */
export function useMovieFilter(movies: Movie[]): UseMovieFilterResult {
  const [filters, setFilters] = useState<FilterCriteria>({
    genres: [],
    contentRatings: [],
    minYear: undefined,
    maxYear: undefined,
    minRating: undefined,
    maxRating: undefined,
    minRuntime: undefined,
    maxRuntime: undefined,
    showFavoritesOnly: false,
  });

  // Filter movies based on criteria
  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
      // Genre filter (OR logic - movie matches if it has ANY selected genre)
      if (filters.genres.length > 0) {
        const hasGenre = movie.genres.some((genre) => filters.genres.includes(genre));
        if (!hasGenre) return false;
      }

      // Year range filter
      if (filters.minYear !== undefined && movie.releaseYear < filters.minYear) {
        return false;
      }
      if (filters.maxYear !== undefined && movie.releaseYear > filters.maxYear) {
        return false;
      }

      // Rating filter
      if (filters.minRating !== undefined && movie.rating < filters.minRating) {
        return false;
      }
      if (filters.maxRating !== undefined && movie.rating > filters.maxRating) {
        return false;
      }

      // Runtime filter
      if (filters.minRuntime !== undefined) {
        if (!movie.runtime || movie.runtime < filters.minRuntime) {
          return false;
        }
      }
      if (filters.maxRuntime !== undefined) {
        if (!movie.runtime || movie.runtime > filters.maxRuntime) {
          return false;
        }
      }

      return true;
    });
  }, [movies, filters]);

  // Calculate active filters for display
  const activeFilters = useMemo(() => {
    const active: ActiveFilter[] = [];

    if (filters.genres.length > 0) {
      active.push({
        type: 'genre',
        label: filters.genres.join(', '),
      });
    }

    if (filters.minYear !== undefined || filters.maxYear !== undefined) {
      const min = filters.minYear ?? 'Any';
      const max = filters.maxYear ?? 'Any';
      active.push({
        type: 'year',
        label: `${min} - ${max}`,
      });
    }

    if (filters.minRating !== undefined) {
      active.push({
        type: 'rating',
        label: `${filters.minRating.toFixed(1)}+`,
      });
    }

    if (filters.minRuntime !== undefined || filters.maxRuntime !== undefined) {
      const min = filters.minRuntime ?? 'Any';
      const max = filters.maxRuntime ?? 'Any';
      active.push({
        type: 'runtime',
        label: `${min} - ${max} min`,
      });
    }

    return active;
  }, [filters]);

  // Filter setters
  const setGenreFilter = (genres: Genre[]) => {
    setFilters((prev) => ({ ...prev, genres }));
  };

  const setYearRange = (minYear: number, maxYear: number) => {
    setFilters((prev) => ({ ...prev, minYear, maxYear }));
  };

  const setMinRating = (rating: number | null) => {
    setFilters((prev) => ({
      ...prev,
      minRating: rating ?? undefined,
    }));
  };

  const setMinRuntime = (runtime: number | null) => {
    setFilters((prev) => ({
      ...prev,
      minRuntime: runtime ?? undefined,
    }));
  };

  const setMaxRuntime = (runtime: number | null) => {
    setFilters((prev) => ({
      ...prev,
      maxRuntime: runtime ?? undefined,
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      genres: [],
      contentRatings: [],
      minYear: undefined,
      maxYear: undefined,
      minRating: undefined,
      maxRating: undefined,
      minRuntime: undefined,
      maxRuntime: undefined,
      showFavoritesOnly: false,
    });
  };

  return {
    filteredMovies,
    activeFilters,
    setGenreFilter,
    setYearRange,
    setMinRating,
    setMinRuntime,
    setMaxRuntime,
    clearAllFilters,
  };
}
