/**
 * Component tests for SearchBar
 * Tests search input with debounce and clear functionality
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '@/components/search/SearchBar';

describe('SearchBar', () => {
  it('should render search input', () => {
    render(<SearchBar value="" onChange={jest.fn()} />);

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder');
  });

  it('should display current value', () => {
    render(<SearchBar value="Inception" onChange={jest.fn()} />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('Inception');
  });

  it('should call onChange when typing', async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();

    render(<SearchBar value="" onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'Matrix');

    expect(handleChange).toHaveBeenCalled();
  });

  it('should show clear button when value is not empty', () => {
    render(<SearchBar value="test" onChange={jest.fn()} />);

    const clearButton = screen.getByRole('button', { name: /clear/i });
    expect(clearButton).toBeInTheDocument();
  });

  it('should not show clear button when value is empty', () => {
    render(<SearchBar value="" onChange={jest.fn()} />);

    const clearButton = screen.queryByRole('button', { name: /clear/i });
    expect(clearButton).not.toBeInTheDocument();
  });

  it('should call onClear when clear button clicked', async () => {
    const handleClear = jest.fn();
    const user = userEvent.setup();

    render(<SearchBar value="test" onChange={jest.fn()} onClear={handleClear} />);

    const clearButton = screen.getByRole('button', { name: /clear/i });
    await user.click(clearButton);

    expect(handleClear).toHaveBeenCalledTimes(1);
  });

  it('should show loading indicator when isLoading is true', () => {
    render(<SearchBar value="test" onChange={jest.fn()} isLoading={true} />);

    const loadingIndicator = screen.getByTestId('search-loading');
    expect(loadingIndicator).toBeInTheDocument();
  });

  it('should show search icon when not loading', () => {
    render(<SearchBar value="" onChange={jest.fn()} isLoading={false} />);

    const searchIcon = screen.getByTestId('search-icon');
    expect(searchIcon).toBeInTheDocument();
  });

  it('should display result count when provided', () => {
    render(<SearchBar value="test" onChange={jest.fn()} resultCount={42} />);

    expect(screen.getByText(/42/)).toBeInTheDocument();
  });

  it('should be accessible', () => {
    render(<SearchBar value="" onChange={jest.fn()} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAccessibleName();
  });

  it('should focus input when autoFocus is true', () => {
    render(<SearchBar value="" onChange={jest.fn()} autoFocus={true} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveFocus();
  });
});
