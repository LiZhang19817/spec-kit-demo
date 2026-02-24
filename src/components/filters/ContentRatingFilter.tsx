/**
 * ContentRatingFilter Component
 * Multi-select filter for Singapore film classification ratings
 */

import { ContentRating, CONTENT_RATINGS } from '@/types/movie';

export interface ContentRatingFilterProps {
  /** Currently selected content ratings */
  selectedRatings: ContentRating[];

  /** Callback when selection changes */
  onChange: (ratings: ContentRating[]) => void;

  /** Additional CSS classes */
  className?: string;
}

/**
 * Content rating descriptions for Singapore film classification
 */
const RATING_DESCRIPTIONS: Record<ContentRating, string> = {
  G: 'General - Suitable for all ages',
  PG: 'Parental Guidance - Some material may be unsuitable for children',
  PG13: 'Parental Guidance 13 - Suitable for 13 and above',
  NC16: 'No Children Under 16 - Suitable for 16 and above',
  M18: 'Mature 18 - Suitable for 18 and above',
  R21: 'Restricted 21 - Suitable for adults 21 and above',
};

/**
 * Content rating filter with pill-style multi-select buttons
 */
export default function ContentRatingFilter({
  selectedRatings,
  onChange,
  className = '',
}: ContentRatingFilterProps) {
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
      <label className="block text-sm font-medium text-apple-text-primary">Content Rating</label>

      <div className="flex flex-wrap gap-2">
        {CONTENT_RATINGS.map((rating) => {
          const isSelected = selectedRatings.includes(rating);

          return (
            <button
              key={rating}
              onClick={() => handleRatingToggle(rating)}
              role="checkbox"
              aria-checked={isSelected}
              title={RATING_DESCRIPTIONS[rating]}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                isSelected
                  ? 'bg-apple-accent text-white shadow-md'
                  : 'bg-apple-bg-secondary text-apple-text-secondary hover:bg-apple-bg-tertiary'
              }`}
            >
              {rating}
            </button>
          );
        })}
      </div>

      {/* Description of selected rating */}
      {selectedRatings.length === 1 && (
        <p className="text-xs text-apple-text-tertiary">
          {RATING_DESCRIPTIONS[selectedRatings[0]]}
        </p>
      )}
      {selectedRatings.length > 1 && (
        <p className="text-xs text-apple-text-tertiary">
          {selectedRatings.length} ratings selected
        </p>
      )}
    </div>
  );
}
