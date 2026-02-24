/**
 * Component tests for SearchHighlight
 * Tests search term highlighting in text
 */

import { render, screen } from '@testing-library/react';
import SearchHighlight from '@/components/search/SearchHighlight';

describe('SearchHighlight', () => {
  it('should render text without highlighting when no search term', () => {
    render(<SearchHighlight text="Inception" searchTerm="" />);

    expect(screen.getByText('Inception')).toBeInTheDocument();
    expect(screen.queryByTagName('mark')).not.toBeInTheDocument();
  });

  it('should highlight exact matches', () => {
    const { container } = render(
      <SearchHighlight text="Inception" searchTerm="Inception" />
    );

    const mark = container.querySelector('mark');
    expect(mark).toBeInTheDocument();
    expect(mark).toHaveTextContent('Inception');
  });

  it('should highlight case-insensitive matches', () => {
    const { container } = render(
      <SearchHighlight text="Inception" searchTerm="inception" />
    );

    const mark = container.querySelector('mark');
    expect(mark).toBeInTheDocument();
    expect(mark).toHaveTextContent('Inception');
  });

  it('should highlight partial matches', () => {
    const { container } = render(
      <SearchHighlight text="The Matrix" searchTerm="Matrix" />
    );

    const mark = container.querySelector('mark');
    expect(mark).toBeInTheDocument();
    expect(mark).toHaveTextContent('Matrix');
  });

  it('should highlight multiple matches', () => {
    const { container } = render(
      <SearchHighlight text="The Matrix Reloaded" searchTerm="Matrix" />
    );

    const marks = container.querySelectorAll('mark');
    expect(marks.length).toBeGreaterThan(0);
  });

  it('should render non-matching parts as plain text', () => {
    render(<SearchHighlight text="The Matrix" searchTerm="Matrix" />);

    expect(screen.getByText(/The/)).toBeInTheDocument();
  });

  it('should handle empty text', () => {
    const { container } = render(
      <SearchHighlight text="" searchTerm="test" />
    );

    expect(container.firstChild).toBeEmptyDOMElement();
  });

  it('should handle special regex characters in search term', () => {
    const { container } = render(
      <SearchHighlight text="The Matrix (1999)" searchTerm="(1999)" />
    );

    const mark = container.querySelector('mark');
    expect(mark).toBeInTheDocument();
  });

  it('should apply custom highlight class', () => {
    const { container } = render(
      <SearchHighlight
        text="Inception"
        searchTerm="Inception"
        highlightClass="custom-highlight"
      />
    );

    const mark = container.querySelector('mark');
    expect(mark).toHaveClass('custom-highlight');
  });

  it('should have default highlight styling', () => {
    const { container } = render(
      <SearchHighlight text="Inception" searchTerm="Inception" />
    );

    const mark = container.querySelector('mark');
    expect(mark).toHaveClass('bg-yellow-200');
  });
});
