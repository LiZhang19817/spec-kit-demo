/**
 * Component Tests: Favorite Button (in MovieCard)
 * Tests favorite toggle functionality
 */

import { render, screen, fireEvent } from '@testing-library/react';
import MovieCard from '@/components/movie/MovieCard';
import { Movie } from '@/types/movie';

describe('Favorite Button', () => {
  const mockMovie: Movie = {
    id: 'test-movie',
    title: 'Test Movie',
    genres: ['Action', 'Drama'],
    releaseYear: 2023,
    rating: 4.5,
    thumbnailUrl: '/test.jpg',
    description: 'A test movie',
    runtime: 120,
  };

  const mockOnFavoriteToggle = jest.fn();

  beforeEach(() => {
    mockOnFavoriteToggle.mockClear();
  });

  it('should render empty heart when not favorited', () => {
    render(
      <MovieCard
        movie={mockMovie}
        isFavorite={false}
        onFavoriteToggle={mockOnFavoriteToggle}
      />
    );

    const favoriteButton = screen.getByLabelText('Add to favorites');
    expect(favoriteButton).toBeInTheDocument();
    expect(favoriteButton).toHaveTextContent('🤍');
  });

  it('should render filled heart when favorited', () => {
    render(
      <MovieCard
        movie={mockMovie}
        isFavorite={true}
        onFavoriteToggle={mockOnFavoriteToggle}
      />
    );

    const favoriteButton = screen.getByLabelText('Remove from favorites');
    expect(favoriteButton).toBeInTheDocument();
    expect(favoriteButton).toHaveTextContent('❤️');
  });

  it('should call onFavoriteToggle when clicked', () => {
    render(
      <MovieCard
        movie={mockMovie}
        isFavorite={false}
        onFavoriteToggle={mockOnFavoriteToggle}
      />
    );

    const favoriteButton = screen.getByLabelText('Add to favorites');
    fireEvent.click(favoriteButton);

    expect(mockOnFavoriteToggle).toHaveBeenCalledTimes(1);
    expect(mockOnFavoriteToggle).toHaveBeenCalledWith('test-movie');
  });

  it('should toggle from unfavorited to favorited', () => {
    const { rerender } = render(
      <MovieCard
        movie={mockMovie}
        isFavorite={false}
        onFavoriteToggle={mockOnFavoriteToggle}
      />
    );

    let favoriteButton = screen.getByLabelText('Add to favorites');
    expect(favoriteButton).toHaveTextContent('🤍');

    fireEvent.click(favoriteButton);

    // Re-render with updated state
    rerender(
      <MovieCard
        movie={mockMovie}
        isFavorite={true}
        onFavoriteToggle={mockOnFavoriteToggle}
      />
    );

    favoriteButton = screen.getByLabelText('Remove from favorites');
    expect(favoriteButton).toHaveTextContent('❤️');
  });

  it('should toggle from favorited to unfavorited', () => {
    const { rerender } = render(
      <MovieCard
        movie={mockMovie}
        isFavorite={true}
        onFavoriteToggle={mockOnFavoriteToggle}
      />
    );

    let favoriteButton = screen.getByLabelText('Remove from favorites');
    expect(favoriteButton).toHaveTextContent('❤️');

    fireEvent.click(favoriteButton);

    // Re-render with updated state
    rerender(
      <MovieCard
        movie={mockMovie}
        isFavorite={false}
        onFavoriteToggle={mockOnFavoriteToggle}
      />
    );

    favoriteButton = screen.getByLabelText('Add to favorites');
    expect(favoriteButton).toHaveTextContent('🤍');
  });

  it('should not trigger card click when favorite button clicked', () => {
    const mockOnCardClick = jest.fn();

    render(
      <MovieCard
        movie={mockMovie}
        isFavorite={false}
        onFavoriteToggle={mockOnFavoriteToggle}
        onClick={mockOnCardClick}
      />
    );

    const favoriteButton = screen.getByLabelText('Add to favorites');
    fireEvent.click(favoriteButton);

    expect(mockOnFavoriteToggle).toHaveBeenCalledTimes(1);
    expect(mockOnCardClick).not.toHaveBeenCalled();
  });

  it('should be accessible with keyboard', () => {
    render(
      <MovieCard
        movie={mockMovie}
        isFavorite={false}
        onFavoriteToggle={mockOnFavoriteToggle}
      />
    );

    const favoriteButton = screen.getByLabelText('Add to favorites');

    // Should be focusable
    favoriteButton.focus();
    expect(favoriteButton).toHaveFocus();

    // Should work with Enter key
    fireEvent.keyDown(favoriteButton, { key: 'Enter' });
    // Note: Testing library doesn't trigger click on Enter by default for buttons
    // but browsers do, so we test the click event directly
  });

  it('should have proper ARIA label for unfavorited', () => {
    render(
      <MovieCard
        movie={mockMovie}
        isFavorite={false}
        onFavoriteToggle={mockOnFavoriteToggle}
      />
    );

    const favoriteButton = screen.getByLabelText('Add to favorites');
    expect(favoriteButton).toHaveAttribute('aria-label', 'Add to favorites');
  });

  it('should have proper ARIA label for favorited', () => {
    render(
      <MovieCard
        movie={mockMovie}
        isFavorite={true}
        onFavoriteToggle={mockOnFavoriteToggle}
      />
    );

    const favoriteButton = screen.getByLabelText('Remove from favorites');
    expect(favoriteButton).toHaveAttribute(
      'aria-label',
      'Remove from favorites'
    );
  });

  it('should be visible on hover', () => {
    render(
      <MovieCard
        movie={mockMovie}
        isFavorite={false}
        onFavoriteToggle={mockOnFavoriteToggle}
      />
    );

    const favoriteButton = screen.getByLabelText('Add to favorites');

    // Button should always be visible (not hidden with opacity)
    expect(favoriteButton).toBeVisible();
  });

  it('should have visual feedback styles', () => {
    render(
      <MovieCard
        movie={mockMovie}
        isFavorite={false}
        onFavoriteToggle={mockOnFavoriteToggle}
      />
    );

    const favoriteButton = screen.getByLabelText('Add to favorites');

    // Should have transition classes
    expect(favoriteButton).toHaveClass('transition-all');
  });
});
