/**
 * ContentRatingFilter Component
 * Multi-select filter for Singapore film classification ratings
 */

import { ContentRating, CONTENT_RATINGS } from '@/types/movie';
import { useTranslation } from '@/i18n/useTranslation';
import { contentRatingToDescId, contentRatingToPillId } from '@/i18n/labels';

export interface ContentRatingFilterProps {
  /** Currently selected content ratings */
  selectedRatings: ContentRating[];

  /** Callback when selection changes */
  onChange: (ratings: ContentRating[]) => void;

  /** Additional CSS classes */
  className?: string;
}

/**
 * Content rating filter with pill-style multi-select buttons
 */
export default function ContentRatingFilter({
  selectedRatings,
  onChange,
  className = '',
}: ContentRatingFilterProps) {
  const { t } = useTranslation();

  const handleRatingToggle = (rating: ContentRating) => {
    const isSelected = selectedRatings.includes(rating);

    if (isSelected) {
      onChange(selectedRatings.filter((r) => r !== rating));
    } else {
      onChange([...selectedRatings, rating]);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-apple-text-primary">
        {t('content_rating_heading')}
      </label>

      <div className="flex flex-wrap gap-2">
        {CONTENT_RATINGS.map((rating) => {
          const isSelected = selectedRatings.includes(rating);

          return (
            <button
              key={rating}
              onClick={() => handleRatingToggle(rating)}
              role="checkbox"
              aria-checked={isSelected}
              title={t(contentRatingToDescId(rating))}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                isSelected
                  ? 'bg-apple-accent text-white shadow-md'
                  : 'bg-apple-bg-secondary text-apple-text-secondary hover:bg-apple-bg-tertiary'
              }`}
            >
              {t(contentRatingToPillId(rating))}
            </button>
          );
        })}
      </div>

      {/* Description of selected rating */}
      {selectedRatings.length === 1 && (
        <p className="text-xs text-apple-text-tertiary">
          {t(contentRatingToDescId(selectedRatings[0]))}
        </p>
      )}
      {selectedRatings.length > 1 && (
        <p className="text-xs text-apple-text-tertiary">
          {t('content_rating_multi', { n: selectedRatings.length })}
        </p>
      )}
    </div>
  );
}
