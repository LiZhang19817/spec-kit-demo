/**
 * Component Tests: RatingFilter
 * Tests star button selection for minimum rating filter
 */

import { render, screen, fireEvent } from '@testing-library/react';
import RatingFilter from '@/components/filters/RatingFilter';

describe('RatingFilter', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('should render 5 star buttons', () => {
    render(<RatingFilter selectedRating={null} onChange={mockOnChange} />);

    const starButtons = screen.getAllByRole('button');
    expect(starButtons).toHaveLength(5);
  });

  it('should select minimum rating when star clicked', () => {
    render(<RatingFilter selectedRating={null} onChange={mockOnChange} />);

    const fourthStar = screen.getByLabelText('4 stars and above');
    fireEvent.click(fourthStar);

    expect(mockOnChange).toHaveBeenCalledWith(4);
  });

  it('should deselect rating when same star clicked again', () => {
    render(<RatingFilter selectedRating={4} onChange={mockOnChange} />);

    const fourthStar = screen.getByLabelText('4 stars and above');
    fireEvent.click(fourthStar);

    expect(mockOnChange).toHaveBeenCalledWith(null);
  });

  it('should apply filled styling to selected stars', () => {
    render(<RatingFilter selectedRating={3} onChange={mockOnChange} />);

    const stars = screen.getAllByRole('button');

    // Stars 1, 2, 3 should be filled (selected)
    expect(stars[0]).toHaveTextContent('★');
    expect(stars[1]).toHaveTextContent('★');
    expect(stars[2]).toHaveTextContent('★');

    // Stars 4, 5 should be empty
    expect(stars[3]).toHaveTextContent('☆');
    expect(stars[4]).toHaveTextContent('☆');
  });

  it('should show "3.0+ rating" label when rating selected', () => {
    render(<RatingFilter selectedRating={3} onChange={mockOnChange} />);

    expect(screen.getByText('3.0+ rating')).toBeInTheDocument();
  });

  it('should show "Any rating" when no rating selected', () => {
    render(<RatingFilter selectedRating={null} onChange={mockOnChange} />);

    expect(screen.getByText('Any rating')).toBeInTheDocument();
  });

  it('should handle hover state on stars', () => {
    render(<RatingFilter selectedRating={null} onChange={mockOnChange} />);

    const thirdStar = screen.getByLabelText('3 stars and above');
    fireEvent.mouseEnter(thirdStar);

    // Visual feedback should be provided (tested via class or data attribute)
    expect(thirdStar.closest('button')).toHaveClass('hover:scale-110');
  });

  it('should support keyboard navigation', () => {
    render(<RatingFilter selectedRating={null} onChange={mockOnChange} />);

    const fourthStar = screen.getByLabelText('4 stars and above');
    fireEvent.keyDown(fourthStar, { key: 'Enter' });

    expect(mockOnChange).toHaveBeenCalledWith(4);
  });

  it('should handle space key', () => {
    render(<RatingFilter selectedRating={null} onChange={mockOnChange} />);

    const fourthStar = screen.getByLabelText('4 stars and above');
    fireEvent.keyDown(fourthStar, { key: ' ' });

    expect(mockOnChange).toHaveBeenCalledWith(4);
  });

  it('should have accessible aria labels', () => {
    render(<RatingFilter selectedRating={3} onChange={mockOnChange} />);

    expect(screen.getByLabelText('1 stars and above')).toBeInTheDocument();
    expect(screen.getByLabelText('2 stars and above')).toBeInTheDocument();
    expect(screen.getByLabelText('3 stars and above')).toBeInTheDocument();
    expect(screen.getByLabelText('4 stars and above')).toBeInTheDocument();
    expect(screen.getByLabelText('5 stars and above')).toBeInTheDocument();
  });

  it('should update aria-pressed based on selection', () => {
    render(<RatingFilter selectedRating={4} onChange={mockOnChange} />);

    const stars = screen.getAllByRole('button');

    expect(stars[0]).toHaveAttribute('aria-pressed', 'false');
    expect(stars[1]).toHaveAttribute('aria-pressed', 'false');
    expect(stars[2]).toHaveAttribute('aria-pressed', 'false');
    expect(stars[3]).toHaveAttribute('aria-pressed', 'true');
    expect(stars[4]).toHaveAttribute('aria-pressed', 'false');
  });

  it('should allow changing rating selection', () => {
    const { rerender } = render(
      <RatingFilter selectedRating={3} onChange={mockOnChange} />
    );

    const fifthStar = screen.getByLabelText('5 stars and above');
    fireEvent.click(fifthStar);

    expect(mockOnChange).toHaveBeenCalledWith(5);

    rerender(<RatingFilter selectedRating={5} onChange={mockOnChange} />);

    const stars = screen.getAllByRole('button');
    expect(stars[4]).toHaveAttribute('aria-pressed', 'true');
  });

  it('should show reset button when rating selected', () => {
    render(<RatingFilter selectedRating={4} onChange={mockOnChange} />);

    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('should reset rating when clear clicked', () => {
    render(<RatingFilter selectedRating={4} onChange={mockOnChange} />);

    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);

    expect(mockOnChange).toHaveBeenCalledWith(null);
  });

  it('should not show clear button when no rating selected', () => {
    render(<RatingFilter selectedRating={null} onChange={mockOnChange} />);

    expect(screen.queryByText('Clear')).not.toBeInTheDocument();
  });

  it('should display half stars for decimal ratings', () => {
    render(<RatingFilter selectedRating={3.5} onChange={mockOnChange} />);

    expect(screen.getByText('3.5+ rating')).toBeInTheDocument();
  });
});
