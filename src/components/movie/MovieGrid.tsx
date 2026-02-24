/**
 * MovieGrid Component
 * Virtualized grid display for movie collection
 */

import { FixedSizeGrid as Grid } from 'react-window';
import { useEffect, useState, useRef } from 'react';
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
 * Calculate grid dimensions based on viewport
 */
function useGridDimensions() {
  const [dimensions, setDimensions] = useState({
    columnCount: 5,
    columnWidth: 240,
    rowHeight: 400,
  });

  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth;

      let columnCount = 5;
      if (width < 640)
        columnCount = 2; // Mobile
      else if (width < 768)
        columnCount = 3; // Tablet
      else if (width < 1024) columnCount = 4; // Small desktop

      const containerWidth = width - 64; // Account for padding
      const columnWidth = Math.floor(containerWidth / columnCount);
      const rowHeight = columnWidth * 1.6; // Maintain aspect ratio

      setDimensions({ columnCount, columnWidth, rowHeight });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return dimensions;
}

/**
 * MovieGrid component with virtualization for performance
 */
export default function MovieGrid({
  movies,
  favorites,
  onFavoriteToggle,
  onMovieClick,
  isLoading = false,
  className = '',
}: MovieGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { columnCount, columnWidth, rowHeight } = useGridDimensions();
  const rowCount = Math.ceil(movies.length / columnCount);

  // Loading state
  if (isLoading) {
    return (
      <div
        className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 ${className}`}
      >
        {Array.from({ length: 10 }).map((_, i) => (
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

  // Small collection - use regular grid (no virtualization)
  if (movies.length < 20) {
    return (
      <div
        className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 ${className}`}
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

  // Large collection - use virtualization
  const Cell = ({
    columnIndex,
    rowIndex,
    style,
  }: {
    columnIndex: number;
    rowIndex: number;
    style: React.CSSProperties;
  }) => {
    const index = rowIndex * columnCount + columnIndex;
    const movie = movies[index];

    if (!movie) {
      return null;
    }

    return (
      <div style={style} className="p-3">
        <MovieCard
          movie={movie}
          isFavorite={favorites.has(movie.id)}
          onFavoriteToggle={onFavoriteToggle}
          onClick={onMovieClick}
        />
      </div>
    );
  };

  return (
    <div ref={containerRef} className={className}>
      <Grid
        columnCount={columnCount}
        columnWidth={columnWidth}
        height={Math.min(rowCount * rowHeight, window.innerHeight - 200)}
        rowCount={rowCount}
        rowHeight={rowHeight}
        width={window.innerWidth - 64}
        className="mx-auto"
      >
        {Cell}
      </Grid>
    </div>
  );
}
