/**
 * Filter and search type definitions
 * Types for filtering, searching, and user preferences
 */

import { Genre, ContentRating } from './movie';

/**
 * Filter criteria for narrowing down movie collection
 */
export interface FilterCriteria {
  /** Filter by specific genres (empty = all genres) */
  genres: Genre[];

  /** Minimum release year (inclusive) */
  minYear?: number;

  /** Maximum release year (inclusive) */
  maxYear?: number;

  /** Minimum rating (0.0 - 5.0, inclusive) */
  minRating?: number;

  /** Maximum rating (0.0 - 5.0, inclusive) */
  maxRating?: number;

  /** Minimum runtime in minutes (inclusive) */
  minRuntime?: number;

  /** Maximum runtime in minutes (inclusive) */
  maxRuntime?: number;

  /** Filter by content ratings (empty = all ratings) */
  contentRatings: ContentRating[];

  /** Show only favorite movies */
  showFavoritesOnly: boolean;
}

/**
 * Search query for fuzzy text search
 */
export interface SearchQuery {
  /** Search term (searches title, director, cast, description) */
  term: string;

  /** Timestamp when search was initiated */
  timestamp: number;

  /** Number of results returned */
  resultCount?: number;
}

/**
 * User preferences for UI and data persistence
 */
export interface UserPreferences {
  /** Theme preference ('light' | 'dark' | 'system') */
  theme: 'light' | 'dark' | 'system';

  /** Grid view type ('grid' | 'list') */
  viewType: 'grid' | 'list';

  /** Number of items per page for pagination */
  itemsPerPage: number;

  /** Default sort field */
  sortBy: 'title' | 'releaseYear' | 'rating' | 'runtime';

  /** Sort direction */
  sortOrder: 'asc' | 'desc';

  /** Enable animations (performance setting) */
  enableAnimations: boolean;

  /** Last updated timestamp */
  lastUpdated: number;
}

/**
 * Sort configuration
 */
export interface SortConfig {
  /** Field to sort by */
  field: UserPreferences['sortBy'];

  /** Sort direction */
  order: UserPreferences['sortOrder'];
}

/**
 * Default filter criteria (show all)
 */
export const DEFAULT_FILTERS: FilterCriteria = {
  genres: [],
  contentRatings: [],
  showFavoritesOnly: false,
};

/**
 * Default user preferences
 */
export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  viewType: 'grid',
  itemsPerPage: 20,
  sortBy: 'title',
  sortOrder: 'asc',
  enableAnimations: true,
  lastUpdated: Date.now(),
};

/**
 * Type guard for FilterCriteria
 */
export function isFilterCriteria(value: unknown): value is FilterCriteria {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const filter = value as Record<string, unknown>;

  return Array.isArray(filter.genres) && typeof filter.showFavoritesOnly === 'boolean';
}

/**
 * Type guard for UserPreferences
 */
export function isUserPreferences(value: unknown): value is UserPreferences {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const prefs = value as Record<string, unknown>;
  const validThemes = ['light', 'dark', 'system'];
  const validViews = ['grid', 'list'];
  const validSorts = ['title', 'releaseYear', 'rating', 'runtime'];
  const validOrders = ['asc', 'desc'];

  return (
    validThemes.includes(prefs.theme as string) &&
    validViews.includes(prefs.viewType as string) &&
    typeof prefs.itemsPerPage === 'number' &&
    validSorts.includes(prefs.sortBy as string) &&
    validOrders.includes(prefs.sortOrder as string) &&
    typeof prefs.enableAnimations === 'boolean' &&
    typeof prefs.lastUpdated === 'number'
  );
}
