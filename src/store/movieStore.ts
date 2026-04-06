/**
 * Movie Store
 * Zustand store for movie collection state management
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Movie } from '@/types/movie';
import { validateMovieArray } from '@/lib/validators';
import { CatalogDiff, computeCatalogDiff } from '@/lib/catalogDiff';

export type { CatalogDiff };

/** Cache-busted URL for the catalog JSON (supports hosted `VITE_MOVIE_DATA_URL`). */
export function buildMovieCatalogRequestUrl(cacheBuster: number): string {
  const base =
    (import.meta.env.VITE_MOVIE_DATA_URL as string | undefined)?.trim() || '/data/movies.json';
  if (/^https?:\/\//i.test(base)) {
    const u = new URL(base);
    u.searchParams.set('v', String(cacheBuster));
    return u.toString();
  }
  const u = new URL(
    base,
    typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
  );
  u.searchParams.set('v', String(cacheBuster));
  return u.toString();
}

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

  /** After a refresh (not initial load), what changed vs the previous catalog */
  lastCatalogDiff: CatalogDiff | null;

  /** Actions */
  loadMovies: () => Promise<void>;
  setMovies: (movies: Movie[]) => void;
  clearError: () => void;
  clearCatalogDiff: () => void;
}

/**
 * Movie store implementation
 */
export const useMovieStore = create<MovieState>()(
  devtools(
    (set, get) => ({
      movies: [],
      isLoading: false,
      error: null,
      lastFetched: null,
      lastCatalogDiff: null,

      /**
       * Load movies from static data file
       */
      loadMovies: async () => {
        const previousMovies = get().movies;
        set({ isLoading: true, error: null });

        try {
          // Add cache-busting parameter to force fresh data
          const cacheBuster = Date.now();
          const response = await fetch(buildMovieCatalogRequestUrl(cacheBuster));

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          const validatedMovies = validateMovieArray(data);
          const lastCatalogDiff = computeCatalogDiff(previousMovies, validatedMovies);

          set({
            movies: validatedMovies,
            isLoading: false,
            error: null,
            lastFetched: Date.now(),
            lastCatalogDiff,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load movies';

          set({
            movies: [],
            isLoading: false,
            error: errorMessage,
            lastFetched: null,
            lastCatalogDiff: null,
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

      clearCatalogDiff: () => {
        set({ lastCatalogDiff: null });
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
