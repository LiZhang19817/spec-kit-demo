/**
 * RatingFilter Component
 * Star rating filter with clickable star buttons
 */

import { useTranslation } from '@/i18n/useTranslation';

export interface RatingFilterProps {
  /** Selected minimum rating (1-5, or null for none) */
  selectedRating: number | null;

  /** Change handler */
  onChange: (rating: number | null) => void;

  /** Additional CSS classes */
  className?: string;
}

/**
 * RatingFilter component with interactive star buttons
 */
export default function RatingFilter({
  selectedRating,
  onChange,
  className = '',
}: RatingFilterProps) {
  const { t } = useTranslation();
  const stars = [1, 2, 3, 4, 5];

  const handleStarClick = (rating: number) => {
    if (selectedRating === rating) {
      // Deselect if clicking same rating
      onChange(null);
    } else {
      onChange(rating);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, rating: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleStarClick(rating);
    }
  };

  const handleClear = () => {
    onChange(null);
  };

  const displayLabel =
    selectedRating !== null
      ? `${selectedRating.toFixed(1)}+ ${t('filter_rating_suffix')}`
      : t('rating_any');

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-apple-text-primary">{t('rating_heading')}</h3>
        {selectedRating !== null && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-apple-accent hover:underline focus:outline-none"
          >
            {t('rating_clear')}
          </button>
        )}
      </div>

      {/* Display Label */}
      <div className="text-center">
        <span className="text-sm text-apple-text-secondary">{displayLabel}</span>
      </div>

      {/* Star Buttons */}
      <div className="flex justify-center gap-2">
        {stars.map((rating) => {
          const isPressed = selectedRating === rating;
          const isFilled = selectedRating !== null && rating <= selectedRating;

          return (
            <button
              key={rating}
              onClick={() => handleStarClick(rating)}
              onKeyDown={(e) => handleKeyDown(e, rating)}
              aria-label={t('rating_star_aria', { n: rating })}
              aria-pressed={isPressed}
              className={`
                text-3xl transition-all duration-200
                ${isFilled ? 'text-yellow-500' : 'text-apple-text-tertiary'}
                hover:scale-110 hover:text-yellow-400
                focus:outline-none focus:ring-2 focus:ring-apple-accent focus:ring-offset-2 rounded
              `}
            >
              {isFilled ? '★' : '☆'}
            </button>
          );
        })}
      </div>
    </div>
  );
}
