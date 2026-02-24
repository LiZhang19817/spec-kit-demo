/**
 * Type exports
 * Central export point for all TypeScript types
 */

// Movie types
export type { Movie, Genre } from './movie';
export { isMovie, isGenre } from './movie';

// Filter and search types
export type { FilterCriteria, SearchQuery, UserPreferences, SortConfig } from './filters';

export {
  DEFAULT_FILTERS,
  DEFAULT_PREFERENCES,
  isFilterCriteria,
  isUserPreferences,
} from './filters';
