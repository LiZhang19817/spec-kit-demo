/**
 * Integration test for browse flow
 * Tests complete movie browsing user journey
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '@/App';
import { useMovieStore } from '@/store/movieStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import moviesFixture from '../fixtures/movies.json';

// Mock fetch
global.fetch = jest.fn();

describe('Browse Flow Integration', () => {
  beforeEach(() => {
    // Reset stores
    useMovieStore.setState({
      movies: [],
      isLoading: false,
      error: null,
      lastFetched: null,
    });

    useFavoritesStore.setState({
      favorites: new Set(),
    });

    // Mock successful movie fetch
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => moviesFixture,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should complete full browse flow: load → display → scroll → favorite', async () => {
    const user = userEvent.setup();

    render(<App />);

    // Step 1: Show loading state
    expect(screen.getByText(/loading movies/i)).toBeInTheDocument();

    // Step 2: Movies load and display
    await waitFor(() => {
      expect(screen.getByText('Inception')).toBeInTheDocument();
    });

    expect(screen.getByText('The Matrix')).toBeInTheDocument();
    expect(screen.getByText('The Dark Knight')).toBeInTheDocument();

    // Step 3: Verify movie count
    const movieCount = screen.getByText(/50 movies/i);
    expect(movieCount).toBeInTheDocument();

    // Step 4: Click favorite on a movie
    const inceptionCard = screen.getByText('Inception').closest('article');
    const favoriteButton = inceptionCard?.querySelector('button[aria-label*="favorite"]');

    if (favoriteButton) {
      await user.click(favoriteButton);

      // Verify favorite was added
      await waitFor(() => {
        expect(favoriteButton).toHaveTextContent('❤️');
      });
    }

    // Step 5: Verify no errors displayed
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  it('should display empty state when no movies loaded', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/no movies/i)).toBeInTheDocument();
    });
  });

  it('should display error state when loading fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load movies/i)).toBeInTheDocument();
    });

    // Verify retry button exists
    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('should retry loading when retry button clicked', async () => {
    const user = userEvent.setup();

    // First load fails
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load movies/i)).toBeInTheDocument();
    });

    // Mock successful retry
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => moviesFixture,
    });

    const retryButton = screen.getByRole('button', { name: /retry/i });
    await user.click(retryButton);

    // Verify movies loaded after retry
    await waitFor(() => {
      expect(screen.getByText('Inception')).toBeInTheDocument();
    });
  });

  it('should preserve favorite state across re-renders', async () => {
    const user = userEvent.setup();

    const { rerender } = render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Inception')).toBeInTheDocument();
    });

    // Add favorite
    const inceptionCard = screen.getByText('Inception').closest('article');
    const favoriteButton = inceptionCard?.querySelector('button[aria-label*="favorite"]');

    if (favoriteButton) {
      await user.click(favoriteButton);

      await waitFor(() => {
        expect(favoriteButton).toHaveTextContent('❤️');
      });

      // Re-render component
      rerender(<App />);

      // Verify favorite persisted
      await waitFor(() => {
        const newFavoriteButton = screen
          .getByText('Inception')
          .closest('article')
          ?.querySelector('button[aria-label*="favorite"]');
        expect(newFavoriteButton).toHaveTextContent('❤️');
      });
    }
  });

  it('should handle large movie collections smoothly', async () => {
    const largeCollection = Array.from({ length: 500 }, (_, i) => ({
      ...moviesFixture[0],
      id: `movie-${i}`,
      title: `Movie ${i}`,
    }));

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => largeCollection,
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/500 movies/i)).toBeInTheDocument();
    });

    // Verify virtualization is working (not all movies rendered)
    const movieCards = screen.queryAllByRole('article');
    expect(movieCards.length).toBeLessThan(500);
  });
});
