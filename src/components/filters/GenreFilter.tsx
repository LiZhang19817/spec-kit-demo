/**
 * GenreFilter Component
 * Multi-select genre filter with pill buttons
 */

import { Genre, GENRES } from '@/types/movie';

export interface GenreFilterProps {
  /** Selected genres */
  selectedGenres: Genre[];

  /** Change handler */
  onChange: (genres: Genre[]) => void;

  /** Additional CSS classes */
  className?: string;
}

/**
 * GenreFilter component with Apple-style pill buttons
 */
export default function GenreFilter({
  selectedGenres,
  onChange,
  className = '',
}: GenreFilterProps) {
  const handleGenreToggle = (genre: Genre) => {
    const isSelected = selectedGenres.includes(genre);

    if (isSelected) {
      // Remove genre
      onChange(selectedGenres.filter((g) => g !== genre));
    } else {
      // Add genre
      onChange([...selectedGenres, genre]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, genre: Genre) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleGenreToggle(genre);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-apple-text-primary">Genre</h3>
        {selectedGenres.length > 0 && (
          <span className="text-xs text-apple-text-secondary">
            {selectedGenres.length} selected
          </span>
        )}
      </div>

      {/* Genre Pills */}
      <div className="flex flex-wrap gap-2">
        {GENRES.map((genre) => {
          const isSelected = selectedGenres.includes(genre);

          return (
            <button
              key={genre}
              onClick={() => handleGenreToggle(genre)}
              onKeyDown={(e) => handleKeyDown(e, genre)}
              role="checkbox"
              aria-checked={isSelected}
              className={`
                px-3 py-1.5 rounded-full text-sm font-medium
                transition-all duration-200
                ${
                  isSelected
                    ? 'bg-apple-accent text-white'
                    : 'bg-apple-bg-secondary text-apple-text-primary hover:bg-apple-bg-tertiary'
                }
                focus:outline-none focus:ring-2 focus:ring-apple-accent focus:ring-offset-2
              `}
            >
              {genre}
            </button>
          );
        })}
      </div>
    </div>
  );
}
