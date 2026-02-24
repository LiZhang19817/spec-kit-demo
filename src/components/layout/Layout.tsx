/**
 * Layout Component
 * Main application layout with header, sidebar, and content area
 */

import { ReactNode } from 'react';
import Header from './Header';
import FilterPanel from '@/components/filters/FilterPanel';
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
  const filters = useSearchStore((state) => state.filters);
  const setFilters = useSearchStore((state) => state.setFilters);
  const applyFiltersAndSearch = useSearchStore((state) => state.applyFiltersAndSearch);
  const movies = useMovieStore((state) => state.movies);
  const favorites = useFavoritesStore((state) => state.favorites);

  const handleFilterChange = (newFilters: Partial<FilterCriteria>) => {
    setFilters(newFilters);
    applyFiltersAndSearch(movies, favorites);
  };

  return (
    <div className={`min-h-screen bg-apple-bg-primary ${className}`}>
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
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
          <p>Netflix Movie Dashboard • Built with React, TypeScript & Tailwind CSS</p>
          <p className="mt-1">Designed with Apple.com aesthetic</p>
        </div>
      </footer>
    </div>
  );
}
