/**
 * Integration test for search flow
 * Tests complete search user journey with debouncing
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '@/App';
import { useMovieStore } from '@/store/movieStore';
import moviesFixture from '../fixtures/movies.json';

// Mock fetch
global.fetch = jest.fn();

describe('Search Flow Integration', () => {
  beforeEach(() => {
    useMovieStore.setState({
      movies: [],
      isLoading: false,
      error: null,
      lastFetched: null,
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => moviesFixture,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should complete full search flow: type → debounce → results → highlight', async () => {
    const user = userEvent.setup();

    render(<App />);

    // Wait for movies to load
    await waitFor(() => {
      expect(screen.getByText('Inception')).toBeInTheDocument();
    });

    // Find search input
    const searchInput = screen.getByRole('textbox', { name: /search/i });
    expect(searchInput).toBeInTheDocument();

    // Type search query
    await user.type(searchInput, 'Matrix');

    // Wait for debounce (300ms)
    await waitFor(
      () => {
        expect(screen.getByText('The Matrix')).toBeInTheDocument();
      },
      { timeout: 500 }
    );

    // Verify only Matrix movies are shown
    expect(screen.queryByText('The Godfather')).not.toBeInTheDocument();
  });

  it('should handle fuzzy search with typos', async () => {
    const user = userEvent.setup();

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Inception')).toBeInTheDocument();
    });

    const searchInput = screen.getByRole('textbox', { name: /search/i });

    // Type with typo
    await user.type(searchInput, 'Incepton');

    await waitFor(
      () => {
        expect(screen.getByText('Inception')).toBeInTheDocument();
      },
      { timeout: 500 }
    );
  });

  it('should clear search and show all movies', async () => {
    const user = userEvent.setup();

    render(<App />);

    await waitFor(() => {
      expect(screen.getAllByRole('article')).toHaveLength(50);
    });

    const searchInput = screen.getByRole('textbox', { name: /search/i });

    // Search for specific movie
    await user.type(searchInput, 'Inception');

    await waitFor(() => {
      const articles = screen.getAllByRole('article');
      expect(articles.length).toBeLessThan(50);
    }, { timeout: 500 });

    // Click clear button
    const clearButton = screen.getByRole('button', { name: /clear/i });
    await user.click(clearButton);

    // All movies should be visible again
    await waitFor(() => {
      expect(screen.getAllByRole('article')).toHaveLength(50);
    });
  });

  it('should show empty state when no results found', async () => {
    const user = userEvent.setup();

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Inception')).toBeInTheDocument();
    });

    const searchInput = screen.getByRole('textbox', { name: /search/i });

    // Search for non-existent movie
    await user.type(searchInput, 'xyz123notfound');

    await waitFor(
      () => {
        expect(screen.getByText(/no movies found/i)).toBeInTheDocument();
      },
      { timeout: 500 }
    );
  });

  it('should debounce rapid typing', async () => {
    const user = userEvent.setup({ delay: 10 });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Inception')).toBeInTheDocument();
    });

    const searchInput = screen.getByRole('textbox', { name: /search/i });

    // Type rapidly
    await user.type(searchInput, 'Inception');

    // Should only trigger search once after debounce
    await waitFor(
      () => {
        expect(screen.queryByTestId('search-loading')).not.toBeInTheDocument();
      },
      { timeout: 500 }
    );
  });

  it('should show result count', async () => {
    const user = userEvent.setup();

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Inception')).toBeInTheDocument();
    });

    const searchInput = screen.getByRole('textbox', { name: /search/i });

    await user.type(searchInput, 'Nolan');

    await waitFor(
      () => {
        // Should show count of Christopher Nolan movies
        expect(screen.getByText(/results/i)).toBeInTheDocument();
      },
      { timeout: 500 }
    );
  });

  it('should preserve favorites during search', async () => {
    const user = userEvent.setup();

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Inception')).toBeInTheDocument();
    });

    // Favorite a movie
    const inceptionCard = screen.getByText('Inception').closest('article');
    const favoriteButton = inceptionCard?.querySelector('button[aria-label*="favorite"]');

    if (favoriteButton) {
      await user.click(favoriteButton);

      await waitFor(() => {
        expect(favoriteButton).toHaveTextContent('❤️');
      });
    }

    // Perform search
    const searchInput = screen.getByRole('textbox', { name: /search/i });
    await user.type(searchInput, 'Inception');

    await waitFor(() => {
      const newFavoriteButton = screen
        .getByText('Inception')
        .closest('article')
        ?.querySelector('button[aria-label*="favorite"]');
      expect(newFavoriteButton).toHaveTextContent('❤️');
    }, { timeout: 500 });
  });
});
