/**
 * Movie Store
 * Zustand store for movie collection state management
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Movie } from '@/types/movie';
import { validateMovieArray } from '@/lib/validators';

/**
 * Movie store state
 */
interface MovieState {
  /** All movies in the collection */
  movies: Movie[];

  /** Loading state */
  isLoading: boolean;

  /** Error message if loading failed */
  error: string | null;

  /** Timestamp of last data fetch */
  lastFetched: number | null;

  /** Actions */
  loadMovies: () => Promise<void>;
  setMovies: (movies: Movie[]) => void;
  clearError: () => void;
}

/**
 * Movie store implementation
 */
export const useMovieStore = create<MovieState>()(
  devtools(
    (set) => ({
      movies: [],
      isLoading: false,
      error: null,
      lastFetched: null,

      /**
       * Load movies from static data file
       */
      loadMovies: async () => {
        set({ isLoading: true, error: null });

        try {
          // Add cache-busting parameter to force fresh data
          const cacheBuster = Date.now();
          const response = await fetch(`/data/movies.json?v=${cacheBuster}`);

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          const validatedMovies = validateMovieArray(data);

          set({
            movies: validatedMovies,
            isLoading: false,
            error: null,
            lastFetched: Date.now(),
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load movies';

          set({
            movies: [],
            isLoading: false,
            error: errorMessage,
            lastFetched: null,
          });

          console.error('Error loading movies:', error);
        }
      },

      /**
       * Set movies directly (for testing)
       */
      setMovies: (movies: Movie[]) => {
        set({
          movies,
          isLoading: false,
          error: null,
          lastFetched: Date.now(),
        });
      },

      /**
       * Clear error state
       */
      clearError: () => {
        set({ error: null });
      },
    }),
    { name: 'MovieStore' }
  )
);
