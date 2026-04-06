/**
 * App Component
 * Root application component with routing for Netflix vs Max catalogs
 */

import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import CatalogBrowsePage from '@/components/catalog/CatalogBrowsePage';
import EmptyState from '@/components/common/EmptyState';
import { useMovieStore } from '@/store/movieStore';
import { useUIStore } from '@/store/uiStore';
import { useTranslation } from '@/i18n/useTranslation';

/**
 * Root App Component
 */
export default function App() {
  const isLoading = useMovieStore((state) => state.isLoading);
  const error = useMovieStore((state) => state.error);
  const loadMovies = useMovieStore((state) => state.loadMovies);

  const loadPreferences = useUIStore((state) => state.loadPreferences);

  const { t } = useTranslation();

  useEffect(() => {
    loadPreferences();
    loadMovies();
  }, [loadMovies, loadPreferences]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-apple-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-apple-accent mx-auto mb-4"></div>
          <p className="text-apple-text-secondary">{t('app_loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-apple-bg-primary flex items-center justify-center">
        <EmptyState
          icon="⚠️"
          title={t('app_error_title')}
          description={error}
          actionLabel={t('app_error_retry')}
          onAction={loadMovies}
        />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/netflix" replace />} />
        <Route path="/netflix" element={<CatalogBrowsePage catalog="netflix" />} />
        <Route path="/max" element={<CatalogBrowsePage catalog="max" />} />
        <Route path="*" element={<Navigate to="/netflix" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
