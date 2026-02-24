/**
 * MovieGrid Component
 * Responsive grid display for movie collection
 */

import MovieCard from './MovieCard';
import SkeletonLoader from '../common/SkeletonLoader';
import EmptyState from '../common/EmptyState';
import { Movie } from '@/types/movie';

export interface MovieGridProps {
  /** Movies to display */
  movies: Movie[];

  /** Set of favorite movie IDs */
  favorites: Set<string>;

  /** Favorite toggle handler */
  onFavoriteToggle: (movieId: string) => void;

  /** Optional movie click handler */
  onMovieClick?: (movieId: string) => void;

  /** Loading state */
  isLoading?: boolean;

  /** Additional CSS classes */
  className?: string;
}

/**
 * MovieGrid component with responsive CSS Grid layout
 * Optimized for pagination with 8-40 items per page
 */
export default function MovieGrid({
  movies,
  favorites,
  onFavoriteToggle,
  onMovieClick,
  isLoading = false,
  className = '',
}: MovieGridProps) {
  // Loading state
  if (isLoading) {
    return (
      <div
        className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6 ${className}`}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonLoader key={i} variant="card" />
        ))}
      </div>
    );
  }

  // Empty state
  if (movies.length === 0) {
    return (
      <EmptyState
        icon="🎬"
        title="No Movies Found"
        description="Try adjusting your search or filters to find more movies."
      />
    );
  }

  // Responsive grid layout
  return (
    <div
      className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6 ${className}`}
    >
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          isFavorite={favorites.has(movie.id)}
          onFavoriteToggle={onFavoriteToggle}
          onClick={onMovieClick}
        />
      ))}
    </div>
  );
}
