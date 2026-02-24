/**
 * usePagination Hook
 * Custom hook for managing pagination state
 */

import { useState, useMemo } from 'react';

export interface UsePaginationResult {
  /** Current page number (1-indexed) */
  currentPage: number;

  /** Total number of pages */
  totalPages: number;

  /** Items per page */
  itemsPerPage: number;

  /** Total number of items */
  totalItems: number;

  /** Start index for current page (0-indexed) */
  startIndex: number;

  /** End index for current page (0-indexed) */
  endIndex: number;

  /** Go to specific page */
  goToPage: (page: number) => void;

  /** Go to next page */
  nextPage: () => void;

  /** Go to previous page */
  previousPage: () => void;

  /** Set items per page */
  setItemsPerPage: (count: number) => void;

  /** Check if on first page */
  isFirstPage: boolean;

  /** Check if on last page */
  isLastPage: boolean;

  /** Get visible page numbers for pagination controls */
  visiblePages: number[];
}

export interface UsePaginationOptions {
  /** Total number of items */
  totalItems: number;

  /** Initial items per page */
  initialItemsPerPage?: number;

  /** Maximum number of page buttons to show */
  maxVisiblePages?: number;
}

/**
 * Custom hook for pagination logic
 */
export function usePagination({
  totalItems,
  initialItemsPerPage = 24,
  maxVisiblePages = 5,
}: UsePaginationOptions): UsePaginationResult {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPageState] = useState(initialItemsPerPage);

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Ensure current page is valid
  const validCurrentPage = Math.min(currentPage, totalPages);

  // Calculate start and end indices
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  // Navigation functions
  const goToPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nextPage = () => {
    if (validCurrentPage < totalPages) {
      goToPage(validCurrentPage + 1);
    }
  };

  const previousPage = () => {
    if (validCurrentPage > 1) {
      goToPage(validCurrentPage - 1);
    }
  };

  const setItemsPerPage = (count: number) => {
    setItemsPerPageState(count);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Calculate visible page numbers
  const visiblePages = useMemo(() => {
    const pages: number[] = [];

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show subset with current page in center
      const halfVisible = Math.floor(maxVisiblePages / 2);
      let startPage = Math.max(1, validCurrentPage - halfVisible);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      // Adjust if near the end
      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  }, [validCurrentPage, totalPages, maxVisiblePages]);

  return {
    currentPage: validCurrentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    startIndex,
    endIndex,
    goToPage,
    nextPage,
    previousPage,
    setItemsPerPage,
    isFirstPage: validCurrentPage === 1,
    isLastPage: validCurrentPage === totalPages,
    visiblePages,
  };
}
