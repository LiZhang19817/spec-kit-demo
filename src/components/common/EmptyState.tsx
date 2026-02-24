/**
 * EmptyState Component
 * Display message when no data available
 */

import Button from './Button';

export interface EmptyStateProps {
  /** Title text */
  title: string;

  /** Description text */
  description: string;

  /** Optional icon (emoji or component) */
  icon?: string;

  /** Optional action button label */
  actionLabel?: string;

  /** Optional action button click handler */
  onAction?: () => void;

  /** Additional CSS classes */
  className?: string;
}

/**
 * EmptyState component for no-data scenarios
 */
export default function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      {icon && (
        <div className="text-6xl mb-4" role="img" aria-label="Empty state icon">
          {icon}
        </div>
      )}

      <h2 className="text-2xl font-semibold text-apple-text-primary mb-2">{title}</h2>

      <p className="text-apple-text-secondary mb-6 max-w-md mx-auto">{description}</p>

      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
