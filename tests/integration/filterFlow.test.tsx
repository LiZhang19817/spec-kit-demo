/**
 * Integration Tests: Filter Flow
 * Tests complete filter workflow (genre + year + rating)
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '@/App';

describe('Filter Flow Integration', () => {

  it('should filter movies by single genre', async () => {
    render(<App />);

    // Wait for movies to load
    await waitFor(() => {
      expect(screen.getByText(/Browse Collection/i)).toBeInTheDocument();
    });

    // Open filters
    const filterButton = screen.getByLabelText('Toggle filters');
    fireEvent.click(filterButton);

    // Select Action genre
    const actionButton = screen.getByText('Action');
    fireEvent.click(actionButton);

    // Verify filtered results
    await waitFor(() => {
      const movieCards = screen.getAllByRole('article');
      movieCards.forEach((card) => {
        expect(card.textContent).toMatch(/Action/i);
      });
    });
  });

  it('should filter movies by year range', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Browse Collection/i)).toBeInTheDocument();
    });

    // Open filters
    const filterButton = screen.getByLabelText('Toggle filters');
    fireEvent.click(filterButton);

    // Set year range 2015-2020
    const minYearSlider = screen.getByLabelText('Minimum year');
    const maxYearSlider = screen.getByLabelText('Maximum year');

    fireEvent.change(minYearSlider, { target: { value: '2015' } });
    fireEvent.change(maxYearSlider, { target: { value: '2020' } });

    // Verify filtered results
    await waitFor(() => {
      const movieCards = screen.getAllByRole('article');
      movieCards.forEach((card) => {
        const yearMatch = card.textContent?.match(/\b(20\d{2})\b/);
        if (yearMatch) {
          const year = parseInt(yearMatch[1]);
          expect(year).toBeGreaterThanOrEqual(2015);
          expect(year).toBeLessThanOrEqual(2020);
        }
      });
    });
  });

  it('should filter movies by minimum rating', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Browse Collection/i)).toBeInTheDocument();
    });

    // Open filters
    const filterButton = screen.getByLabelText('Toggle filters');
    fireEvent.click(filterButton);

    // Select 4+ stars
    const fourStars = screen.getByLabelText('4 stars and above');
    fireEvent.click(fourStars);

    // Verify filtered results
    await waitFor(() => {
      const ratingElements = screen.getAllByText(/★\s*\d\.\d/);
      ratingElements.forEach((element) => {
        const ratingMatch = element.textContent?.match(/\d\.\d/);
        if (ratingMatch) {
          const rating = parseFloat(ratingMatch[0]);
          expect(rating).toBeGreaterThanOrEqual(4.0);
        }
      });
    });
  });

  it('should combine genre + year filters', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Browse Collection/i)).toBeInTheDocument();
    });

    // Open filters
    const filterButton = screen.getByLabelText('Toggle filters');
    fireEvent.click(filterButton);

    // Select Action genre
    const actionButton = screen.getByText('Action');
    fireEvent.click(actionButton);

    // Set year range 2018-2022
    const minYearSlider = screen.getByLabelText('Minimum year');
    const maxYearSlider = screen.getByLabelText('Maximum year');

    fireEvent.change(minYearSlider, { target: { value: '2018' } });
    fireEvent.change(maxYearSlider, { target: { value: '2022' } });

    // Verify combined filters
    await waitFor(() => {
      const movieCards = screen.getAllByRole('article');
      expect(movieCards.length).toBeGreaterThan(0);

      movieCards.forEach((card) => {
        expect(card.textContent).toMatch(/Action/i);

        const yearMatch = card.textContent?.match(/\b(20\d{2})\b/);
        if (yearMatch) {
          const year = parseInt(yearMatch[1]);
          expect(year).toBeGreaterThanOrEqual(2018);
          expect(year).toBeLessThanOrEqual(2022);
        }
      });
    });
  });

  it('should combine all filters (genre + year + rating)', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Browse Collection/i)).toBeInTheDocument();
    });

    // Open filters
    const filterButton = screen.getByLabelText('Toggle filters');
    fireEvent.click(filterButton);

    // Select Drama genre
    const dramaButton = screen.getByText('Drama');
    fireEvent.click(dramaButton);

    // Set year range 2015-2023
    const minYearSlider = screen.getByLabelText('Minimum year');
    const maxYearSlider = screen.getByLabelText('Maximum year');

    fireEvent.change(minYearSlider, { target: { value: '2015' } });
    fireEvent.change(maxYearSlider, { target: { value: '2023' } });

    // Select 4+ stars
    const fourStars = screen.getByLabelText('4 stars and above');
    fireEvent.click(fourStars);

    // Verify all filters applied
    await waitFor(() => {
      const movieCards = screen.getAllByRole('article');

      movieCards.forEach((card) => {
        // Check genre
        expect(card.textContent).toMatch(/Drama/i);

        // Check year
        const yearMatch = card.textContent?.match(/\b(20\d{2})\b/);
        if (yearMatch) {
          const year = parseInt(yearMatch[1]);
          expect(year).toBeGreaterThanOrEqual(2015);
          expect(year).toBeLessThanOrEqual(2023);
        }

        // Check rating
        const ratingMatch = card.textContent?.match(/★\s*(\d\.\d)/);
        if (ratingMatch) {
          const rating = parseFloat(ratingMatch[1]);
          expect(rating).toBeGreaterThanOrEqual(4.0);
        }
      });
    });
  });

  it('should show empty state when filters match no movies', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Browse Collection/i)).toBeInTheDocument();
    });

    // Open filters
    const filterButton = screen.getByLabelText('Toggle filters');
    fireEvent.click(filterButton);

    // Set impossible filters (very high rating + narrow year range)
    const minYearSlider = screen.getByLabelText('Minimum year');
    const maxYearSlider = screen.getByLabelText('Maximum year');

    fireEvent.change(minYearSlider, { target: { value: '2024' } });
    fireEvent.change(maxYearSlider, { target: { value: '2024' } });

    const fiveStars = screen.getByLabelText('5 stars and above');
    fireEvent.click(fiveStars);

    // Verify empty state
    await waitFor(() => {
      expect(
        screen.getByText(/No movies match your filters/i)
      ).toBeInTheDocument();
    });
  });

  it('should clear all filters when "Clear All" clicked', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Browse Collection/i)).toBeInTheDocument();
    });

    // Get initial movie count
    const initialCards = screen.getAllByRole('article');
    const initialCount = initialCards.length;

    // Open filters
    const filterButton = screen.getByLabelText('Toggle filters');
    fireEvent.click(filterButton);

    // Apply multiple filters
    const actionButton = screen.getByText('Action');
    fireEvent.click(actionButton);

    const fourStars = screen.getByLabelText('4 stars and above');
    fireEvent.click(fourStars);

    // Verify filters reduced results
    await waitFor(() => {
      const filteredCards = screen.getAllByRole('article');
      expect(filteredCards.length).toBeLessThan(initialCount);
    });

    // Clear all filters
    const clearAllButton = screen.getByText('Clear All');
    fireEvent.click(clearAllButton);

    // Verify all movies shown again
    await waitFor(() => {
      const finalCards = screen.getAllByRole('article');
      expect(finalCards.length).toBe(initialCount);
    });
  });

  it('should show active filter count', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Browse Collection/i)).toBeInTheDocument();
    });

    // Open filters
    const filterButton = screen.getByLabelText('Toggle filters');
    fireEvent.click(filterButton);

    // Apply 3 filters
    const actionButton = screen.getByText('Action');
    fireEvent.click(actionButton);

    const minYearSlider = screen.getByLabelText('Minimum year');
    fireEvent.change(minYearSlider, { target: { value: '2015' } });

    const fourStars = screen.getByLabelText('4 stars and above');
    fireEvent.click(fourStars);

    // Verify count
    await waitFor(() => {
      expect(screen.getByText('3 active')).toBeInTheDocument();
    });
  });

  it('should display active filter badges', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Browse Collection/i)).toBeInTheDocument();
    });

    // Open filters
    const filterButton = screen.getByLabelText('Toggle filters');
    fireEvent.click(filterButton);

    // Apply filters
    const actionButton = screen.getByText('Action');
    const dramaButton = screen.getByText('Drama');
    fireEvent.click(actionButton);
    fireEvent.click(dramaButton);

    const fourStars = screen.getByLabelText('4 stars and above');
    fireEvent.click(fourStars);

    // Verify badges
    await waitFor(() => {
      expect(screen.getByText('Action, Drama')).toBeInTheDocument();
      expect(screen.getByText('4.0+ rating')).toBeInTheDocument();
    });
  });

  it('should remove individual filter badge', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Browse Collection/i)).toBeInTheDocument();
    });

    // Open filters and apply
    const filterButton = screen.getByLabelText('Toggle filters');
    fireEvent.click(filterButton);

    const actionButton = screen.getByText('Action');
    fireEvent.click(actionButton);

    const fourStars = screen.getByLabelText('4 stars and above');
    fireEvent.click(fourStars);

    // Verify 2 active filters
    await waitFor(() => {
      expect(screen.getByText('2 active')).toBeInTheDocument();
    });

    // Remove rating badge
    const ratingBadge = screen.getByText('4.0+ rating').closest('button');
    const removeIcon = ratingBadge?.querySelector('[aria-label="Remove filter"]');

    if (removeIcon) {
      fireEvent.click(removeIcon);
    }

    // Verify only 1 active filter
    await waitFor(() => {
      expect(screen.getByText('1 active')).toBeInTheDocument();
      expect(screen.queryByText('4.0+ rating')).not.toBeInTheDocument();
    });
  });
});
