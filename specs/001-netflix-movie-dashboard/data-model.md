# Data Model: Netflix Movie Dashboard

**Feature**: Netflix Movie Dashboard
**Created**: 2026-02-24
**Purpose**: Define entity schemas, relationships, and validation rules for the application

## Overview

The Netflix Movie Dashboard uses a **client-side data model** with no backend persistence. All data is stored in:
- **Static JSON** for movie collection (loaded on app init)
- **Browser localStorage** for user preferences and favorites (persistent across sessions)

This document defines TypeScript interfaces for all entities, validation rules, and state management contracts.

---

## Core Entities

### 1. Movie

Represents a single film in the user's Netflix collection.

**TypeScript Interface**:

```typescript
interface Movie {
  id: string;                    // Unique identifier (UUID or slug)
  title: string;                 // Movie title (e.g., "Inception")
  genres: Genre[];               // Array of genre classifications
  releaseYear: number;           // Year of theatrical release (e.g., 2010)
  rating: number;                // User rating (1-5 scale, 0.5 increments)
  thumbnailUrl: string;          // URL to movie poster/thumbnail image
  description: string;           // Movie synopsis/plot summary
  runtime?: number;              // Duration in minutes (optional)
  director?: string;             // Director name (optional)
  cast?: string[];               // Array of main actors (optional)
}

type Genre =
  | 'Action'
  | 'Comedy'
  | 'Drama'
  | 'Horror'
  | 'Sci-Fi'
  | 'Romance'
  | 'Thriller'
  | 'Documentary'
  | 'Animation'
  | 'Fantasy'
  | 'Mystery'
  | 'Adventure'
  | 'Crime';
```

**Validation Rules**:

```typescript
const movieSchema = {
  id: {
    required: true,
    type: 'string',
    minLength: 1,
    unique: true,
  },
  title: {
    required: true,
    type: 'string',
    minLength: 1,
    maxLength: 200,
  },
  genres: {
    required: true,
    type: 'array',
    minItems: 1,
    maxItems: 3,
    itemType: Genre,
  },
  releaseYear: {
    required: true,
    type: 'number',
    min: 1900,
    max: new Date().getFullYear() + 2, // Allow upcoming releases
  },
  rating: {
    required: true,
    type: 'number',
    min: 0,
    max: 5,
    step: 0.5,
  },
  thumbnailUrl: {
    required: true,
    type: 'string',
    format: 'url',
  },
  description: {
    required: true,
    type: 'string',
    minLength: 10,
    maxLength: 1000,
  },
  runtime: {
    required: false,
    type: 'number',
    min: 1,
    max: 500, // Longest films ~5-7 hours
  },
  director: {
    required: false,
    type: 'string',
    maxLength: 100,
  },
  cast: {
    required: false,
    type: 'array',
    maxItems: 10,
    itemType: 'string',
  },
};
```

**Sample Data**:

```json
{
  "id": "inception-2010",
  "title": "Inception",
  "genres": ["Sci-Fi", "Thriller", "Action"],
  "releaseYear": 2010,
  "rating": 4.5,
  "thumbnailUrl": "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
  "description": "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
  "runtime": 148,
  "director": "Christopher Nolan",
  "cast": ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page"]
}
```

---

### 2. SearchQuery

Represents the user's current search input and active filters.

**TypeScript Interface**:

```typescript
interface SearchQuery {
  searchText: string;           // User's search input (case-insensitive)
  filters: FilterCriteria;      // Active filter selections
  sortBy: SortOption;           // Sort preference
  viewMode: ViewMode;           // Grid or list view
}

interface FilterCriteria {
  genres: Genre[];              // Selected genres (OR logic)
  yearRange: YearRange | null;  // Year range filter
  minRating: number | null;     // Minimum star rating (1-5)
  favoritesOnly: boolean;       // Show only favorited movies
}

interface YearRange {
  min: number;                  // Minimum year (inclusive)
  max: number;                  // Maximum year (inclusive)
}

type SortOption =
  | 'title-asc'
  | 'title-desc'
  | 'year-asc'
  | 'year-desc'
  | 'rating-asc'
  | 'rating-desc';

type ViewMode = 'grid' | 'list';
```

**Default Values**:

```typescript
const defaultSearchQuery: SearchQuery = {
  searchText: '',
  filters: {
    genres: [],
    yearRange: null,
    minRating: null,
    favoritesOnly: false,
  },
  sortBy: 'title-asc',
  viewMode: 'grid',
};
```

**Validation Rules**:

```typescript
const searchQuerySchema = {
  searchText: {
    type: 'string',
    maxLength: 200,
  },
  filters: {
    genres: {
      type: 'array',
      itemType: Genre,
      maxItems: 5, // Max 5 simultaneous genre filters
    },
    yearRange: {
      type: 'object',
      nullable: true,
      properties: {
        min: { type: 'number', min: 1900 },
        max: { type: 'number', max: new Date().getFullYear() + 2 },
      },
      validate: (range: YearRange) => range.min <= range.max,
    },
    minRating: {
      type: 'number',
      nullable: true,
      min: 0,
      max: 5,
      step: 0.5,
    },
    favoritesOnly: {
      type: 'boolean',
    },
  },
};
```

---

### 3. UserPreferences

Represents user's personalization settings and favorites (stored in localStorage).

**TypeScript Interface**:

```typescript
interface UserPreferences {
  favoriteMovieIds: string[];    // Array of movie IDs marked as favorites
  theme: Theme;                   // Light or dark mode preference
  viewMode: ViewMode;             // Preferred grid/list view
  sortBy: SortOption;             // Default sort preference
  recentSearches: string[];       // Last 10 search queries
}

type Theme = 'light' | 'dark' | 'system';
```

**Default Values**:

```typescript
const defaultUserPreferences: UserPreferences = {
  favoriteMovieIds: [],
  theme: 'system',
  viewMode: 'grid',
  sortBy: 'title-asc',
  recentSearches: [],
};
```

**LocalStorage Key**:

```typescript
const STORAGE_KEYS = {
  USER_PREFERENCES: 'netflix-dashboard:preferences',
  FAVORITES: 'netflix-dashboard:favorites', // Redundant storage for backup
} as const;
```

**Validation Rules**:

```typescript
const userPreferencesSchema = {
  favoriteMovieIds: {
    type: 'array',
    itemType: 'string',
    maxItems: 1000, // Reasonable limit for favorites
  },
  theme: {
    type: 'string',
    enum: ['light', 'dark', 'system'],
  },
  viewMode: {
    type: 'string',
    enum: ['grid', 'list'],
  },
  sortBy: {
    type: 'string',
    enum: ['title-asc', 'title-desc', 'year-asc', 'year-desc', 'rating-asc', 'rating-desc'],
  },
  recentSearches: {
    type: 'array',
    itemType: 'string',
    maxItems: 10, // Keep last 10 searches
  },
};
```

---

## Derived Entities

### 4. FilteredMovieResult

Represents the computed result set after applying search and filters.

**TypeScript Interface**:

```typescript
interface FilteredMovieResult {
  movies: Movie[];               // Filtered and sorted movies
  totalCount: number;            // Total movies matching criteria
  appliedFilters: FilterSummary; // Summary of active filters
  executionTime: number;         // Search/filter time in ms
}

interface FilterSummary {
  searchText: string | null;
  genreCount: number;
  hasYearFilter: boolean;
  hasRatingFilter: boolean;
  favoritesOnly: boolean;
}
```

---

## State Management (Zustand Stores)

### MovieStore

Manages the global movie collection and filtered results.

```typescript
interface MovieStore {
  // State
  movies: Movie[];                          // Full movie collection
  filteredMovies: Movie[];                  // Current filtered/sorted results
  isLoading: boolean;                       // Loading state
  error: string | null;                     // Error message

  // Actions
  loadMovies: () => Promise<void>;          // Load movies from JSON
  setFilteredMovies: (movies: Movie[]) => void;
  clearError: () => void;
}
```

### SearchStore

Manages search query and filter state.

```typescript
interface SearchStore {
  // State
  searchQuery: SearchQuery;                 // Current search/filter state

  // Actions
  setSearchText: (text: string) => void;
  setGenreFilter: (genres: Genre[]) => void;
  setYearFilter: (range: YearRange | null) => void;
  setRatingFilter: (minRating: number | null) => void;
  toggleFavoritesOnly: () => void;
  setSortBy: (sort: SortOption) => void;
  clearFilters: () => void;
  addRecentSearch: (query: string) => void;
}
```

### UIStore

Manages UI-specific state (modals, theme, view mode).

```typescript
interface UIStore {
  // State
  theme: Theme;                              // Current theme
  viewMode: ViewMode;                        // Grid or list view
  selectedMovieId: string | null;            // Currently viewed movie
  isModalOpen: boolean;                      // Movie detail modal

  // Actions
  setTheme: (theme: Theme) => void;
  setViewMode: (mode: ViewMode) => void;
  openMovieModal: (movieId: string) => void;
  closeMovieModal: () => void;
}
```

### FavoritesStore

Manages favorite movies with localStorage persistence.

```typescript
interface FavoritesStore {
  // State
  favoriteMovieIds: Set<string>;            // Set of favorited movie IDs

  // Actions
  toggleFavorite: (movieId: string) => void;
  isFavorite: (movieId: string) => boolean;
  loadFavorites: () => void;                // Load from localStorage
  saveFavorites: () => void;                // Persist to localStorage
  clearFavorites: () => void;
}
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interactions                         │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                     React Components                             │
│  (SearchBar, FilterPanel, MovieGrid, MovieCard, etc.)           │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Custom Hooks Layer                            │
│  useMovieSearch, useMovieFilter, useFavorites, useLocalStorage  │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Zustand Store Layer                           │
│  MovieStore, SearchStore, UIStore, FavoritesStore               │
└───────────────┬───────────────────────────┬─────────────────────┘
                │                           │
                ▼                           ▼
┌───────────────────────────┐   ┌───────────────────────────┐
│    Static JSON File       │   │   Browser localStorage    │
│    (movies.json)          │   │   (favorites, prefs)      │
└───────────────────────────┘   └───────────────────────────┘
```

---

## Relationships

### Movie ↔ Favorites
- **Type**: Many-to-Many (conceptually)
- **Implementation**: Movie IDs stored in UserPreferences.favoriteMovieIds
- **Constraint**: A movie can be favorited by the user; user can favorite multiple movies
- **Storage**: localStorage persistence

### Movie ↔ SearchQuery
- **Type**: Many-to-One
- **Implementation**: SearchQuery filters determine which movies are visible
- **Constraint**: One active SearchQuery at a time; multiple movies can match

### Movie ↔ Genre
- **Type**: Many-to-Many
- **Implementation**: Each movie has genres[] array; each genre can belong to multiple movies
- **Constraint**: Movies must have 1-3 genres

---

## Migration & Versioning

### Data Format Version

```typescript
interface DataFormat {
  version: string;               // Semantic version (e.g., "1.0.0")
  movies: Movie[];
}
```

**Current Version**: 1.0.0

**Future Migration Path**:
- Version 1.0.0 → 1.1.0: Add new optional fields (backward compatible)
- Version 1.x → 2.0.0: Change required fields or data structure (breaking)

### LocalStorage Migration

```typescript
function migrateLocalStorage(oldVersion: string, newVersion: string): void {
  // Migration logic for breaking changes to localStorage schema
  // Example: Convert favorites array to Set, update preference keys
}
```

---

## Performance Considerations

### Movie Collection Size

- **Small**: 1-100 movies → No optimization needed
- **Medium**: 100-500 movies → Implement virtualization (react-window)
- **Large**: 500-1000 movies → Virtualization + debounced search
- **Very Large**: 1000+ movies → Consider pagination or backend integration

### Search Performance

- **Fuse.js Indexing**: Pre-index movie collection on load (~20-50ms for 1000 items)
- **Debouncing**: 300ms delay prevents excessive search executions
- **Memoization**: Cache search results for identical queries

### LocalStorage Limits

- **Quota**: ~5-10MB per domain (browser-dependent)
- **Current Usage**: ~5KB for 100 favorites + preferences
- **Max Capacity**: ~2000 favorites before hitting quota

---

## Error Handling

### Data Loading Errors

```typescript
type LoadingError =
  | 'NETWORK_ERROR'      // Failed to fetch movies.json
  | 'PARSE_ERROR'        // Invalid JSON format
  | 'VALIDATION_ERROR'   // Movie data doesn't match schema
  | 'NOT_FOUND';         // movies.json not found

interface ErrorState {
  type: LoadingError;
  message: string;
  recoverable: boolean;  // Can user retry?
}
```

### LocalStorage Errors

```typescript
type StorageError =
  | 'QUOTA_EXCEEDED'     // localStorage full
  | 'NOT_SUPPORTED'      // Private browsing mode
  | 'PERMISSION_DENIED'; // Browser security settings

// Graceful degradation: Fall back to in-memory storage if localStorage unavailable
```

---

## Testing Data

### Sample Movies Fixture

See `tests/fixtures/movies.json` for complete test dataset.

**Characteristics**:
- 50 sample movies
- All genres represented
- Release years: 1990-2025
- Ratings: 1.0-5.0 (varied distribution)
- 10 movies with missing optional fields (runtime, director, cast)
- 5 movies with special characters in titles (test Unicode handling)

---

## References

- [TypeScript Handbook: Interfaces](https://www.typescriptlang.org/docs/handbook/interfaces.html)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- [Fuse.js Documentation](https://fusejs.io/)
