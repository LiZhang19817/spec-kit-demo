/**
 * App Component
 * Root application component with movie browsing and search
 */

import { useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import MovieGrid from '@/components/movie/MovieGrid';
import EmptyState from '@/components/common/EmptyState';
import Pagination from '@/components/common/Pagination';
import { useMovieStore } from '@/store/movieStore';
import { useSearchStore } from '@/store/searchStore';
import { useUIStore } from '@/store/uiStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { usePagination } from '@/hooks/usePagination';

/**
 * Root App Component
 */
export default function App() {
  const movies = useMovieStore((state) => state.movies);
  const isLoading = useMovieStore((state) => state.isLoading);
  const error = useMovieStore((state) => state.error);
  const loadMovies = useMovieStore((state) => state.loadMovies);

  const initializeSearchIndex = useSearchStore((state) => state.initializeSearchIndex);

  const loadPreferences = useUIStore((state) => state.loadPreferences);

  const favorites = useFavoritesStore((state) => state.favorites);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  const searchTerm = useSearchStore((state) => state.searchTerm);
  const filteredMovies = useSearchStore((state) => state.filteredMovies);
  const filters = useSearchStore((state) => state.filters);
  const applyFiltersAndSearch = useSearchStore((state) => state.applyFiltersAndSearch);

  /**
   * Check if any filters are active - must calculate before early returns
   */
  const hasActiveFilters =
    filters.genres.length > 0 ||
    filters.contentRatings.length > 0 ||
    filters.minYear !== undefined ||
    filters.maxYear !== undefined ||
    filters.minRating !== undefined ||
    filters.minRuntime !== undefined ||
    filters.maxRuntime !== undefined;

  const hasSearchOrFilters = searchTerm.length > 0 || hasActiveFilters;

  /**
   * Pagination - must be called before any early returns
   */
  const pagination = usePagination({
    totalItems: filteredMovies.length,
    initialItemsPerPage: 24,
  });

  // Get current page movies
  const paginatedMovies = filteredMovies.slice(pagination.startIndex, pagination.endIndex);

  /**
   * Initialize app on mount
   */
  useEffect(() => {
    loadPreferences();
    loadMovies();
  }, [loadMovies, loadPreferences]);

  /**
   * Initialize search index when movies are loaded
   */
  useEffect(() => {
    if (movies.length > 0) {
      initializeSearchIndex(movies);
      applyFiltersAndSearch(movies, favorites);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movies.length]);

  /**
   * Keyboard shortcuts
   */
  useKeyboardShortcuts([
    {
      key: 'k',
      ctrl: true,
      cmd: true,
      description: 'Focus search',
      callback: () => {
        const searchInput = document.querySelector(
          'input[placeholder*="Search"]'
        ) as HTMLInputElement;
        searchInput?.focus();
      },
    },
  ]);

  /**
   * Loading state
   */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-apple-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-apple-accent mx-auto mb-4"></div>
          <p className="text-apple-text-secondary">Loading movies...</p>
        </div>
      </div>
    );
  }

  /**
   * Error state
   */
  if (error) {
    return (
      <div className="min-h-screen bg-apple-bg-primary flex items-center justify-center">
        <EmptyState
          icon="⚠️"
          title="Failed to Load Movies"
          description={error}
          actionLabel="Retry"
          onAction={loadMovies}
        />
      </div>
    );
  }

  /**
   * Main app with movie browsing, search, and filters
   */
  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-apple-text-primary mb-2">
          {searchTerm ? 'Search Results' : 'Content Library'}
        </h2>
        <p className="text-apple-text-secondary">
          {filteredMovies.length} {filteredMovies.length === 1 ? 'title' : 'titles'}
          {searchTerm ? ' found' : hasActiveFilters ? ' match your filters' : ' available'}
        </p>
      </div>

      {/* Empty State */}
      {filteredMovies.length === 0 && !isLoading && (
        <EmptyState
          icon="📺"
          title={
            hasSearchOrFilters
              ? 'No titles match your search and filters'
              : 'No Netflix content found'
          }
          description={
            hasSearchOrFilters
              ? 'Try adjusting your search or filters to see more results'
              : 'Netflix Singapore content will be displayed here'
          }
        />
      )}

      {/* Movie Grid with Pagination */}
      {filteredMovies.length > 0 && (
        <>
          {/* Pagination Top */}
          <div className="mb-6">
            <Pagination pagination={pagination} />
          </div>

          {/* Movie Grid */}
          <MovieGrid
            movies={paginatedMovies}
            favorites={favorites}
            onFavoriteToggle={toggleFavorite}
            isLoading={isLoading}
          />

          {/* Pagination Bottom */}
          <div className="mt-8">
            <Pagination pagination={pagination} />
          </div>
        </>
      )}
    </Layout>
  );
}
