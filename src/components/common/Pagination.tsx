/**
 * Pagination Component
 * Navigation controls for paginated content
 */

import { UsePaginationResult } from '@/hooks/usePagination';

export interface PaginationProps {
  /** Pagination state and controls from usePagination hook */
  pagination: UsePaginationResult;

  /** Show items per page selector */
  showItemsPerPage?: boolean;

  /** Available items per page options */
  itemsPerPageOptions?: number[];

  /** Additional CSS classes */
  className?: string;
}

/**
 * Pagination component with page numbers and navigation
 */
export default function Pagination({
  pagination,
  showItemsPerPage = true,
  itemsPerPageOptions = [12, 24, 48, 96],
  className = '',
}: PaginationProps) {
  const {
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    startIndex,
    endIndex,
    goToPage,
    nextPage,
    previousPage,
    setItemsPerPage,
    isFirstPage,
    isLastPage,
    visiblePages,
  } = pagination;

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* Left: Items info */}
      <div className="text-sm text-apple-text-secondary">
        Showing <span className="font-medium text-apple-text-primary">{startIndex + 1}</span> to{' '}
        <span className="font-medium text-apple-text-primary">{endIndex}</span> of{' '}
        <span className="font-medium text-apple-text-primary">{totalItems}</span> results
      </div>

      {/* Center: Page navigation */}
      <nav className="flex items-center gap-2" aria-label="Pagination" role="navigation">
        {/* Previous button */}
        <button
          onClick={previousPage}
          disabled={isFirstPage}
          aria-label="Previous page"
          className={`px-3 py-2 rounded-apple-md text-sm font-medium transition-all ${
            isFirstPage
              ? 'text-apple-text-tertiary cursor-not-allowed'
              : 'text-apple-text-primary hover:bg-apple-bg-secondary'
          }`}
        >
          ← Previous
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {/* First page if not visible */}
          {visiblePages[0] > 1 && (
            <>
              <button
                onClick={() => goToPage(1)}
                className="px-3 py-2 rounded-apple-md text-sm font-medium text-apple-text-primary hover:bg-apple-bg-secondary transition-all"
              >
                1
              </button>
              {visiblePages[0] > 2 && <span className="px-2 text-apple-text-tertiary">...</span>}
            </>
          )}

          {/* Visible page numbers */}
          {visiblePages.map((page) => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              aria-label={`Go to page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
              className={`px-3 py-2 rounded-apple-md text-sm font-medium transition-all ${
                page === currentPage
                  ? 'bg-apple-accent text-white shadow-md'
                  : 'text-apple-text-primary hover:bg-apple-bg-secondary'
              }`}
            >
              {page}
            </button>
          ))}

          {/* Last page if not visible */}
          {visiblePages[visiblePages.length - 1] < totalPages && (
            <>
              {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                <span className="px-2 text-apple-text-tertiary">...</span>
              )}
              <button
                onClick={() => goToPage(totalPages)}
                className="px-3 py-2 rounded-apple-md text-sm font-medium text-apple-text-primary hover:bg-apple-bg-secondary transition-all"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        {/* Next button */}
        <button
          onClick={nextPage}
          disabled={isLastPage}
          aria-label="Next page"
          className={`px-3 py-2 rounded-apple-md text-sm font-medium transition-all ${
            isLastPage
              ? 'text-apple-text-tertiary cursor-not-allowed'
              : 'text-apple-text-primary hover:bg-apple-bg-secondary'
          }`}
        >
          Next →
        </button>
      </nav>

      {/* Right: Items per page selector */}
      {showItemsPerPage && (
        <div className="flex items-center gap-2">
          <label htmlFor="items-per-page" className="text-sm text-apple-text-secondary">
            Per page:
          </label>
          <select
            id="items-per-page"
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="px-3 py-2 bg-apple-bg-secondary text-apple-text-primary rounded-apple-md text-sm font-medium border-none focus:outline-none focus:ring-2 focus:ring-apple-accent cursor-pointer"
          >
            {itemsPerPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
