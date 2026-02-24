/**
 * YearFilter Component
 * Dual-handle range slider for year filtering
 */

import { useState, useEffect } from 'react';

export interface YearFilterProps {
  /** Minimum available year */
  minYear: number;

  /** Maximum available year */
  maxYear: number;

  /** Selected minimum year */
  selectedMinYear: number;

  /** Selected maximum year */
  selectedMaxYear: number;

  /** Change handler */
  onChange: (minYear: number, maxYear: number) => void;

  /** Additional CSS classes */
  className?: string;
}

/**
 * YearFilter component with dual-handle range slider
 */
export default function YearFilter({
  minYear,
  maxYear,
  selectedMinYear,
  selectedMaxYear,
  onChange,
  className = '',
}: YearFilterProps) {
  const [localMinYear, setLocalMinYear] = useState(selectedMinYear);
  const [localMaxYear, setLocalMaxYear] = useState(selectedMaxYear);

  // Sync with props
  useEffect(() => {
    setLocalMinYear(selectedMinYear);
    setLocalMaxYear(selectedMaxYear);
  }, [selectedMinYear, selectedMaxYear]);

  const handleMinChange = (value: number) => {
    const newMin = Math.min(value, localMaxYear);
    setLocalMinYear(newMin);
    onChange(newMin, localMaxYear);
  };

  const handleMaxChange = (value: number) => {
    const newMax = Math.max(value, localMinYear);
    setLocalMaxYear(newMax);
    onChange(localMinYear, newMax);
  };

  const handleReset = () => {
    onChange(minYear, maxYear);
  };

  const isFullRange = localMinYear === minYear && localMaxYear === maxYear;
  const displayLabel = isFullRange ? 'All Years' : `${localMinYear} - ${localMaxYear}`;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-apple-text-primary">Release Year</h3>
        {!isFullRange && (
          <button
            onClick={handleReset}
            className="text-xs text-apple-accent hover:underline focus:outline-none"
          >
            Reset
          </button>
        )}
      </div>

      {/* Display Label */}
      <div className="text-center">
        <span className="text-lg font-semibold text-apple-text-primary">{displayLabel}</span>
      </div>

      {/* Min Year Slider */}
      <div className="space-y-2">
        <label htmlFor="min-year-slider" className="block text-xs text-apple-text-secondary">
          From: {localMinYear}
        </label>
        <input
          id="min-year-slider"
          type="range"
          min={minYear}
          max={maxYear}
          value={localMinYear}
          onChange={(e) => handleMinChange(parseInt(e.target.value))}
          aria-label="Minimum year"
          className="w-full h-2 bg-apple-bg-tertiary rounded-lg appearance-none cursor-pointer accent-apple-accent"
        />
      </div>

      {/* Max Year Slider */}
      <div className="space-y-2">
        <label htmlFor="max-year-slider" className="block text-xs text-apple-text-secondary">
          To: {localMaxYear}
        </label>
        <input
          id="max-year-slider"
          type="range"
          min={minYear}
          max={maxYear}
          value={localMaxYear}
          onChange={(e) => handleMaxChange(parseInt(e.target.value))}
          aria-label="Maximum year"
          className="w-full h-2 bg-apple-bg-tertiary rounded-lg appearance-none cursor-pointer accent-apple-accent"
        />
      </div>

      {/* Year Range Display */}
      <div className="flex justify-between text-xs text-apple-text-secondary pt-1">
        <span>{minYear}</span>
        <span>{maxYear}</span>
      </div>
    </div>
  );
}
