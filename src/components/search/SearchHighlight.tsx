/**
 * SearchHighlight Component
 * Highlights search terms in text
 */

import { useMemo } from 'react';

export interface SearchHighlightProps {
  /** Text to highlight */
  text: string;

  /** Search term to highlight */
  searchTerm: string;

  /** Custom highlight class */
  highlightClass?: string;

  /** Additional CSS classes */
  className?: string;
}

/**
 * SearchHighlight component for highlighting search matches
 */
export default function SearchHighlight({
  text,
  searchTerm,
  highlightClass = 'bg-yellow-200 dark:bg-yellow-600',
  className = '',
}: SearchHighlightProps) {
  const highlighted = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) {
      return text;
    }

    try {
      // Escape special regex characters
      const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedTerm})`, 'gi');

      const parts = text.split(regex);

      return parts.map((part, index) => {
        if (part.toLowerCase() === searchTerm.toLowerCase()) {
          return (
            <mark key={index} className={highlightClass}>
              {part}
            </mark>
          );
        }
        return part;
      });
    } catch {
      return text;
    }
  }, [text, searchTerm, highlightClass]);

  return <span className={className}>{highlighted}</span>;
}
