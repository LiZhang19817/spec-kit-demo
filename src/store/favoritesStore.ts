/**
 * Favorites Store
 * Zustand store for managing favorite movies with localStorage persistence
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/lib/localStorage';

/**
 * Favorites store state
 */
interface FavoritesState {
  /** Set of favorite movie IDs */
  favorites: Set<string>;

  /** Actions */
  toggleFavorite: (movieId: string) => void;
  addFavorite: (movieId: string) => void;
  removeFavorite: (movieId: string) => void;
  isFavorite: (movieId: string) => boolean;
  clearFavorites: () => void;
  getFavoritesArray: () => string[];
}

/**
 * Favorites store implementation with localStorage persistence
 */
export const useFavoritesStore = create<FavoritesState>()(
  devtools(
    persist(
      (set, get) => ({
        favorites: new Set<string>(),

        toggleFavorite: (movieId: string) => {
          set((state) => {
            const newFavorites = new Set(state.favorites);

            if (newFavorites.has(movieId)) {
              newFavorites.delete(movieId);
            } else {
              newFavorites.add(movieId);
            }

            return { favorites: newFavorites };
          });
        },

        addFavorite: (movieId: string) => {
          set((state) => {
            const newFavorites = new Set(state.favorites);
            newFavorites.add(movieId);
            return { favorites: newFavorites };
          });
        },

        removeFavorite: (movieId: string) => {
          set((state) => {
            const newFavorites = new Set(state.favorites);
            newFavorites.delete(movieId);
            return { favorites: newFavorites };
          });
        },

        isFavorite: (movieId: string) => {
          return get().favorites.has(movieId);
        },

        clearFavorites: () => {
          set({ favorites: new Set<string>() });
        },

        getFavoritesArray: () => {
          return Array.from(get().favorites);
        },
      }),
      {
        name: STORAGE_KEYS.FAVORITES,
        storage: {
          getItem: (name) => {
            const str = localStorage.getItem(name);
            if (!str) return null;

            try {
              const parsed = JSON.parse(str);
              // Convert array back to Set
              if (parsed.state && Array.isArray(parsed.state.favorites)) {
                parsed.state.favorites = new Set(parsed.state.favorites);
              }
              return parsed;
            } catch {
              return null;
            }
          },
          setItem: (name, value) => {
            // Convert Set to array for serialization
            const serializable = {
              ...value,
              state: {
                ...value.state,
                favorites: Array.from(value.state.favorites),
              },
            };
            localStorage.setItem(name, JSON.stringify(serializable));
          },
          removeItem: (name) => localStorage.removeItem(name),
        },
      }
    ),
    { name: 'FavoritesStore' }
  )
);
