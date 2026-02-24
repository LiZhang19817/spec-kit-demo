/**
 * Button Component
 * Apple-style button with variants
 */

import { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button visual variant */
  variant?: 'primary' | 'secondary' | 'ghost';

  /** Button size */
  size?: 'sm' | 'md' | 'lg';

  /** Loading state */
  isLoading?: boolean;

  /** Left icon */
  leftIcon?: ReactNode;

  /** Right icon */
  rightIcon?: ReactNode;

  /** Full width button */
  fullWidth?: boolean;
}

/**
 * Button component with Apple design
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 font-medium rounded-apple-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-apple-accent text-white hover:bg-opacity-90 focus:ring-apple-accent',
    secondary:
      'bg-apple-bg-secondary text-apple-text-primary hover:bg-apple-bg-tertiary focus:ring-apple-divider',
    ghost:
      'bg-transparent text-apple-text-primary hover:bg-apple-bg-secondary focus:ring-apple-divider',
  };

  const sizeClasses = {
    sm: 'px-4 py-1.5 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3 text-lg',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="animate-spin">⏳</span>
          Loading...
        </>
      ) : (
        <>
          {leftIcon && <span>{leftIcon}</span>}
          {children}
          {rightIcon && <span>{rightIcon}</span>}
        </>
      )}
    </button>
  );
}
