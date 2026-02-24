/**
 * Component Tests: GenreFilter
 * Tests pill button selection and multi-select functionality
 */

import { render, screen, fireEvent } from '@testing-library/react';
import GenreFilter from '@/components/filters/GenreFilter';
import { Genre, GENRES } from '@/types/movie';

describe('GenreFilter', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('should render all genre pills', () => {
    render(<GenreFilter selectedGenres={[]} onChange={mockOnChange} />);

    GENRES.forEach((genre) => {
      expect(screen.getByText(genre)).toBeInTheDocument();
    });
  });

  it('should select a genre when clicked', () => {
    render(<GenreFilter selectedGenres={[]} onChange={mockOnChange} />);

    const actionButton = screen.getByText('Action');
    fireEvent.click(actionButton);

    expect(mockOnChange).toHaveBeenCalledWith(['Action']);
  });

  it('should deselect a genre when clicked again', () => {
    render(
      <GenreFilter
        selectedGenres={['Action' as Genre]}
        onChange={mockOnChange}
      />
    );

    const actionButton = screen.getByText('Action');
    fireEvent.click(actionButton);

    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  it('should support multi-select', () => {
    const { rerender } = render(
      <GenreFilter selectedGenres={[]} onChange={mockOnChange} />
    );

    // Select Action
    fireEvent.click(screen.getByText('Action'));
    expect(mockOnChange).toHaveBeenCalledWith(['Action']);

    // Re-render with Action selected
    rerender(
      <GenreFilter
        selectedGenres={['Action' as Genre]}
        onChange={mockOnChange}
      />
    );

    // Select Drama
    fireEvent.click(screen.getByText('Drama'));
    expect(mockOnChange).toHaveBeenCalledWith(['Action', 'Drama']);
  });

  it('should apply active styling to selected genres', () => {
    render(
      <GenreFilter
        selectedGenres={['Action' as Genre, 'Drama' as Genre]}
        onChange={mockOnChange}
      />
    );

    const actionButton = screen.getByText('Action');
    const dramaButton = screen.getByText('Drama');
    const comedyButton = screen.getByText('Comedy');

    expect(actionButton).toHaveClass('bg-apple-accent');
    expect(dramaButton).toHaveClass('bg-apple-accent');
    expect(comedyButton).not.toHaveClass('bg-apple-accent');
  });

  it('should have accessible labels', () => {
    render(<GenreFilter selectedGenres={[]} onChange={mockOnChange} />);

    const actionButton = screen.getByText('Action');
    expect(actionButton).toHaveAttribute('role', 'checkbox');
    expect(actionButton).toHaveAttribute('aria-checked', 'false');
  });

  it('should update aria-checked when selected', () => {
    render(
      <GenreFilter
        selectedGenres={['Action' as Genre]}
        onChange={mockOnChange}
      />
    );

    const actionButton = screen.getByText('Action');
    expect(actionButton).toHaveAttribute('aria-checked', 'true');
  });

  it('should show selection count when genres selected', () => {
    render(
      <GenreFilter
        selectedGenres={['Action' as Genre, 'Drama' as Genre, 'Comedy' as Genre]}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('3 selected')).toBeInTheDocument();
  });

  it('should not show selection count when no genres selected', () => {
    render(<GenreFilter selectedGenres={[]} onChange={mockOnChange} />);

    expect(screen.queryByText(/selected/)).not.toBeInTheDocument();
  });

  it('should wrap pills on small screens', () => {
    const { container } = render(
      <GenreFilter selectedGenres={[]} onChange={mockOnChange} />
    );

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('flex-wrap');
  });

  it('should handle keyboard navigation', () => {
    render(<GenreFilter selectedGenres={[]} onChange={mockOnChange} />);

    const actionButton = screen.getByText('Action');
    fireEvent.keyDown(actionButton, { key: 'Enter' });

    expect(mockOnChange).toHaveBeenCalledWith(['Action']);
  });

  it('should handle space key', () => {
    render(<GenreFilter selectedGenres={[]} onChange={mockOnChange} />);

    const actionButton = screen.getByText('Action');
    fireEvent.keyDown(actionButton, { key: ' ' });

    expect(mockOnChange).toHaveBeenCalledWith(['Action']);
  });
});
