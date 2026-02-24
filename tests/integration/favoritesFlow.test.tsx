/**
 * Integration Tests: Favorites Flow
 * Tests mark → persist → reload → verify workflow
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '@/App';
import { useFavoritesStore } from '@/store/favoritesStore';

describe('Favorites Flow Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    useFavoritesStore.getState().clearFavorites();
  });

  it('should mark a movie as favorite', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Browse Collection/i)).toBeInTheDocument();
    });

    // Find first movie card
    const movieCards = screen.getAllByRole('article');
    expect(movieCards.length).toBeGreaterThan(0);

    // Find and click favorite button
    const favoriteButton = movieCards[0].querySelector(
      'button[aria-label*="Add to favorites"]'
    );
    expect(favoriteButton).toBeInTheDocument();

    fireEvent.click(favoriteButton!);

    // Verify button changed to filled heart
    await waitFor(() => {
      const updatedButton = movieCards[0].querySelector(
        'button[aria-label*="Remove from favorites"]'
      );
      expect(updatedButton).toBeInTheDocument();
      expect(updatedButton).toHaveTextContent('❤️');
    });
  });

  it('should persist favorites to localStorage', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Browse Collection/i)).toBeInTheDocument();
    });

    const movieCards = screen.getAllByRole('article');

    // Mark first movie as favorite
    const favoriteButton = movieCards[0].querySelector(
      'button[aria-label*="Add to favorites"]'
    );
    fireEvent.click(favoriteButton!);

    // Check localStorage
    await waitFor(() => {
      const stored = localStorage.getItem('netflix-favorites');
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed.state.favorites).toHaveLength(1);
    });
  });

  it('should load favorites from localStorage on reload', async () => {
    // First render: Mark favorites
    const { unmount } = render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Browse Collection/i)).toBeInTheDocument();
    });

    const movieCards = screen.getAllByRole('article');

    // Mark first two movies as favorites
    const firstFavorite = movieCards[0].querySelector(
      'button[aria-label*="Add to favorites"]'
    );
    const secondFavorite = movieCards[1].querySelector(
      'button[aria-label*="Add to favorites"]'
    );

    fireEvent.click(firstFavorite!);
    fireEvent.click(secondFavorite!);

    // Wait for localStorage to update
    await waitFor(() => {
      const stored = localStorage.getItem('netflix-favorites');
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed.state.favorites).toHaveLength(2);
    });

    // Unmount and remount (simulate page reload)
    unmount();

    render(<App />);

    // Verify favorites persisted
    await waitFor(() => {
      const reloadedCards = screen.getAllByRole('article');

      const firstButton = reloadedCards[0].querySelector(
        'button[aria-label*="Remove from favorites"]'
      );
      const secondButton = reloadedCards[1].querySelector(
        'button[aria-label*="Remove from favorites"]'
      );

      expect(firstButton).toBeInTheDocument();
      expect(secondButton).toBeInTheDocument();
      expect(firstButton).toHaveTextContent('❤️');
      expect(secondButton).toHaveTextContent('❤️');
    });
  });

  it('should remove a movie from favorites', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Browse Collection/i)).toBeInTheDocument();
    });

    const movieCards = screen.getAllByRole('article');

    // Add favorite
    const favoriteButton = movieCards[0].querySelector(
      'button[aria-label*="Add to favorites"]'
    );
    fireEvent.click(favoriteButton!);

    // Verify added
    await waitFor(() => {
      const filledButton = movieCards[0].querySelector(
        'button[aria-label*="Remove from favorites"]'
      );
      expect(filledButton).toBeInTheDocument();
    });

    // Remove favorite
    const removeButton = movieCards[0].querySelector(
      'button[aria-label*="Remove from favorites"]'
    );
    fireEvent.click(removeButton!);

    // Verify removed
    await waitFor(() => {
      const emptyButton = movieCards[0].querySelector(
        'button[aria-label*="Add to favorites"]'
      );
      expect(emptyButton).toBeInTheDocument();
      expect(emptyButton).toHaveTextContent('🤍');
    });
  });

  it('should handle multiple favorites', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Browse Collection/i)).toBeInTheDocument();
    });

    const movieCards = screen.getAllByRole('article');

    // Mark multiple favorites
    for (let i = 0; i < Math.min(5, movieCards.length); i++) {
      const button = movieCards[i].querySelector(
        'button[aria-label*="Add to favorites"]'
      );
      if (button) {
        fireEvent.click(button);
      }
    }

    // Verify all marked
    await waitFor(() => {
      const stored = localStorage.getItem('netflix-favorites');
      const parsed = JSON.parse(stored!);
      expect(parsed.state.favorites.length).toBeGreaterThanOrEqual(5);
    });
  });

  it('should maintain favorites during search', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Browse Collection/i)).toBeInTheDocument();
    });

    // Mark first movie as favorite
    const movieCards = screen.getAllByRole('article');
    const favoriteButton = movieCards[0].querySelector(
      'button[aria-label*="Add to favorites"]'
    );
    fireEvent.click(favoriteButton!);

    // Perform search
    const searchInput = screen.getByPlaceholderText(/Search movies/i);
    fireEvent.change(searchInput, { target: { value: 'the' } });

    // Wait for search results
    await waitFor(
      () => {
        expect(screen.getByText(/Search Results/i)).toBeInTheDocument();
      },
      { timeout: 500 }
    );

    // Favorites should still be marked
    const searchResultCards = screen.getAllByRole('article');
    const favorited = searchResultCards.filter((card) =>
      card.querySelector('button[aria-label*="Remove from favorites"]')
    );

    expect(favorited.length).toBeGreaterThan(0);
  });

  it('should maintain favorites during filtering', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Browse Collection/i)).toBeInTheDocument();
    });

    // Mark first movie as favorite
    const movieCards = screen.getAllByRole('article');
    const favoriteButton = movieCards[0].querySelector(
      'button[aria-label*="Add to favorites"]'
    );
    fireEvent.click(favoriteButton!);

    // Apply genre filter
    const filterButton = screen.getByLabelText('Toggle filters');
    fireEvent.click(filterButton);

    const actionGenre = screen.getByText('Action');
    fireEvent.click(actionGenre);

    // Wait for filter to apply
    await waitFor(() => {
      const filteredCards = screen.getAllByRole('article');
      expect(filteredCards.length).toBeGreaterThan(0);
    });

    // Favorites should still be marked
    const filteredCards = screen.getAllByRole('article');
    const favorited = filteredCards.filter((card) =>
      card.querySelector('button[aria-label*="Remove from favorites"]')
    );

    expect(favorited.length).toBeGreaterThan(0);
  });

  it('should handle localStorage quota exceeded gracefully', async () => {
    // Fill localStorage to near capacity
    const largeString = 'x'.repeat(1024 * 1024); // 1MB
    for (let i = 0; i < 5; i++) {
      try {
        localStorage.setItem(`large-${i}`, largeString);
      } catch {
        // Quota exceeded, stop filling
        break;
      }
    }

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Browse Collection/i)).toBeInTheDocument();
    });

    const movieCards = screen.getAllByRole('article');

    // Try to add favorite (should not crash)
    const favoriteButton = movieCards[0].querySelector(
      'button[aria-label*="Add to favorites"]'
    );

    expect(() => fireEvent.click(favoriteButton!)).not.toThrow();
  });
});
