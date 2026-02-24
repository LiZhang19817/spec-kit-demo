/**
 * Component Tests: YearFilter
 * Tests dual-handle range slider for year filtering
 */

import { render, screen, fireEvent } from '@testing-library/react';
import YearFilter from '@/components/filters/YearFilter';

describe('YearFilter', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('should render with default year range', () => {
    render(
      <YearFilter
        minYear={2000}
        maxYear={2024}
        selectedMinYear={2000}
        selectedMaxYear={2024}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('2000')).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
  });

  it('should display selected year range', () => {
    render(
      <YearFilter
        minYear={2000}
        maxYear={2024}
        selectedMinYear={2010}
        selectedMaxYear={2020}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('2010 - 2020')).toBeInTheDocument();
  });

  it('should call onChange when min year slider changes', () => {
    render(
      <YearFilter
        minYear={2000}
        maxYear={2024}
        selectedMinYear={2000}
        selectedMaxYear={2024}
        onChange={mockOnChange}
      />
    );

    const minSlider = screen.getByLabelText('Minimum year');
    fireEvent.change(minSlider, { target: { value: '2010' } });

    expect(mockOnChange).toHaveBeenCalledWith(2010, 2024);
  });

  it('should call onChange when max year slider changes', () => {
    render(
      <YearFilter
        minYear={2000}
        maxYear={2024}
        selectedMinYear={2000}
        selectedMaxYear={2024}
        onChange={mockOnChange}
      />
    );

    const maxSlider = screen.getByLabelText('Maximum year');
    fireEvent.change(maxSlider, { target: { value: '2020' } });

    expect(mockOnChange).toHaveBeenCalledWith(2000, 2020);
  });

  it('should prevent min year from exceeding max year', () => {
    render(
      <YearFilter
        minYear={2000}
        maxYear={2024}
        selectedMinYear={2010}
        selectedMaxYear={2020}
        onChange={mockOnChange}
      />
    );

    const minSlider = screen.getByLabelText('Minimum year');
    fireEvent.change(minSlider, { target: { value: '2022' } });

    // Should clamp to maxYear
    expect(mockOnChange).toHaveBeenCalledWith(2020, 2020);
  });

  it('should prevent max year from going below min year', () => {
    render(
      <YearFilter
        minYear={2000}
        maxYear={2024}
        selectedMinYear={2010}
        selectedMaxYear={2020}
        onChange={mockOnChange}
      />
    );

    const maxSlider = screen.getByLabelText('Maximum year');
    fireEvent.change(maxSlider, { target: { value: '2005' } });

    // Should clamp to minYear
    expect(mockOnChange).toHaveBeenCalledWith(2010, 2010);
  });

  it('should have accessible slider controls', () => {
    render(
      <YearFilter
        minYear={2000}
        maxYear={2024}
        selectedMinYear={2010}
        selectedMaxYear={2020}
        onChange={mockOnChange}
      />
    );

    const minSlider = screen.getByLabelText('Minimum year');
    const maxSlider = screen.getByLabelText('Maximum year');

    expect(minSlider).toHaveAttribute('type', 'range');
    expect(minSlider).toHaveAttribute('min', '2000');
    expect(minSlider).toHaveAttribute('max', '2024');
    expect(minSlider).toHaveAttribute('value', '2010');

    expect(maxSlider).toHaveAttribute('type', 'range');
    expect(maxSlider).toHaveAttribute('min', '2000');
    expect(maxSlider).toHaveAttribute('max', '2024');
    expect(maxSlider).toHaveAttribute('value', '2020');
  });

  it('should show "All Years" when full range selected', () => {
    render(
      <YearFilter
        minYear={2000}
        maxYear={2024}
        selectedMinYear={2000}
        selectedMaxYear={2024}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('All Years')).toBeInTheDocument();
  });

  it('should update display when props change', () => {
    const { rerender } = render(
      <YearFilter
        minYear={2000}
        maxYear={2024}
        selectedMinYear={2010}
        selectedMaxYear={2020}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('2010 - 2020')).toBeInTheDocument();

    rerender(
      <YearFilter
        minYear={2000}
        maxYear={2024}
        selectedMinYear={2015}
        selectedMaxYear={2022}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('2015 - 2022')).toBeInTheDocument();
  });

  it('should support keyboard navigation', () => {
    render(
      <YearFilter
        minYear={2000}
        maxYear={2024}
        selectedMinYear={2010}
        selectedMaxYear={2020}
        onChange={mockOnChange}
      />
    );

    const minSlider = screen.getByLabelText('Minimum year');

    // Arrow keys should work
    fireEvent.keyDown(minSlider, { key: 'ArrowRight' });
    fireEvent.keyDown(minSlider, { key: 'ArrowLeft' });

    expect(minSlider).toHaveFocus();
  });

  it('should show reset button when range is modified', () => {
    render(
      <YearFilter
        minYear={2000}
        maxYear={2024}
        selectedMinYear={2010}
        selectedMaxYear={2020}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Reset')).toBeInTheDocument();
  });

  it('should reset to full range when reset clicked', () => {
    render(
      <YearFilter
        minYear={2000}
        maxYear={2024}
        selectedMinYear={2010}
        selectedMaxYear={2020}
        onChange={mockOnChange}
      />
    );

    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);

    expect(mockOnChange).toHaveBeenCalledWith(2000, 2024);
  });

  it('should not show reset button when full range selected', () => {
    render(
      <YearFilter
        minYear={2000}
        maxYear={2024}
        selectedMinYear={2000}
        selectedMaxYear={2024}
        onChange={mockOnChange}
      />
    );

    expect(screen.queryByText('Reset')).not.toBeInTheDocument();
  });
});
