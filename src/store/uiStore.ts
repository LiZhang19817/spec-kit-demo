/**
 * UI Store
 * Zustand store for UI state management (theme, modals, etc.)
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { UserPreferences, DEFAULT_PREFERENCES } from '@/types/filters';
import { getItem, setItem, STORAGE_KEYS } from '@/lib/localStorage';

/**
 * UI store state
 */
interface UIState {
  /** User preferences */
  preferences: UserPreferences;

  /** Active theme (resolved from preference) */
  theme: 'light' | 'dark';

  /** Modal states */
  modals: {
    movieDetail: boolean;
    filters: boolean;
  };

  /** Selected movie ID for detail modal */
  selectedMovieId: string | null;

  /** Actions */
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setViewType: (viewType: 'grid' | 'list') => void;
  setPreferences: (preferences: Partial<UserPreferences>) => void;
  loadPreferences: () => void;
  openModal: (modal: keyof UIState['modals'], movieId?: string) => void;
  closeModal: (modal: keyof UIState['modals']) => void;
  closeAllModals: () => void;
}

/**
 * Detect system theme preference
 */
function getSystemTheme(): 'light' | 'dark' {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

/**
 * Apply theme to document
 */
function applyTheme(theme: 'light' | 'dark'): void {
  const root = document.documentElement;

  if (theme === 'dark') {
    root.setAttribute('data-theme', 'dark');
  } else {
    root.removeAttribute('data-theme');
  }
}

/**
 * UI store implementation
 */
export const useUIStore = create<UIState>()(
  devtools(
    (set, get) => ({
      preferences: DEFAULT_PREFERENCES,
      theme: getSystemTheme(),
      modals: {
        movieDetail: false,
        filters: false,
      },
      selectedMovieId: null,

      setTheme: (themePreference: 'light' | 'dark' | 'system') => {
        const actualTheme = themePreference === 'system' ? getSystemTheme() : themePreference;

        set((state) => ({
          preferences: {
            ...state.preferences,
            theme: themePreference,
            lastUpdated: Date.now(),
          },
          theme: actualTheme,
        }));

        applyTheme(actualTheme);

        // Persist to localStorage
        const { preferences } = get();
        setItem(STORAGE_KEYS.PREFERENCES, preferences);
        setItem(STORAGE_KEYS.THEME, themePreference);
      },

      setViewType: (viewType: 'grid' | 'list') => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            viewType,
            lastUpdated: Date.now(),
          },
        }));

        // Persist to localStorage
        const { preferences } = get();
        setItem(STORAGE_KEYS.PREFERENCES, preferences);
      },

      setPreferences: (newPreferences: Partial<UserPreferences>) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...newPreferences,
            lastUpdated: Date.now(),
          },
        }));

        // Persist to localStorage
        const { preferences } = get();
        setItem(STORAGE_KEYS.PREFERENCES, preferences);
      },

      loadPreferences: () => {
        const stored = getItem<UserPreferences>(STORAGE_KEYS.PREFERENCES);

        if (stored) {
          const actualTheme = stored.theme === 'system' ? getSystemTheme() : stored.theme;

          set({
            preferences: stored,
            theme: actualTheme,
          });

          applyTheme(actualTheme);
        } else {
          // Initialize with defaults
          const actualTheme = getSystemTheme();
          set({ theme: actualTheme });
          applyTheme(actualTheme);
          setItem(STORAGE_KEYS.PREFERENCES, DEFAULT_PREFERENCES);
        }
      },

      openModal: (modal: keyof UIState['modals'], movieId?: string) => {
        set((state) => ({
          modals: { ...state.modals, [modal]: true },
          selectedMovieId: movieId || null,
        }));
      },

      closeModal: (modal: keyof UIState['modals']) => {
        set((state) => ({
          modals: { ...state.modals, [modal]: false },
          selectedMovieId: modal === 'movieDetail' ? null : state.selectedMovieId,
        }));
      },

      closeAllModals: () => {
        set({
          modals: {
            movieDetail: false,
            filters: false,
          },
          selectedMovieId: null,
        });
      },
    }),
    { name: 'UIStore' }
  )
);

// Listen for system theme changes
if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const { preferences, setTheme } = useUIStore.getState();
    if (preferences.theme === 'system') {
      setTheme('system'); // Re-trigger to update actual theme
    }
  });
}
