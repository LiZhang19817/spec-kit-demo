/**
 * MovieCard Component
 * Display individual movie with poster, metadata, and interactions
 */

import { motion } from 'framer-motion';
import { Movie } from '@/types/movie';
import SearchHighlight from '@/components/search/SearchHighlight';
import { useSearchStore } from '@/store/searchStore';

export interface MovieCardProps {
  /** Movie data */
  movie: Movie;

  /** Whether movie is favorited */
  isFavorite: boolean;

  /** Favorite toggle handler */
  onFavoriteToggle: (movieId: string) => void;

  /** Optional click handler */
  onClick?: (movieId: string) => void;

  /** Additional CSS classes */
  className?: string;
}

/**
 * MovieCard component with Apple-style design and animations
 */
export default function MovieCard({
  movie,
  isFavorite,
  onFavoriteToggle,
  onClick,
  className = '',
}: MovieCardProps) {
  const handleCardClick = () => {
    if (onClick) {
      onClick(movie.id);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavoriteToggle(movie.id);
  };

  const searchTerm = useSearchStore((state) => state.searchTerm);

  return (
    <motion.article
      className={`group card overflow-hidden cursor-pointer ${className}`}
      onClick={handleCardClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      role="article"
      aria-label={`${movie.title} (${movie.releaseYear})`}
    >
      {/* Movie Poster */}
      <div className="relative aspect-[2/3] overflow-hidden bg-apple-bg-tertiary">
        <img
          src={movie.thumbnailUrl}
          alt={`${movie.title} poster`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Favorite Button */}
        <motion.button
          className="absolute top-2 right-2 p-2 bg-black/50 backdrop-blur-sm rounded-full transition-all hover:bg-black/70"
          onClick={handleFavoriteClick}
          whileTap={{ scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          aria-label={`${isFavorite ? 'Remove from' : 'Add to'} favorites`}
        >
          <motion.span
            key={isFavorite ? 'filled' : 'empty'}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            className="text-2xl inline-block"
          >
            {isFavorite ? '❤️' : '🤍'}
          </motion.span>
        </motion.button>
      </div>

      {/* Movie Info */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-lg font-semibold text-apple-text-primary mb-1 line-clamp-1">
          <SearchHighlight text={movie.title} searchTerm={searchTerm} />
        </h3>

        {/* Year and Rating */}
        <div className="flex items-center gap-3 text-sm text-apple-text-secondary mb-2">
          <span>{movie.releaseYear}</span>
          <span className="flex items-center gap-1">
            <span className="text-yellow-500">★</span>
            {movie.rating.toFixed(1)}
          </span>
          {movie.runtime && <span>{movie.runtime} min</span>}
        </div>

        {/* Genres */}
        <div className="flex flex-wrap gap-1">
          {movie.genres.slice(0, 3).map((genre) => (
            <span
              key={genre}
              className="px-2 py-1 text-xs bg-apple-bg-secondary text-apple-text-secondary rounded-apple-sm"
            >
              {genre}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  );
}
