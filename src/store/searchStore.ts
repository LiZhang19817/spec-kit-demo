/**
 * Search Store
 * Zustand store for search and filter state management
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import Fuse from 'fuse.js';
import { Movie } from '@/types/movie';
import { FilterCriteria, DEFAULT_FILTERS, SortConfig } from '@/types/filters';
import { createSearchIndex, searchMovies } from '@/lib/fuzzySearch';

/**
 * Search store state
 */
interface SearchState {
  /** Current search term */
  searchTerm: string;

  /** Active filter criteria */
  filters: FilterCriteria;

  /** Sort configuration */
  sort: SortConfig;

  /** Fuse.js search index */
  searchIndex: Fuse<Movie> | null;

  /** Filtered and sorted movies */
  filteredMovies: Movie[];

  /** Actions */
  setSearchTerm: (term: string) => void;
  setFilters: (filters: Partial<FilterCriteria>) => void;
  setSort: (sort: SortConfig) => void;
  resetFilters: () => void;
  initializeSearchIndex: (movies: Movie[]) => void;
  applyFiltersAndSearch: (allMovies: Movie[], favorites: Set<string>) => void;
}

/**
 * Filter movies by criteria
 */
function filterMovies(movies: Movie[], filters: FilterCriteria, favorites: Set<string>): Movie[] {
  return movies.filter((movie) => {
    // Filter by favorites
    if (filters.showFavoritesOnly && !favorites.has(movie.id)) {
      return false;
    }

    // Filter by genres (empty array = show all genres)
    if (filters.genres.length > 0) {
      const hasMatchingGenre = filters.genres.some((genre) => movie.genres.includes(genre));
      if (!hasMatchingGenre) {
        return false;
      }
    }

    // Filter by year range
    if (filters.minYear && movie.releaseYear < filters.minYear) {
      return false;
    }
    if (filters.maxYear && movie.releaseYear > filters.maxYear) {
      return false;
    }

    // Filter by rating range
    if (filters.minRating && movie.rating < filters.minRating) {
      return false;
    }
    if (filters.maxRating && movie.rating > filters.maxRating) {
      return false;
    }

    // Filter by runtime range
    if (filters.minRuntime && (!movie.runtime || movie.runtime < filters.minRuntime)) {
      return false;
    }
    if (filters.maxRuntime && (!movie.runtime || movie.runtime > filters.maxRuntime)) {
      return false;
    }

    // Filter by content ratings (empty array = show all ratings)
    if (filters.contentRatings.length > 0) {
      if (!movie.contentRating || !filters.contentRatings.includes(movie.contentRating)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Sort movies by configuration
 */
function sortMovies(movies: Movie[], sort: SortConfig): Movie[] {
  const sorted = [...movies];

  sorted.sort((a, b) => {
    let comparison = 0;

    switch (sort.field) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'releaseYear':
        comparison = a.releaseYear - b.releaseYear;
        break;
      case 'rating':
        comparison = a.rating - b.rating;
        break;
      case 'runtime':
        comparison = (a.runtime || 0) - (b.runtime || 0);
        break;
    }

    return sort.order === 'asc' ? comparison : -comparison;
  });

  return sorted;
}

/**
 * Search store implementation
 */
export const useSearchStore = create<SearchState>()(
  devtools(
    (set, get) => ({
      searchTerm: '',
      filters: DEFAULT_FILTERS,
      sort: { field: 'releaseYear', order: 'desc' },
      searchIndex: null,
      filteredMovies: [],

      setSearchTerm: (term: string) => {
        set({ searchTerm: term });
      },

      setFilters: (newFilters: Partial<FilterCriteria>) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        }));
      },

      setSort: (sort: SortConfig) => {
        set({ sort });
      },

      resetFilters: () => {
        set({ filters: DEFAULT_FILTERS, searchTerm: '' });
      },

      initializeSearchIndex: (movies: Movie[]) => {
        const index = createSearchIndex(movies);
        set({ searchIndex: index });
      },

      applyFiltersAndSearch: (allMovies: Movie[], favorites: Set<string>) => {
        const { searchTerm, filters, sort, searchIndex } = get();

        let result = allMovies;

        // Apply search if term exists
        if (searchTerm.trim().length >= 2 && searchIndex) {
          result = searchMovies(searchIndex, searchTerm);
        }

        // Apply filters
        result = filterMovies(result, filters, favorites);

        // Apply sorting
        result = sortMovies(result, sort);

        set({ filteredMovies: result });
      },
    }),
    { name: 'SearchStore' }
  )
);
