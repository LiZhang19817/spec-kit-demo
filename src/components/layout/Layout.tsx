/**
 * Layout Component
 * Main application layout with header, sidebar, and content area
 */

import { ReactNode } from 'react';
import Header from './Header';
import CatalogUpdateBanner from '@/components/catalog/CatalogUpdateBanner';
import FilterPanel from '@/components/filters/FilterPanel';
import StreamingCatalogNav from '@/components/layout/StreamingCatalogNav';
import { useStreamingCatalogOptional } from '@/context/StreamingCatalogContext';
import { useTranslation } from '@/i18n/useTranslation';
import { useSearchStore } from '@/store/searchStore';
import { useMovieStore } from '@/store/movieStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { FilterCriteria } from '@/types/filters';

export interface LayoutProps {
  /** Page content */
  children: ReactNode;

  /** Additional CSS classes */
  className?: string;
}

/**
 * Layout component with sidebar filters
 */
export default function Layout({ children, className = '' }: LayoutProps) {
  const { t } = useTranslation();
  const filters = useSearchStore((state) => state.filters);
  const setFilters = useSearchStore((state) => state.setFilters);
  const applyFiltersAndSearch = useSearchStore((state) => state.applyFiltersAndSearch);
  const allMovies = useMovieStore((state) => state.movies);
  const streaming = useStreamingCatalogOptional();
  const moviesForFilters = streaming?.catalogMovies ?? allMovies;
  const favorites = useFavoritesStore((state) => state.favorites);

  const handleFilterChange = (newFilters: Partial<FilterCriteria>) => {
    setFilters(newFilters);
    applyFiltersAndSearch(moviesForFilters, favorites);
  };

  return (
    <div className={`min-h-screen bg-apple-bg-primary ${className}`}>
      <Header key={streaming?.catalog ?? 'default'} />
      <CatalogUpdateBanner />

      <div className="container mx-auto px-4 py-8">
        <StreamingCatalogNav />
        <div className="flex flex-col lg:flex-row gap-8 mt-6">
          {/* Sidebar with Filters (Desktop: Left sidebar, Mobile: Top) */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="sticky top-24">
              <FilterPanel activeFilters={filters} onFilterChange={handleFilterChange} />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>

      <footer className="border-t border-apple-divider py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-apple-text-secondary">
          <p>{t('layout_footer_1')}</p>
          <p className="mt-1">{t('layout_footer_2')}</p>
        </div>
      </footer>
    </div>
  );
}
