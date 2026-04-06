/**
 * MovieDetailModal Component
 * Modal to display detailed movie information and streaming watch links
 */

import { useEffect } from 'react';
import { Movie } from '@/types/movie';
import Button from '@/components/common/Button';
import { useTranslation } from '@/i18n/useTranslation';
import { contentRatingToPillId, genreToMessageId } from '@/i18n/labels';
import { useMovieDisplayText } from '@/hooks/useMovieDisplayText';
import { getStreamingWatchLink } from '@/lib/streamingWatch';

export interface MovieDetailModalProps {
  /** Movie to display */
  movie: Movie | null;

  /** Whether modal is open */
  isOpen: boolean;

  /** Close handler */
  onClose: () => void;
}

/**
 * Modal component showing movie details and primary streaming link (Netflix or Max)
 */
export default function MovieDetailModal({ movie, isOpen, onClose }: MovieDetailModalProps) {
  const { t } = useTranslation();
  const { displayTitle, displayDescription } = useMovieDisplayText(movie);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !movie) {
    return null;
  }

  const { url: watchUrl, provider, secondaryUrl } = getStreamingWatchLink(movie);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-80"
      onClick={onClose}
    >
      <div
        className="relative bg-apple-bg-secondary rounded-apple-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all"
          aria-label={t('modal_close_aria')}
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="grid md:grid-cols-2 gap-8 p-8">
          {/* Left: Movie Poster */}
          <div className="flex flex-col items-center">
            <img
              src={movie.thumbnailUrl}
              alt={displayTitle}
              className="w-full rounded-apple-md shadow-2xl"
              loading="lazy"
            />
          </div>

          {/* Right: Movie Details */}
          <div className="flex flex-col gap-6">
            {/* Title and Year */}
            <div>
              <h2 className="text-3xl font-semibold text-apple-text-primary mb-2">
                {displayTitle}
              </h2>
              <div className="flex items-center gap-3 text-apple-text-secondary">
                <span>{movie.releaseYear}</span>
                {movie.runtime && <span>•</span>}
                {movie.runtime && (
                  <span>
                    {movie.runtime} {t('modal_min')}
                  </span>
                )}
                {movie.contentRating && <span>•</span>}
                {movie.contentRating && (
                  <span className="px-2 py-0.5 bg-apple-bg-tertiary rounded text-xs font-semibold">
                    {t(contentRatingToPillId(movie.contentRating))}
                  </span>
                )}
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(movie.rating) ? 'text-yellow-500' : 'text-gray-600'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-apple-text-secondary">{movie.rating.toFixed(1)}/5.0</span>
            </div>

            {/* Genres */}
            <div>
              <h3 className="text-sm font-semibold text-apple-text-secondary mb-2">
                {t('modal_genres')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {movie.genres.map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1 bg-apple-bg-tertiary rounded-full text-sm text-apple-text-primary"
                  >
                    {t(genreToMessageId(genre))}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold text-apple-text-secondary mb-2">
                {t('modal_synopsis')}
              </h3>
              <p className="text-apple-text-primary leading-relaxed">{displayDescription}</p>
            </div>

            {/* Cast */}
            {movie.cast && movie.cast.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-apple-text-secondary mb-2">
                  {t('modal_cast')}
                </h3>
                <p className="text-apple-text-primary">{movie.cast.join(', ')}</p>
              </div>
            )}

            {/* Director */}
            {movie.director && (
              <div>
                <h3 className="text-sm font-semibold text-apple-text-secondary mb-2">
                  {t('modal_director')}
                </h3>
                <p className="text-apple-text-primary">{movie.director}</p>
              </div>
            )}

            {/* Streaming watch link */}
            <div className="pt-4 border-t border-apple-bg-tertiary">
              <a
                href={watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full"
              >
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  className={
                    provider === 'max'
                      ? '!bg-violet-700 hover:!bg-violet-600 focus:!ring-violet-500'
                      : ''
                  }
                >
                  <div className="flex items-center justify-center gap-2">
                    {provider === 'netflix' ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path d="M5.398 0v.006c3.028 8.556 5.37 15.175 8.348 23.596 2.344.058 4.85.398 4.854.398-2.8-7.924-5.923-16.747-8.487-24zm8.489 0v9.63L18.6 22.951c-.043-7.86-.004-15.913.002-22.95zM5.398 1.05V24c2.136-.143 4.988-.287 5.018-.287C8.36 17.048 5.515 8.161 5.398 1.05z" />
                      </svg>
                    ) : (
                      <span
                        className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-sm bg-white/20 px-0.5 text-xs font-black leading-none"
                        aria-hidden
                      >
                        M
                      </span>
                    )}
                    <span>
                      {provider === 'netflix' ? t('modal_watch_netflix') : t('modal_watch_max')}
                    </span>
                  </div>
                </Button>
              </a>
              <p className="text-xs text-apple-text-tertiary mt-2 text-center break-all">
                {watchUrl}
              </p>
              {secondaryUrl && (
                <a
                  href={secondaryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 block text-center text-sm text-violet-400 underline hover:text-violet-300"
                >
                  {t('modal_watch_also_max')}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
