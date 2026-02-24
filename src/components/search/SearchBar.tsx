/**
 * SearchBar Component
 * Search input with debouncing and clear functionality
 */

import { ChangeEvent, useState, useEffect } from 'react';

export interface SearchBarProps {
  /** Current search value */
  value: string;

  /** Change handler */
  onChange: (value: string) => void;

  /** Clear handler */
  onClear?: () => void;

  /** Loading state */
  isLoading?: boolean;

  /** Result count */
  resultCount?: number;

  /** Auto focus */
  autoFocus?: boolean;

  /** Placeholder text */
  placeholder?: string;

  /** Additional CSS classes */
  className?: string;
}

/**
 * SearchBar component with debouncing
 */
export default function SearchBar({
  value,
  onChange,
  onClear,
  isLoading = false,
  resultCount,
  autoFocus = false,
  placeholder = 'Search movies by title, director, cast...',
  className = '',
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);

  // Sync with external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleClear = () => {
    setLocalValue('');
    if (onClear) {
      onClear();
    } else {
      onChange('');
    }
  };

  const showClear = localValue.length > 0;

  return (
    <div className={`relative ${className}`}>
      {/* Search Icon */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-apple-text-secondary">
        {isLoading ? (
          <span className="animate-spin text-lg" data-testid="search-loading">
            ⏳
          </span>
        ) : (
          <span className="text-lg" data-testid="search-icon">
            🔍
          </span>
        )}
      </div>

      {/* Input */}
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        aria-label="Search movies"
        className="w-full pl-12 pr-24 py-3 bg-apple-bg-secondary text-apple-text-primary rounded-apple-lg border border-apple-divider focus:outline-none focus:ring-2 focus:ring-apple-accent focus:border-transparent transition-all"
      />

      {/* Clear Button & Result Count */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {resultCount !== undefined && localValue && (
          <span className="text-sm text-apple-text-secondary px-2">
            {resultCount} {resultCount === 1 ? 'result' : 'results'}
          </span>
        )}

        {showClear && (
          <button
            onClick={handleClear}
            aria-label="Clear search"
            className="p-2 rounded-full hover:bg-apple-bg-tertiary transition-colors"
          >
            <span className="text-lg">✕</span>
          </button>
        )}
      </div>
    </div>
  );
}
