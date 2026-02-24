/**
 * FilterPanel Component
 * Container for all filter controls with collapsible UI
 */

import { useState } from 'react';
import { Genre, ContentRating } from '@/types/movie';
import { FilterCriteria } from '@/types/filters';
import GenreFilter from './GenreFilter';
import YearFilter from './YearFilter';
import RatingFilter from './RatingFilter';
import ContentRatingFilter from './ContentRatingFilter';

export interface FilterPanelProps {
  /** Active filter criteria */
  activeFilters?: Partial<FilterCriteria>;

  /** Change handler for filter updates */
  onFilterChange: (filters: Partial<FilterCriteria>) => void;

  /** Show runtime filter (optional) */
  showRuntimeFilter?: boolean;

  /** Additional CSS classes */
  className?: string;
}

/**
 * FilterPanel component with collapsible filter controls
 */
export default function FilterPanel({
  activeFilters = {},
  onFilterChange,
  showRuntimeFilter = false,
  className = '',
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Calculate active filter count
  const activeCount = [
    (activeFilters.genres?.length ?? 0) > 0,
    (activeFilters.contentRatings?.length ?? 0) > 0,
    activeFilters.minYear !== undefined || activeFilters.maxYear !== undefined,
    activeFilters.minRating !== undefined,
    activeFilters.minRuntime !== undefined || activeFilters.maxRuntime !== undefined,
  ].filter(Boolean).length;

  const handleGenreChange = (genres: Genre[]) => {
    onFilterChange({ ...activeFilters, genres });
  };

  const handleYearChange = (minYear: number, maxYear: number) => {
    onFilterChange({ ...activeFilters, minYear, maxYear });
  };

  const handleRatingChange = (rating: number | null) => {
    onFilterChange({
      ...activeFilters,
      minRating: rating ?? undefined,
    });
  };

  const handleContentRatingChange = (contentRatings: ContentRating[]) => {
    onFilterChange({ ...activeFilters, contentRatings });
  };

  const handleFavoritesToggle = () => {
    onFilterChange({
      ...activeFilters,
      showFavoritesOnly: !activeFilters.showFavoritesOnly,
    });
  };

  const handleClearAll = () => {
    onFilterChange({
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

  const handleRemoveGenreFilter = () => {
    onFilterChange({ ...activeFilters, genres: [] });
  };

  const handleRemoveYearFilter = () => {
    onFilterChange({
      ...activeFilters,
      minYear: undefined,
      maxYear: undefined,
    });
  };

  const handleRemoveRatingFilter = () => {
    onFilterChange({ ...activeFilters, minRating: undefined });
  };

  const handleRemoveContentRatingFilter = () => {
    onFilterChange({ ...activeFilters, contentRatings: [] });
  };

  // Get year range from data (default to current decade)
  const currentYear = new Date().getFullYear();
  const defaultMinYear = 2000;
  const defaultMaxYear = currentYear;

  return (
    <div
      role="region"
      aria-label="Filters"
      className={`bg-apple-bg-secondary rounded-apple-lg p-4 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-apple-text-primary">Filters</h2>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-apple-accent text-white rounded-full">
              {activeCount} active
            </span>
          )}
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label="Toggle filters"
          aria-expanded={isExpanded}
          className="p-2 hover:bg-apple-bg-tertiary rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-apple-accent"
        >
          <span className="text-xl">{isExpanded ? '−' : '+'}</span>
        </button>
      </div>

      {/* Clear All Button */}
      {activeCount > 0 && isExpanded && (
        <button
          onClick={handleClearAll}
          className="w-full mb-4 px-4 py-2 text-sm font-medium text-apple-accent bg-apple-bg-primary rounded-apple-md hover:bg-apple-bg-tertiary transition-colors focus:outline-none focus:ring-2 focus:ring-apple-accent"
        >
          Clear All
        </button>
      )}

      {/* Active Filter Badges */}
      {activeCount > 0 && isExpanded && (
        <div className="flex flex-wrap gap-2 mb-4">
          {(activeFilters.genres?.length ?? 0) > 0 && (
            <button
              onClick={handleRemoveGenreFilter}
              className="group flex items-center gap-2 px-3 py-1.5 bg-apple-accent text-white text-sm rounded-full hover:bg-opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-apple-accent focus:ring-offset-2"
            >
              <span>{activeFilters.genres?.join(', ')}</span>
              <span
                aria-label="Remove filter"
                className="text-xs opacity-75 group-hover:opacity-100"
              >
                ✕
              </span>
            </button>
          )}

          {(activeFilters.minYear !== undefined || activeFilters.maxYear !== undefined) && (
            <button
              onClick={handleRemoveYearFilter}
              className="group flex items-center gap-2 px-3 py-1.5 bg-apple-accent text-white text-sm rounded-full hover:bg-opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-apple-accent focus:ring-offset-2"
            >
              <span>
                {activeFilters.minYear ?? 'Any'} - {activeFilters.maxYear ?? 'Any'}
              </span>
              <span
                aria-label="Remove filter"
                className="text-xs opacity-75 group-hover:opacity-100"
              >
                ✕
              </span>
            </button>
          )}

          {activeFilters.minRating !== undefined && (
            <button
              onClick={handleRemoveRatingFilter}
              className="group flex items-center gap-2 px-3 py-1.5 bg-apple-accent text-white text-sm rounded-full hover:bg-opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-apple-accent focus:ring-offset-2"
            >
              <span>{activeFilters.minRating.toFixed(1)}+ rating</span>
              <span
                aria-label="Remove filter"
                className="text-xs opacity-75 group-hover:opacity-100"
              >
                ✕
              </span>
            </button>
          )}

          {(activeFilters.contentRatings?.length ?? 0) > 0 && (
            <button
              onClick={handleRemoveContentRatingFilter}
              className="group flex items-center gap-2 px-3 py-1.5 bg-apple-accent text-white text-sm rounded-full hover:bg-opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-apple-accent focus:ring-offset-2"
            >
              <span>{activeFilters.contentRatings?.join(', ')}</span>
              <span
                aria-label="Remove filter"
                className="text-xs opacity-75 group-hover:opacity-100"
              >
                ✕
              </span>
            </button>
          )}
        </div>
      )}

      {/* Filter Controls */}
      {isExpanded && (
        <div className="space-y-6">
          {/* Genre Filter */}
          <GenreFilter selectedGenres={activeFilters.genres ?? []} onChange={handleGenreChange} />

          <hr className="border-apple-divider" />

          {/* Year Filter */}
          <YearFilter
            minYear={defaultMinYear}
            maxYear={defaultMaxYear}
            selectedMinYear={activeFilters.minYear ?? defaultMinYear}
            selectedMaxYear={activeFilters.maxYear ?? defaultMaxYear}
            onChange={handleYearChange}
          />

          <hr className="border-apple-divider" />

          {/* Rating Filter */}
          <RatingFilter
            selectedRating={activeFilters.minRating ?? null}
            onChange={handleRatingChange}
          />

          <hr className="border-apple-divider" />

          {/* Content Rating Filter */}
          <ContentRatingFilter
            selectedRatings={activeFilters.contentRatings ?? []}
            onChange={handleContentRatingChange}
          />

          <hr className="border-apple-divider" />

          {/* Favorites Filter */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-apple-text-primary">Favorites</h3>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={activeFilters.showFavoritesOnly ?? false}
                onChange={handleFavoritesToggle}
                aria-label="Show favorites only"
                className="w-5 h-5 rounded border-apple-divider text-apple-accent focus:ring-2 focus:ring-apple-accent cursor-pointer"
              />
              <span className="text-sm text-apple-text-primary group-hover:text-apple-accent transition-colors">
                Show favorites only
              </span>
            </label>
          </div>

          {/* Runtime Filter (optional) */}
          {showRuntimeFilter && (
            <>
              <hr className="border-apple-divider" />
              <div className="text-center text-sm text-apple-text-secondary">
                <span>Runtime</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
