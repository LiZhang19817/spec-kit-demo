/**
 * Single streaming catalog view (Netflix or Max) with scoped search and filters
 */

import { useEffect, useMemo, useState } from 'react';
import Layout from '@/components/layout/Layout';
import MovieGrid from '@/components/movie/MovieGrid';
import MovieDetailModal from '@/components/movie/MovieDetailModal';
import EmptyState from '@/components/common/EmptyState';
import Pagination from '@/components/common/Pagination';
import { useMovieStore } from '@/store/movieStore';
import { useSearchStore } from '@/store/searchStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { usePagination } from '@/hooks/usePagination';
import { useTranslation } from '@/i18n/useTranslation';
import { StreamingCatalogProvider } from '@/context/StreamingCatalogContext';
import { movieAppearsOnStreamingCatalog, StreamingCatalogId } from '@/lib/streamingCatalog';
import { Movie } from '@/types/movie';

export interface CatalogBrowsePageProps {
  catalog: StreamingCatalogId;
}

export default function CatalogBrowsePage({ catalog }: CatalogBrowsePageProps) {
  const movies = useMovieStore((state) => state.movies);
  const catalogMovies = useMemo(
    () => movies.filter((m) => movieAppearsOnStreamingCatalog(m, catalog)),
    [movies, catalog]
  );

  return (
    <StreamingCatalogProvider catalog={catalog} catalogMovies={catalogMovies}>
      <CatalogBrowseInner catalog={catalog} catalogMovies={catalogMovies} />
    </StreamingCatalogProvider>
  );
}

function CatalogBrowseInner({
  catalog,
  catalogMovies,
}: {
  catalog: StreamingCatalogId;
  catalogMovies: Movie[];
}) {
  const movies = useMovieStore((state) => state.movies);

  const initializeSearchIndex = useSearchStore((state) => state.initializeSearchIndex);
  const applyFiltersAndSearch = useSearchStore((state) => state.applyFiltersAndSearch);

  const favorites = useFavoritesStore((state) => state.favorites);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  const searchTerm = useSearchStore((state) => state.searchTerm);
  const filteredMovies = useSearchStore((state) => state.filteredMovies);
  const filters = useSearchStore((state) => state.filters);

  const { t } = useTranslation();

  const hasActiveFilters =
    filters.genres.length > 0 ||
    filters.contentRatings.length > 0 ||
    filters.minYear !== undefined ||
    filters.maxYear !== undefined ||
    filters.minRating !== undefined ||
    filters.minRuntime !== undefined ||
    filters.maxRuntime !== undefined;

  const hasSearchOrFilters = searchTerm.length > 0 || hasActiveFilters;

  const pagination = usePagination({
    totalItems: filteredMovies.length,
    initialItemsPerPage: 8,
  });

  const paginatedMovies = filteredMovies.slice(pagination.startIndex, pagination.endIndex);

  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMovieClick = (movieId: string) => {
    const movie = movies.find((m) => m.id === movieId);
    if (movie) {
      setSelectedMovie(movie);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMovie(null);
  };

  useEffect(() => {
    initializeSearchIndex(catalogMovies);
    applyFiltersAndSearch(catalogMovies, favorites);
  }, [catalogMovies, favorites, initializeSearchIndex, applyFiltersAndSearch]);

  useKeyboardShortcuts([
    {
      key: 'k',
      ctrl: true,
      cmd: true,
      description: 'Focus search',
      callback: () => {
        const searchInput = document.querySelector(
          '[data-testid="movie-search-input"]'
        ) as HTMLInputElement;
        searchInput?.focus();
      },
    },
  ]);

  const headingLibrary =
    catalog === 'netflix' ? t('app_heading_catalog_netflix') : t('app_heading_catalog_max');

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-apple-text-primary mb-2">
          {searchTerm ? t('app_heading_search') : headingLibrary}
        </h2>
        <p className="text-apple-text-secondary">
          {filteredMovies.length}{' '}
          {filteredMovies.length === 1 ? t('app_title_one') : t('app_title_other')}
          {searchTerm
            ? t('app_found')
            : hasActiveFilters
              ? t('app_match_filters')
              : t('app_available')}
        </p>
      </div>

      {filteredMovies.length === 0 && (
        <EmptyState
          icon="📺"
          title={
            catalogMovies.length === 0 && !hasSearchOrFilters
              ? t('empty_catalog_empty_title')
              : hasSearchOrFilters
                ? t('empty_no_match_title')
                : t('empty_no_content_title')
          }
          description={
            catalogMovies.length === 0 && !hasSearchOrFilters
              ? t('empty_catalog_empty_desc')
              : hasSearchOrFilters
                ? t('empty_no_match_desc')
                : t('empty_no_content_desc')
          }
        />
      )}

      {filteredMovies.length > 0 && (
        <>
          <div className="mb-6">
            <Pagination pagination={pagination} itemsPerPageOptions={[8, 16, 24, 40]} />
          </div>

          <MovieGrid
            movies={paginatedMovies}
            favorites={favorites}
            onFavoriteToggle={toggleFavorite}
            onMovieClick={handleMovieClick}
            isLoading={false}
          />

          <div className="mt-8">
            <Pagination pagination={pagination} itemsPerPageOptions={[8, 16, 24, 40]} />
          </div>
        </>
      )}

      <MovieDetailModal movie={selectedMovie} isOpen={isModalOpen} onClose={handleCloseModal} />
    </Layout>
  );
}
