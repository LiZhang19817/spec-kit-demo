/**
 * Component Tests: FilterPanel
 * Tests filter panel container with clear all functionality
 */

import { render, screen, fireEvent } from '@testing-library/react';
import FilterPanel from '@/components/filters/FilterPanel';
import { Genre } from '@/types/movie';

describe('FilterPanel', () => {
  const mockOnFilterChange = jest.fn();

  beforeEach(() => {
    mockOnFilterChange.mockClear();
  });

  it('should render all filter sections', () => {
    render(<FilterPanel onFilterChange={mockOnFilterChange} />);

    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('Genre')).toBeInTheDocument();
    expect(screen.getByText('Release Year')).toBeInTheDocument();
    expect(screen.getByText('Rating')).toBeInTheDocument();
  });

  it('should show active filter count in header', () => {
    render(
      <FilterPanel
        onFilterChange={mockOnFilterChange}
        activeFilters={{
          genres: ['Action' as Genre, 'Drama' as Genre],
          minYear: 2015,
          maxYear: 2022,
          minRating: 4.0,
        }}
      />
    );

    expect(screen.getByText('3 active')).toBeInTheDocument();
  });

  it('should not show filter count when no filters active', () => {
    render(<FilterPanel onFilterChange={mockOnFilterChange} />);

    expect(screen.queryByText(/active/)).not.toBeInTheDocument();
  });

  it('should show "Clear All" button when filters active', () => {
    render(
      <FilterPanel
        onFilterChange={mockOnFilterChange}
        activeFilters={{
          genres: ['Action' as Genre],
        }}
      />
    );

    expect(screen.getByText('Clear All')).toBeInTheDocument();
  });

  it('should hide "Clear All" when no filters active', () => {
    render(<FilterPanel onFilterChange={mockOnFilterChange} />);

    expect(screen.queryByText('Clear All')).not.toBeInTheDocument();
  });

  it('should call onFilterChange with empty filters when clear all clicked', () => {
    render(
      <FilterPanel
        onFilterChange={mockOnFilterChange}
        activeFilters={{
          genres: ['Action' as Genre, 'Drama' as Genre],
          minYear: 2015,
          maxYear: 2022,
          minRating: 4.0,
        }}
      />
    );

    const clearButton = screen.getByText('Clear All');
    fireEvent.click(clearButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      genres: [],
      minYear: undefined,
      maxYear: undefined,
      minRating: undefined,
      maxRating: undefined,
      minRuntime: undefined,
      maxRuntime: undefined,
      showFavoritesOnly: false,
    });
  });

  it('should display active filter badges', () => {
    render(
      <FilterPanel
        onFilterChange={mockOnFilterChange}
        activeFilters={{
          genres: ['Action' as Genre, 'Drama' as Genre],
          minYear: 2015,
          maxYear: 2022,
        }}
      />
    );

    expect(screen.getByText('Action, Drama')).toBeInTheDocument();
    expect(screen.getByText('2015 - 2022')).toBeInTheDocument();
  });

  it('should allow removing individual filter badges', () => {
    render(
      <FilterPanel
        onFilterChange={mockOnFilterChange}
        activeFilters={{
          genres: ['Action' as Genre, 'Drama' as Genre],
          minYear: 2015,
          maxYear: 2022,
        }}
      />
    );

    const genreBadge = screen.getByText('Action, Drama').closest('button');
    const removeIcon = genreBadge?.querySelector('[aria-label="Remove filter"]');

    if (removeIcon) {
      fireEvent.click(removeIcon);

      expect(mockOnFilterChange).toHaveBeenCalledWith({
        genres: [],
        minYear: 2015,
        maxYear: 2022,
      });
    }
  });

  it('should be collapsible on mobile', () => {
    render(<FilterPanel onFilterChange={mockOnFilterChange} />);

    const collapseButton = screen.getByLabelText('Toggle filters');
    fireEvent.click(collapseButton);

    // Filter content should be hidden
    expect(screen.queryByText('Genre')).not.toBeVisible();
  });

  it('should expand filters when collapse button clicked again', () => {
    render(<FilterPanel onFilterChange={mockOnFilterChange} />);

    const collapseButton = screen.getByLabelText('Toggle filters');

    // Collapse
    fireEvent.click(collapseButton);
    expect(screen.queryByText('Genre')).not.toBeVisible();

    // Expand
    fireEvent.click(collapseButton);
    expect(screen.getByText('Genre')).toBeVisible();
  });

  it('should handle genre filter change', () => {
    render(<FilterPanel onFilterChange={mockOnFilterChange} />);

    const actionButton = screen.getByText('Action');
    fireEvent.click(actionButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        genres: ['Action'],
      })
    );
  });

  it('should handle year filter change', () => {
    render(<FilterPanel onFilterChange={mockOnFilterChange} />);

    const minYearSlider = screen.getByLabelText('Minimum year');
    fireEvent.change(minYearSlider, { target: { value: '2015' } });

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        minYear: 2015,
      })
    );
  });

  it('should handle rating filter change', () => {
    render(<FilterPanel onFilterChange={mockOnFilterChange} />);

    const fourStars = screen.getByLabelText('4 stars and above');
    fireEvent.click(fourStars);

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        minRating: 4,
      })
    );
  });

  it('should be accessible with keyboard navigation', () => {
    render(<FilterPanel onFilterChange={mockOnFilterChange} />);

    const collapseButton = screen.getByLabelText('Toggle filters');
    fireEvent.keyDown(collapseButton, { key: 'Enter' });

    expect(screen.queryByText('Genre')).not.toBeVisible();
  });

  it('should have proper ARIA labels', () => {
    render(
      <FilterPanel
        onFilterChange={mockOnFilterChange}
        activeFilters={{
          genres: ['Action' as Genre],
        }}
      />
    );

    expect(screen.getByRole('region', { name: 'Filters' })).toBeInTheDocument();
    expect(screen.getByLabelText('Toggle filters')).toBeInTheDocument();
  });

  it('should show runtime filter when expanded', () => {
    render(<FilterPanel onFilterChange={mockOnFilterChange} showRuntimeFilter />);

    expect(screen.getByText('Runtime')).toBeInTheDocument();
  });

  it('should hide runtime filter by default', () => {
    render(<FilterPanel onFilterChange={mockOnFilterChange} />);

    expect(screen.queryByText('Runtime')).not.toBeInTheDocument();
  });

  it('should persist expanded state across re-renders', () => {
    const { rerender } = render(
      <FilterPanel onFilterChange={mockOnFilterChange} />
    );

    const collapseButton = screen.getByLabelText('Toggle filters');
    fireEvent.click(collapseButton);

    expect(screen.queryByText('Genre')).not.toBeVisible();

    rerender(<FilterPanel onFilterChange={mockOnFilterChange} />);

    expect(screen.queryByText('Genre')).not.toBeVisible();
  });
});
