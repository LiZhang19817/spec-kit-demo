# State Management Contracts: Netflix Movie Dashboard

**Feature**: Netflix Movie Dashboard
**Created**: 2026-02-24
**Purpose**: Define Zustand store contracts, actions, selectors, and state synchronization rules

## State Architecture Overview

The application uses **Zustand** for global state management with four independent stores:

```
┌──────────────────────────────────────────────────────┐
│                 React Components                      │
└────────────┬──────────────────────┬──────────────────┘
             │                      │
             ▼                      ▼
┌────────────────────┐   ┌────────────────────┐
│   Custom Hooks     │   │  Direct Store      │
│  (useMovieSearch)  │   │    Access          │
└────────────┬───────┘   └────────┬───────────┘
             │                    │
             ▼                    ▼
┌──────────────────────────────────────────────────────┐
│              Zustand Stores (4 stores)                │
├───────────────┬──────────────┬──────────┬────────────┤
│  MovieStore   │ SearchStore  │ UIStore  │FavoritesS│
└───────────────┴──────────────┴──────────┴────────────┘
             │                    │
             ▼                    ▼
┌────────────────────┐   ┌────────────────────┐
│  Static JSON File  │   │ Browser localStorage│
└────────────────────┘   └────────────────────┘
```

---

## Store Contracts

### 1. MovieStore

**Purpose**: Manage the global movie collection and filtered results.

**State Schema**:

```typescript
interface MovieStoreState {
  // Data
  movies: Movie[];                       // Full collection (immutable after load)
  filteredMovies: Movie[];               // Current filtered/sorted subset

  // Loading states
  isLoading: boolean;                    // Loading movies from JSON
  error: string | null;                  // Error message if load failed

  // Metadata
  lastLoadedAt: number | null;           // Timestamp of last successful load
}
```

**Actions Contract**:

```typescript
interface MovieStoreActions {
  // Load movies from static JSON file
  loadMovies: () => Promise<void>;

  // Update filtered results (called by SearchStore)
  setFilteredMovies: (movies: Movie[]) => void;

  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;

  // Reset store to initial state
  reset: () => void;
}
```

**Complete Store Interface**:

```typescript
type MovieStore = MovieStoreState & MovieStoreActions;

const useMovieStore = create<MovieStore>((set, get) => ({
  // Initial state
  movies: [],
  filteredMovies: [],
  isLoading: false,
  error: null,
  lastLoadedAt: null,

  // Actions
  loadMovies: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/data/movies.json');
      if (!response.ok) throw new Error('Failed to load movies');

      const data: Movie[] = await response.json();

      // Validate movie data
      const validatedMovies = data.map(validateMovie);

      set({
        movies: validatedMovies,
        filteredMovies: validatedMovies,
        isLoading: false,
        lastLoadedAt: Date.now(),
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  setFilteredMovies: (movies) => set({ filteredMovies: movies }),

  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  reset: () => set({
    movies: [],
    filteredMovies: [],
    isLoading: false,
    error: null,
    lastLoadedAt: null,
  }),
}));
```

**Selectors**:

```typescript
// Get all movies
const selectMovies = (state: MovieStore) => state.movies;

// Get filtered movies
const selectFilteredMovies = (state: MovieStore) => state.filteredMovies;

// Get loading state
const selectIsLoading = (state: MovieStore) => state.isLoading;

// Get error
const selectError = (state: MovieStore) => state.error;

// Get movie by ID (memoized)
const selectMovieById = (movieId: string) => (state: MovieStore) =>
  state.movies.find((m) => m.id === movieId);
```

**Usage Example**:

```tsx
function MovieGrid() {
  const filteredMovies = useMovieStore(selectFilteredMovies);
  const isLoading = useMovieStore(selectIsLoading);

  if (isLoading) return <SkeletonLoader variant="card" count={12} />;

  return <div className="grid">
    {filteredMovies.map(movie => <MovieCard key={movie.id} movie={movie} />)}
  </div>;
}
```

---

### 2. SearchStore

**Purpose**: Manage search query and filter state, trigger filtered results updates.

**State Schema**:

```typescript
interface SearchStoreState {
  // Search & Filter state
  searchText: string;                    // Current search query
  filters: FilterCriteria;               // Active filters
  sortBy: SortOption;                    // Sort preference

  // Execution metadata
  isSearching: boolean;                  // Debounced search in progress
  searchExecutionTime: number | null;    // Last search duration (ms)

  // Recent searches for autocomplete
  recentSearches: string[];              // Last 10 searches
}
```

**Actions Contract**:

```typescript
interface SearchStoreActions {
  // Search text
  setSearchText: (text: string) => void;

  // Filters
  setGenreFilter: (genres: Genre[]) => void;
  setYearFilter: (range: YearRange | null) => void;
  setRatingFilter: (minRating: number | null) => void;
  toggleFavoritesOnly: () => void;

  // Sorting
  setSortBy: (sort: SortOption) => void;

  // Bulk actions
  clearFilters: () => void;
  clearAll: () => void;                  // Clear search + filters

  // Recent searches
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;

  // Execute search (triggers MovieStore update)
  executeSearch: () => void;
}
```

**Complete Store Interface**:

```typescript
type SearchStore = SearchStoreState & SearchStoreActions;

const useSearchStore = create<SearchStore>((set, get) => ({
  // Initial state
  searchText: '',
  filters: {
    genres: [],
    yearRange: null,
    minRating: null,
    favoritesOnly: false,
  },
  sortBy: 'title-asc',
  isSearching: false,
  searchExecutionTime: null,
  recentSearches: [],

  // Actions
  setSearchText: (text) => {
    set({ searchText: text });
    get().executeSearch(); // Auto-execute on change
  },

  setGenreFilter: (genres) => {
    set((state) => ({
      filters: { ...state.filters, genres },
    }));
    get().executeSearch();
  },

  setYearFilter: (yearRange) => {
    set((state) => ({
      filters: { ...state.filters, yearRange },
    }));
    get().executeSearch();
  },

  setRatingFilter: (minRating) => {
    set((state) => ({
      filters: { ...state.filters, minRating },
    }));
    get().executeSearch();
  },

  toggleFavoritesOnly: () => {
    set((state) => ({
      filters: {
        ...state.filters,
        favoritesOnly: !state.filters.favoritesOnly,
      },
    }));
    get().executeSearch();
  },

  setSortBy: (sortBy) => {
    set({ sortBy });
    get().executeSearch();
  },

  clearFilters: () => {
    set({
      filters: {
        genres: [],
        yearRange: null,
        minRating: null,
        favoritesOnly: false,
      },
    });
    get().executeSearch();
  },

  clearAll: () => {
    set({
      searchText: '',
      filters: {
        genres: [],
        yearRange: null,
        minRating: null,
        favoritesOnly: false,
      },
    });
    get().executeSearch();
  },

  addRecentSearch: (query) => {
    if (!query.trim()) return;
    set((state) => ({
      recentSearches: [
        query,
        ...state.recentSearches.filter((q) => q !== query),
      ].slice(0, 10), // Keep max 10
    }));
  },

  clearRecentSearches: () => set({ recentSearches: [] }),

  executeSearch: () => {
    const startTime = performance.now();
    set({ isSearching: true });

    const { searchText, filters, sortBy } = get();
    const movies = useMovieStore.getState().movies;
    const favoriteMovieIds = useFavoritesStore.getState().favoriteMovieIds;

    // Apply search, filters, and sort
    let results = filterAndSearch(movies, {
      searchText,
      filters,
      sortBy,
      favoriteMovieIds,
    });

    const executionTime = performance.now() - startTime;

    set({
      isSearching: false,
      searchExecutionTime: executionTime,
    });

    // Update MovieStore with filtered results
    useMovieStore.getState().setFilteredMovies(results);
  },
}));
```

**Selectors**:

```typescript
// Get search text
const selectSearchText = (state: SearchStore) => state.searchText;

// Get active filters
const selectFilters = (state: SearchStore) => state.filters;

// Get filter count (for badge display)
const selectActiveFilterCount = (state: SearchStore) => {
  const { genres, yearRange, minRating, favoritesOnly } = state.filters;
  return (
    genres.length +
    (yearRange ? 1 : 0) +
    (minRating ? 1 : 0) +
    (favoritesOnly ? 1 : 0)
  );
};

// Check if any filters active
const selectHasActiveFilters = (state: SearchStore) =>
  selectActiveFilterCount(state) > 0;
```

---

### 3. UIStore

**Purpose**: Manage UI-specific state (theme, modals, view mode).

**State Schema**:

```typescript
interface UIStoreState {
  // Theme
  theme: Theme;                          // 'light' | 'dark' | 'system'

  // View preferences
  viewMode: ViewMode;                    // 'grid' | 'list'

  // Modal state
  selectedMovieId: string | null;        // Currently viewed movie
  isMovieModalOpen: boolean;             // Detail modal open

  // UI feedback
  toast: ToastMessage | null;            // Toast notification
}

interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info';
  duration: number;                      // Auto-dismiss after ms
}
```

**Actions Contract**:

```typescript
interface UIStoreActions {
  // Theme
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;               // Cycle light → dark → light

  // View mode
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;            // Toggle grid ↔ list

  // Modal
  openMovieModal: (movieId: string) => void;
  closeMovieModal: () => void;

  // Toast notifications
  showToast: (message: string, type?: 'success' | 'error' | 'info', duration?: number) => void;
  hideToast: () => void;
}
```

**Complete Store Interface**:

```typescript
type UIStore = UIStoreState & UIStoreActions;

const useUIStore = create<UIStore>((set, get) => ({
  // Initial state
  theme: 'system',
  viewMode: 'grid',
  selectedMovieId: null,
  isMovieModalOpen: false,
  toast: null,

  // Actions
  setTheme: (theme) => {
    set({ theme });
    applyThemeToDOM(theme); // Update document class
  },

  toggleTheme: () => {
    const current = get().theme;
    const next = current === 'light' ? 'dark' : 'light';
    get().setTheme(next);
  },

  setViewMode: (viewMode) => set({ viewMode }),

  toggleViewMode: () => {
    const current = get().viewMode;
    set({ viewMode: current === 'grid' ? 'list' : 'grid' });
  },

  openMovieModal: (movieId) => set({
    selectedMovieId: movieId,
    isMovieModalOpen: true,
  }),

  closeMovieModal: () => set({
    selectedMovieId: null,
    isMovieModalOpen: false,
  }),

  showToast: (message, type = 'info', duration = 3000) => {
    set({ toast: { message, type, duration } });
    setTimeout(() => get().hideToast(), duration);
  },

  hideToast: () => set({ toast: null }),
}));
```

---

### 4. FavoritesStore

**Purpose**: Manage favorite movies with localStorage persistence.

**State Schema**:

```typescript
interface FavoritesStoreState {
  favoriteMovieIds: Set<string>;         // Set for O(1) lookups
  isLoaded: boolean;                     // Loaded from localStorage
}
```

**Actions Contract**:

```typescript
interface FavoritesStoreActions {
  // Favorite management
  toggleFavorite: (movieId: string) => void;
  addFavorite: (movieId: string) => void;
  removeFavorite: (movieId: string) => void;
  isFavorite: (movieId: string) => boolean;

  // Bulk operations
  clearFavorites: () => void;

  // Persistence
  loadFromStorage: () => void;
  saveToStorage: () => void;
}
```

**Complete Store Interface**:

```typescript
type FavoritesStore = FavoritesStoreState & FavoritesStoreActions;

const useFavoritesStore = create<FavoritesStore>((set, get) => ({
  // Initial state
  favoriteMovieIds: new Set<string>(),
  isLoaded: false,

  // Actions
  toggleFavorite: (movieId) => {
    const isFav = get().isFavorite(movieId);
    if (isFav) {
      get().removeFavorite(movieId);
    } else {
      get().addFavorite(movieId);
    }
  },

  addFavorite: (movieId) => {
    set((state) => {
      const newSet = new Set(state.favoriteMovieIds);
      newSet.add(movieId);
      return { favoriteMovieIds: newSet };
    });
    get().saveToStorage();
  },

  removeFavorite: (movieId) => {
    set((state) => {
      const newSet = new Set(state.favoriteMovieIds);
      newSet.delete(movieId);
      return { favoriteMovieIds: newSet };
    });
    get().saveToStorage();
  },

  isFavorite: (movieId) => get().favoriteMovieIds.has(movieId),

  clearFavorites: () => {
    set({ favoriteMovieIds: new Set() });
    get().saveToStorage();
  },

  loadFromStorage: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      if (stored) {
        const ids: string[] = JSON.parse(stored);
        set({ favoriteMovieIds: new Set(ids), isLoaded: true });
      } else {
        set({ isLoaded: true });
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
      set({ isLoaded: true });
    }
  },

  saveToStorage: () => {
    try {
      const ids = Array.from(get().favoriteMovieIds);
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(ids));
    } catch (error) {
      console.error('Failed to save favorites:', error);
      // Show toast error
      useUIStore.getState().showToast(
        'Failed to save favorites. Storage may be full.',
        'error'
      );
    }
  },
}));
```

---

## Store Synchronization Rules

### Rule 1: Search/Filter Updates Trigger MovieStore

When `SearchStore` changes:
```
SearchStore.executeSearch()
  ↓
MovieStore.setFilteredMovies(results)
```

### Rule 2: Favorites Store Syncs to localStorage

When `FavoritesStore` changes:
```
FavoritesStore.toggleFavorite()
  ↓
FavoritesStore.saveToStorage()
  ↓
localStorage.setItem()
```

### Rule 3: Theme Store Syncs to DOM

When `UIStore.theme` changes:
```
UIStore.setTheme(theme)
  ↓
document.documentElement.setAttribute('data-theme', theme)
```

### Rule 4: Initialization Order

```
1. App mount
2. UIStore.loadThemeFromStorage()
3. FavoritesStore.loadFromStorage()
4. MovieStore.loadMovies()
5. SearchStore.executeSearch() // Initial filter
```

---

## Performance Optimization

### Selector Memoization

All selectors should use shallow equality checks:

```typescript
const movies = useMovieStore(selectFilteredMovies, shallow);
```

### Subscription Splitting

Only subscribe to needed state slices:

```tsx
// ❌ Bad: Re-renders on any MovieStore change
const store = useMovieStore();

// ✅ Good: Only re-renders when filteredMovies changes
const filteredMovies = useMovieStore(state => state.filteredMovies);
```

### Debounced Actions

Search and filter actions should be debounced:

```typescript
const debouncedExecuteSearch = debounce(executeSearch, 300);
```

---

## Testing Contracts

### Store Testing Requirements

1. **Action Contracts**: All actions must have unit tests
2. **State Transitions**: Test state before/after each action
3. **Side Effects**: Mock localStorage, fetch, DOM updates
4. **Error Handling**: Test failed loads, quota exceeded, etc.

**Example Test**:

```typescript
describe('FavoritesStore', () => {
  it('toggles favorite correctly', () => {
    const { toggleFavorite, isFavorite } = useFavoritesStore.getState();

    expect(isFavorite('movie-1')).toBe(false);

    toggleFavorite('movie-1');
    expect(isFavorite('movie-1')).toBe(true);

    toggleFavorite('movie-1');
    expect(isFavorite('movie-1')).toBe(false);
  });

  it('persists to localStorage', () => {
    const { addFavorite } = useFavoritesStore.getState();

    addFavorite('movie-1');

    const stored = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    expect(JSON.parse(stored!)).toEqual(['movie-1']);
  });
});
```

---

## References

- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [Zustand Best Practices](https://docs.pmnd.rs/zustand/guides/practice-with-no-store-actions)
- [React State Management Patterns](https://www.patterns.dev/react/state-management)
