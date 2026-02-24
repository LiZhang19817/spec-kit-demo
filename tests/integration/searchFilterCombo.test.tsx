/**
 * Integration Tests: Search + Filter Combination
 * Tests search and filter working together
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '@/App';

describe('Search + Filter Combination', () => {

  it('should combine search with genre filter', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Browse Collection/i)).toBeInTheDocument();
    });

    // Search for "the"
    const searchInput = screen.getByPlaceholderText(
      /Search movies by title/i
    );
    fireEvent.change(searchInput, { target: { value: 'the' } });

    // Wait for debounce
    await waitFor(
      () => {
        expect(screen.getByText(/Search Results/i)).toBeInTheDocument();
      },
      { timeout: 500 }
    );

    const searchResultCount = screen.getAllByRole('article').length;

    // Apply genre filter
    const filterButton = screen.getByLabelText('Toggle filters');
    fireEvent.click(filterButton);

    const actionButton = screen.getByText('Action');
    fireEvent.click(actionButton);

    // Verify results narrowed
    await waitFor(() => {
      const filteredCards = screen.getAllByRole('article');
      expect(filteredCards.length).toBeLessThanOrEqual(searchResultCount);

      filteredCards.forEach((card) => {
        expect(card.textContent).toMatch(/the/i);
        expect(card.textContent).toMatch(/Action/i);
      });
    });
  });

  it('should combine search with year range filter', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Browse Collection/i)).toBeInTheDocument();
    });

    // Search for "man"
    const searchInput = screen.getByPlaceholderText(
      /Search movies by title/i
    );
    fireEvent.change(searchInput, { target: { value: 'man' } });

    await waitFor(
      () => {
        expect(screen.getByText(/Search Results/i)).toBeInTheDocument();
      },
      { timeout: 500 }
    );

    // Apply year filter
    const filterButton = screen.getByLabelText('Toggle filters');
    fireEvent.click(filterButton);

    const minYearSlider = screen.getByLabelText('Minimum year');
    const maxYearSlider = screen.getByLabelText('Maximum year');

    fireEvent.change(minYearSlider, { target: { value: '2015' } });
    fireEvent.change(maxYearSlider, { target: { value: '2020' } });

    // Verify combined search + year filter
    await waitFor(() => {
      const filteredCards = screen.getAllByRole('article');

      filteredCards.forEach((card) => {
        expect(card.textContent).toMatch(/man/i);

        const yearMatch = card.textContent?.match(/\b(20\d{2})\b/);
        if (yearMatch) {
          const year = parseInt(yearMatch[1]);
          expect(year).toBeGreaterThanOrEqual(2015);
          expect(year).toBeLessThanOrEqual(2020);
        }
      });
    });
  });

  it('should combine search with rating filter', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Browse Collection/i)).toBeInTheDocument();
    });

    // Search for "star"
    const searchInput = screen.getByPlaceholderText(
      /Search movies by title/i
    );
    fireEvent.change(searchInput, { target: { value: 'star' } });

    await waitFor(
      () => {
        expect(screen.getByText(/Search Results/i)).toBeInTheDocument();
      },
      { timeout: 500 }
    );

    // Apply rating filter
    const filterButton = screen.getByLabelText('Toggle filters');
    fireEvent.click(filterButton);

    const fourStars = screen.getByLabelText('4 stars and above');
    fireEvent.click(fourStars);

    // Verify combined search + rating filter
    await waitFor(() => {
      const filteredCards = screen.getAllByRole('article');

      filteredCards.forEach((card) => {
        expect(card.textContent).toMatch(/star/i);

        const ratingMatch = card.textContent?.match(/★\s*(\d\.\d)/);
        if (ratingMatch) {
          const rating = parseFloat(ratingMatch[1]);
          expect(rating).toBeGreaterThanOrEqual(4.0);
        }
      });
    });
  });

  it('should combine search with all filters', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Browse Collection/i)).toBeInTheDocument();
    });

    // Search
    const searchInput = screen.getByPlaceholderText(
      /Search movies by title/i
    );
    fireEvent.change(searchInput, { target: { value: 'the' } });

    await waitFor(
      () => {
        expect(screen.getByText(/Search Results/i)).toBeInTheDocument();
      },
      { timeout: 500 }
    );

    // Apply all filters
    const filterButton = screen.getByLabelText('Toggle filters');
    fireEvent.click(filterButton);

    const dramaButton = screen.getByText('Drama');
    fireEvent.click(dramaButton);

    const minYearSlider = screen.getByLabelText('Minimum year');
    fireEvent.change(minYearSlider, { target: { value: '2015' } });

    const fourStars = screen.getByLabelText('4 stars and above');
    fireEvent.click(fourStars);

    // Verify all criteria applied
    await waitFor(() => {
      const filteredCards = screen.getAllByRole('article');

      filteredCards.forEach((card) => {
        expect(card.textContent).toMatch(/the/i);
        expect(card.textContent).toMatch(/Drama/i);

        const yearMatch = card.textContent?.match(/\b(20\d{2})\b/);
        if (yearMatch) {
          const year = parseInt(yearMatch[1]);
          expect(year).toBeGreaterThanOrEqual(2015);
        }

        const ratingMatch = card.textContent?.match(/★\s*(\d\.\d)/);
        if (ratingMatch) {
          const rating = parseFloat(ratingMatch[1]);
          expect(rating).toBeGreaterThanOrEqual(4.0);
        }
      });
    });
  });

  it('should clear search but preserve filters', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Browse Collection/i)).toBeInTheDocument();
    });

    // Apply search and filter
    const searchInput = screen.getByPlaceholderText(
      /Search movies by title/i
    );
    fireEvent.change(searchInput, { target: { value: 'the' } });

    await waitFor(
      () => {
        expect(screen.getByText(/Search Results/i)).toBeInTheDocument();
      },
      { timeout: 500 }
    );

    const filterButton = screen.getByLabelText('Toggle filters');
    fireEvent.click(filterButton);

    const actionButton = screen.getByText('Action');
    fireEvent.click(actionButton);

    // Clear search
    const clearButton = screen.getByLabelText('Clear search');
    fireEvent.click(clearButton);

    // Verify filters still applied
    await waitFor(() => {
      expect(screen.getByText(/Browse Collection/i)).toBeInTheDocument();

      const movieCards = screen.getAllByRole('article');
      movieCards.forEach((card) => {
        expect(card.textContent).toMatch(/Action/i);
      });
    });
  });

  it('should clear filters but preserve search', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Browse Collection/i)).toBeInTheDocument();
    });

    // Apply search and filter
    const searchInput = screen.getByPlaceholderText(
      /Search movies by title/i
    );
    fireEvent.change(searchInput, { target: { value: 'man' } });

    await waitFor(
      () => {
        expect(screen.getByText(/Search Results/i)).toBeInTheDocument();
      },
      { timeout: 500 }
    );

    const filterButton = screen.getByLabelText('Toggle filters');
    fireEvent.click(filterButton);

    const actionButton = screen.getByText('Action');
    fireEvent.click(actionButton);

    // Clear filters
    const clearAllButton = screen.getByText('Clear All');
    fireEvent.click(clearAllButton);

    // Verify search still active
    await waitFor(() => {
      expect(screen.getByText(/Search Results/i)).toBeInTheDocument();

      const movieCards = screen.getAllByRole('article');
      movieCards.forEach((card) => {
        expect(card.textContent).toMatch(/man/i);
      });
    });
  });

  it('should show empty state when search + filters match nothing', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Browse Collection/i)).toBeInTheDocument();
    });

    // Search for something rare
    const searchInput = screen.getByPlaceholderText(
      /Search movies by title/i
    );
    fireEvent.change(searchInput, { target: { value: 'zzz' } });

    await waitFor(
      () => {
        expect(screen.getByText(/Search Results/i)).toBeInTheDocument();
      },
      { timeout: 500 }
    );

    // Apply restrictive filters
    const filterButton = screen.getByLabelText('Toggle filters');
    fireEvent.click(filterButton);

    const fiveStars = screen.getByLabelText('5 stars and above');
    fireEvent.click(fiveStars);

    // Verify empty state
    await waitFor(() => {
      expect(
        screen.getByText(/No movies match your search and filters/i)
      ).toBeInTheDocument();
    });
  });

  it('should update result count with search + filters', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Browse Collection/i)).toBeInTheDocument();
    });

    // Get initial count
    const initialCards = screen.getAllByRole('article');
    const initialCount = initialCards.length;

    // Apply search
    const searchInput = screen.getByPlaceholderText(
      /Search movies by title/i
    );
    fireEvent.change(searchInput, { target: { value: 'the' } });

    await waitFor(
      () => {
        expect(screen.getByText(/Search Results/i)).toBeInTheDocument();
      },
      { timeout: 500 }
    );

    const searchCount = screen.getAllByRole('article').length;

    // Apply filter
    const filterButton = screen.getByLabelText('Toggle filters');
    fireEvent.click(filterButton);

    const actionButton = screen.getByText('Action');
    fireEvent.click(actionButton);

    // Verify count updated
    await waitFor(() => {
      const finalCount = screen.getAllByRole('article').length;
      expect(finalCount).toBeLessThanOrEqual(searchCount);
      expect(finalCount).toBeLessThanOrEqual(initialCount);

      // Result count should be displayed
      expect(screen.getByText(new RegExp(`${finalCount} movies?`))).toBeInTheDocument();
    });
  });

  it('should highlight search terms in filtered results', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Browse Collection/i)).toBeInTheDocument();
    });

    // Search
    const searchInput = screen.getByPlaceholderText(
      /Search movies by title/i
    );
    fireEvent.change(searchInput, { target: { value: 'man' } });

    await waitFor(
      () => {
        expect(screen.getByText(/Search Results/i)).toBeInTheDocument();
      },
      { timeout: 500 }
    );

    // Apply filter
    const filterButton = screen.getByLabelText('Toggle filters');
    fireEvent.click(filterButton);

    const dramaButton = screen.getByText('Drama');
    fireEvent.click(dramaButton);

    // Verify highlights exist
    await waitFor(() => {
      const highlights = screen.getAllByRole('article');
      expect(highlights.length).toBeGreaterThan(0);

      highlights.forEach((card) => {
        const markElements = card.querySelectorAll('mark');
        expect(markElements.length).toBeGreaterThan(0);
      });
    });
  });
});
