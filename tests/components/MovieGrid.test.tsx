/**
 * Component tests for MovieGrid
 * Tests movie grid with virtualization
 */

import { render, screen } from '@testing-library/react';
import MovieGrid from '@/components/movie/MovieGrid';
import { Movie } from '@/types/movie';

const mockMovies: Movie[] = Array.from({ length: 50 }, (_, i) => ({
  id: `movie-${i}`,
  title: `Movie ${i}`,
  genres: ['Action'],
  releaseYear: 2020,
  rating: 4.0,
  thumbnailUrl: `https://example.com/${i}.jpg`,
  description: `Description ${i}`,
}));

describe('MovieGrid', () => {
  it('should render movies in a grid', () => {
    render(<MovieGrid movies={mockMovies.slice(0, 10)} favorites={new Set()} onFavoriteToggle={jest.fn()} />);

    expect(screen.getByText('Movie 0')).toBeInTheDocument();
    expect(screen.getByText('Movie 9')).toBeInTheDocument();
  });

  it('should render empty state when no movies', () => {
    render(<MovieGrid movies={[]} favorites={new Set()} onFavoriteToggle={jest.fn()} />);

    expect(screen.getByText(/no movies/i)).toBeInTheDocument();
  });

  it('should show loading skeleton when isLoading is true', () => {
    render(
      <MovieGrid
        movies={[]}
        favorites={new Set()}
        onFavoriteToggle={jest.fn()}
        isLoading={true}
      />
    );

    const skeletons = screen.getAllByTestId('skeleton-loader');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should pass favorite state to MovieCard', () => {
    const favorites = new Set(['movie-0', 'movie-2']);

    render(
      <MovieGrid
        movies={mockMovies.slice(0, 5)}
        favorites={favorites}
        onFavoriteToggle={jest.fn()}
      />
    );

    const favoriteButtons = screen.getAllByRole('button', { name: /favorite/i });
    expect(favoriteButtons[0]).toHaveTextContent('❤️');
    expect(favoriteButtons[1]).toHaveTextContent('🤍');
    expect(favoriteButtons[2]).toHaveTextContent('❤️');
  });

  it('should call onFavoriteToggle when favorite is clicked', async () => {
    const handleFavorite = jest.fn();

    render(
      <MovieGrid
        movies={mockMovies.slice(0, 1)}
        favorites={new Set()}
        onFavoriteToggle={handleFavorite}
      />
    );

    const favoriteButton = screen.getByRole('button', { name: /favorite/i });
    favoriteButton.click();

    expect(handleFavorite).toHaveBeenCalledWith('movie-0');
  });

  it('should use react-window for virtualization with many movies', () => {
    const { container } = render(
      <MovieGrid
        movies={mockMovies}
        favorites={new Set()}
        onFavoriteToggle={jest.fn()}
      />
    );

    // react-window creates a container with specific styling
    const virtualizedContainer = container.querySelector('[style*="position"]');
    expect(virtualizedContainer).toBeInTheDocument();
  });

  it('should handle onClick for movie cards', async () => {
    const handleClick = jest.fn();

    render(
      <MovieGrid
        movies={mockMovies.slice(0, 1)}
        favorites={new Set()}
        onFavoriteToggle={jest.fn()}
        onMovieClick={handleClick}
      />
    );

    const movieTitle = screen.getByText('Movie 0');
    movieTitle.click();

    expect(handleClick).toHaveBeenCalledWith('movie-0');
  });

  it('should apply responsive grid classes', () => {
    const { container } = render(
      <MovieGrid
        movies={mockMovies.slice(0, 10)}
        favorites={new Set()}
        onFavoriteToggle={jest.fn()}
      />
    );

    const grid = container.querySelector('[class*="grid"]');
    expect(grid).toBeInTheDocument();
  });
});
