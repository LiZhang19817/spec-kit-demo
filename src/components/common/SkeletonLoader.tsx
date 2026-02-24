/**
 * SkeletonLoader Component
 * Loading skeleton with variants
 */

export interface SkeletonLoaderProps {
  /** Skeleton variant */
  variant: 'card' | 'text' | 'circle';

  /** Custom width */
  width?: string;

  /** Custom height */
  height?: string;

  /** Number of skeletons to render */
  count?: number;

  /** Additional CSS classes */
  className?: string;
}

/**
 * SkeletonLoader component for loading states
 */
export default function SkeletonLoader({
  variant,
  width,
  height,
  count = 1,
  className = '',
}: SkeletonLoaderProps) {
  const baseClasses = 'skeleton';

  const variantClasses = {
    card: 'rounded-apple-xl',
    text: 'rounded-apple-sm h-4',
    circle: 'rounded-full',
  };

  const defaultDimensions = {
    card: { width: '100%', height: '300px' },
    text: { width: '100%', height: '16px' },
    circle: { width: '48px', height: '48px' },
  };

  const dimensions = {
    width: width || defaultDimensions[variant].width,
    height: height || defaultDimensions[variant].height,
  };

  const skeletonClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  if (count === 1) {
    return <div className={skeletonClasses} style={dimensions} data-testid="skeleton-loader" />;
  }

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`${skeletonClasses} mb-2`}
          style={dimensions}
          data-testid="skeleton-loader"
        />
      ))}
    </>
  );
}
