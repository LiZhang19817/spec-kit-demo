/**
 * Component tests for MovieCard
 * Tests movie card display and interactions
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MovieCard from '@/components/movie/MovieCard';
import { Movie } from '@/types/movie';

const mockMovie: Movie = {
  id: 'inception-2010',
  title: 'Inception',
  genres: ['Sci-Fi', 'Thriller'],
  releaseYear: 2010,
  rating: 4.5,
  thumbnailUrl: 'https://example.com/inception.jpg',
  description: 'A mind-bending thriller',
  runtime: 148,
  director: 'Christopher Nolan',
  cast: ['Leonardo DiCaprio'],
};

describe('MovieCard', () => {
  it('should render movie title', () => {
    render(<MovieCard movie={mockMovie} isFavorite={false} onFavoriteToggle={jest.fn()} />);
    expect(screen.getByText('Inception')).toBeInTheDocument();
  });

  it('should render movie poster image', () => {
    render(<MovieCard movie={mockMovie} isFavorite={false} onFavoriteToggle={jest.fn()} />);
    const img = screen.getByRole('img', { name: /inception/i });
    expect(img).toHaveAttribute('src', mockMovie.thumbnailUrl);
  });

  it('should display release year', () => {
    render(<MovieCard movie={mockMovie} isFavorite={false} onFavoriteToggle={jest.fn()} />);
    expect(screen.getByText('2010')).toBeInTheDocument();
  });

  it('should display rating', () => {
    render(<MovieCard movie={mockMovie} isFavorite={false} onFavoriteToggle={jest.fn()} />);
    expect(screen.getByText(/4\.5/)).toBeInTheDocument();
  });

  it('should display genres', () => {
    render(<MovieCard movie={mockMovie} isFavorite={false} onFavoriteToggle={jest.fn()} />);
    expect(screen.getByText(/Sci-Fi/)).toBeInTheDocument();
    expect(screen.getByText(/Thriller/)).toBeInTheDocument();
  });

  it('should call onClick when card is clicked', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(
      <MovieCard
        movie={mockMovie}
        isFavorite={false}
        onFavoriteToggle={jest.fn()}
        onClick={handleClick}
      />
    );

    await user.click(screen.getByText('Inception'));
    expect(handleClick).toHaveBeenCalledWith(mockMovie.id);
  });

  it('should call onFavoriteToggle when favorite button clicked', async () => {
    const handleFavorite = jest.fn();
    const user = userEvent.setup();

    render(
      <MovieCard
        movie={mockMovie}
        isFavorite={false}
        onFavoriteToggle={handleFavorite}
      />
    );

    const favoriteButton = screen.getByRole('button', { name: /favorite/i });
    await user.click(favoriteButton);

    expect(handleFavorite).toHaveBeenCalledWith(mockMovie.id);
  });

  it('should show filled heart when isFavorite is true', () => {
    render(
      <MovieCard
        movie={mockMovie}
        isFavorite={true}
        onFavoriteToggle={jest.fn()}
      />
    );

    const favoriteButton = screen.getByRole('button', { name: /favorite/i });
    expect(favoriteButton).toHaveTextContent('❤️');
  });

  it('should show empty heart when isFavorite is false', () => {
    render(
      <MovieCard
        movie={mockMovie}
        isFavorite={false}
        onFavoriteToggle={jest.fn()}
      />
    );

    const favoriteButton = screen.getByRole('button', { name: /favorite/i });
    expect(favoriteButton).toHaveTextContent('🤍');
  });

  it('should have accessible card structure', () => {
    render(
      <MovieCard
        movie={mockMovie}
        isFavorite={false}
        onFavoriteToggle={jest.fn()}
      />
    );

    const card = screen.getByRole('article');
    expect(card).toBeInTheDocument();
  });
});
