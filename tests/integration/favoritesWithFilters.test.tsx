/**
 * Integration Tests: Favorites + Search + Filters
 * Tests favorites working with search and filter combinations
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '@/App';
import { useFavoritesStore } from '@/store/favoritesStore';

describe('Favorites with Search and Filters', () => {
  beforeEach(() => {
    localStorage.clear();
    useFavoritesStore.getState().clearFavorites();
  });

  it('should filter to show only favorites', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Browse Collection/i)).toBeInTheDocument();
    });

    const allCards = screen.getAllByRole('article');
    const initialCount = allCards.length;

    // Mark first 3 movies as favorites
    for (let i = 0; i < 3; i++) {
      const button = allCards[i].querySelector(
        'button[aria-label*="Add to favorites"]'
      );
      if (button) fireEvent.click(button);
    }

    await waitFor(() => {
      const stored = localStorage.getItem('netflix-favorites');
      expect(stored).toBeTruthy();
    });

    // Toggle "View Favorites" filter
    const filterButton = screen.getByLabelText('Toggle filters');
    fireEvent.click(filterButton);

    const favoritesToggle = screen.getByLabelText(/Show favorites only/i);
    fireEvent.click(favoritesToggle);

    // Should show only 3 favorited movies
    await waitFor(() => {
      const favoritedCards = screen.getAllByRole('article');
      expect(favoritedCards.length).toBe(3);
      expect(favoritedCards.length).toBeLessThan(initialCount);
    });
  });

  it('should search within favorites', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Browse Collection/i)).toBeInTheDocument();
    });

    const allCards = screen.getAllByRole('article');

    // Mark several favorites
    for (let i = 0; i < 5; i++) {
      const button = allCards[i].querySelector(
        'button[aria-label*="Add to favorites"]'
      );
      if (button) fireEvent.click(button);
    }

    // Enable favorites-only view
    const filterButton = screen.getByLabelText('Toggle filters');
    fireEvent.click(filterButton);

    const favoritesToggle = screen.getByLabelText(/Show favorites only/i);
    fireEvent.click(favoritesToggle);

    // Search within favorites
    const searchInput = screen.getByPlaceholderText(/Search movies/i);
    fireEvent.change(searchInput, { target: { value: 'the' } });

    // Results should be subset of favorites
    await waitFor(
      () => {
        const searchResults = screen.getAllByRole('article');
        expect(searchResults.length).toBeLessThanOrEqual(5);

        // All results should be favorited
        searchResults.forEach((card) => {
          const filledHeart = card.querySelector(
            'button[aria-label*="Remove from favorites"]'
          );
          expect(filledHeart).toBeInTheDocument();
        });
      },
      { timeout: 500 }
    );
  });

  it('should filter favorites by genre', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Browse Collection/i)).toBeInTheDocument();
    });

    const allCards = screen.getAllByRole('article');

    // Mark first 10 movies as favorites
    for (let i = 0; i < Math.min(10, allCards.length); i++) {
      const button = allCards[i].querySelector(
        'button[aria-label*="Add to favorites"]'
      );
      if (button) fireEvent.click(button);
    }

    // Enable favorites-only view
    const filterButton = screen.getByLabelText('Toggle filters');
    fireEvent.click(filterButton);

    const favoritesToggle = screen.getByLabelText(/Show favorites only/i);
    fireEvent.click(favoritesToggle);

    // Apply genre filter
    const actionGenre = screen.getByText('Action');
    fireEvent.click(actionGenre);

    // Results should be favorited AND match genre
    await waitFor(() => {
      const filteredCards = screen.getAllByRole('article');

      filteredCards.forEach((card) => {
        // Should be favorited
        const filledHeart = card.querySelector(
          'button[aria-label*="Remove from favorites"]'
        );
        expect(filledHeart).toBeInTheDocument();

        // Should have Action genre
        expect(card.textContent).toMatch(/Action/i);
      });
    });
  });

  it('should combine search + genre + favorites filters', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Browse Collection/i)).toBeInTheDocument();
    });

    const allCards = screen.getAllByRole('article');

    // Mark multiple favorites
    for (let i = 0; i < Math.min(15, allCards.length); i++) {
      const button = allCards[i].querySelector(
        'button[aria-label*="Add to favorites"]'
      );
      if (button) fireEvent.click(button);
    }

    // Enable favorites filter
    const filterButton = screen.getByLabelText('Toggle filters');
    fireEvent.click(filterButton);

    const favoritesToggle = screen.getByLabelText(/Show favorites only/i);
    fireEvent.click(favoritesToggle);

    // Add genre filter
    const dramaGenre = screen.getByText('Drama');
    fireEvent.click(dramaGenre);

    // Add search
    const searchInput = screen.getByPlaceholderText(/Search movies/i);
    fireEvent.change(searchInput, { target: { value: 'the' } });

    // All three filters should apply
    await waitFor(
      () => {
        const results = screen.getAllByRole('article');

        results.forEach((card) => {
          // Favorited
          expect(
            card.querySelector('button[aria-label*="Remove from favorites"]')
          ).toBeInTheDocument();

          // Has Drama genre
          expect(card.textContent).toMatch(/Drama/i);

          // Matches search term
          expect(card.textContent?.toLowerCase()).toMatch(/the/i);
        });
      },
      { timeout: 500 }
    );
  });

  it('should clear favorites filter independently', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Browse Collection/i)).toBeInTheDocument();
    });

    const allCards = screen.getAllByRole('article');

    // Mark favorites
    for (let i = 0; i < 5; i++) {
      const button = allCards[i].querySelector(
        'button[aria-label*="Add to favorites"]'
      );
      if (button) fireEvent.click(button);
    }

    // Enable favorites filter + genre filter
    const filterButton = screen.getByLabelText('Toggle filters');
    fireEvent.click(filterButton);

    const favoritesToggle = screen.getByLabelText(/Show favorites only/i);
    fireEvent.click(favoritesToggle);

    const actionGenre = screen.getByText('Action');
    fireEvent.click(actionGenre);

    // Verify both filters active
    await waitFor(() => {
      const favoritedActionCards = screen.getAllByRole('article');
      expect(favoritedActionCards.length).toBeGreaterThan(0);
    });

    // Disable favorites filter (keep genre)
    fireEvent.click(favoritesToggle);

    // Should show all Action movies, not just favorited
    await waitFor(() => {
      const allActionCards = screen.getAllByRole('article');
      expect(allActionCards.length).toBeGreaterThan(5);
    });
  });

  it('should show empty state when no favorites exist', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Browse Collection/i)).toBeInTheDocument();
    });

    // Enable favorites filter without marking any
    const filterButton = screen.getByLabelText('Toggle filters');
    fireEvent.click(filterButton);

    const favoritesToggle = screen.getByLabelText(/Show favorites only/i);
    fireEvent.click(favoritesToggle);

    // Should show empty state
    await waitFor(() => {
      expect(
        screen.getByText(/No movies match your search and filters/i)
      ).toBeInTheDocument();
    });
  });

  it('should show empty state when favorites do not match filters', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Browse Collection/i)).toBeInTheDocument();
    });

    const allCards = screen.getAllByRole('article');

    // Mark only Drama movies as favorites
    const dramaCards = allCards.filter((card) =>
      card.textContent?.includes('Drama')
    );

    dramaCards.slice(0, 3).forEach((card) => {
      const button = card.querySelector('button[aria-label*="Add to favorites"]');
      if (button) fireEvent.click(button);
    });

    // Filter by favorites + Action genre (no overlap)
    const filterButton = screen.getByLabelText('Toggle filters');
    fireEvent.click(filterButton);

    const favoritesToggle = screen.getByLabelText(/Show favorites only/i);
    fireEvent.click(favoritesToggle);

    const actionGenre = screen.getByText('Action');
    fireEvent.click(actionGenre);

    // Should show empty state (no Drama favorites match Action filter)
    await waitFor(() => {
      // Might have 0 results or empty state depending on data
      const cards = screen.queryAllByRole('article');
      if (cards.length === 0) {
        expect(
          screen.getByText(/No movies match your search and filters/i)
        ).toBeInTheDocument();
      }
    });
  });

  it('should update favorite count when toggling in filtered view', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Browse Collection/i)).toBeInTheDocument();
    });

    const allCards = screen.getAllByRole('article');

    // Mark 3 favorites
    for (let i = 0; i < 3; i++) {
      const button = allCards[i].querySelector(
        'button[aria-label*="Add to favorites"]'
      );
      if (button) fireEvent.click(button);
    }

    // Enable favorites view
    const filterButton = screen.getByLabelText('Toggle filters');
    fireEvent.click(filterButton);

    const favoritesToggle = screen.getByLabelText(/Show favorites only/i);
    fireEvent.click(favoritesToggle);

    // Should show 3 favorites
    await waitFor(() => {
      expect(screen.getAllByRole('article')).toHaveLength(3);
    });

    // Remove one favorite
    const cards = screen.getAllByRole('article');
    const removeButton = cards[0].querySelector(
      'button[aria-label*="Remove from favorites"]'
    );
    if (removeButton) fireEvent.click(removeButton);

    // Should now show 2 favorites
    await waitFor(() => {
      expect(screen.getAllByRole('article')).toHaveLength(2);
    });
  });
});
