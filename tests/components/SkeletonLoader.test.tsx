/**
 * Component tests for SkeletonLoader
 * Tests loading skeleton variants
 */

import { render } from '@testing-library/react';
import SkeletonLoader from '@/components/common/SkeletonLoader';

describe('SkeletonLoader', () => {
  it('should render card variant', () => {
    const { container } = render(<SkeletonLoader variant="card" />);
    expect(container.firstChild).toHaveClass('skeleton');
  });

  it('should render text variant', () => {
    const { container } = render(<SkeletonLoader variant="text" />);
    expect(container.firstChild).toHaveClass('skeleton');
  });

  it('should render circle variant', () => {
    const { container } = render(<SkeletonLoader variant="circle" />);
    expect(container.firstChild).toHaveClass('skeleton');
    expect(container.firstChild).toHaveClass('rounded-full');
  });

  it('should apply custom width and height', () => {
    const { container } = render(
      <SkeletonLoader variant="card" width="200px" height="300px" />
    );
    const element = container.firstChild as HTMLElement;
    expect(element.style.width).toBe('200px');
    expect(element.style.height).toBe('300px');
  });

  it('should render multiple skeletons with count prop', () => {
    const { container } = render(<SkeletonLoader variant="text" count={3} />);
    const skeletons = container.querySelectorAll('.skeleton');
    expect(skeletons).toHaveLength(3);
  });

  it('should apply shimmer animation class', () => {
    const { container } = render(<SkeletonLoader variant="card" />);
    expect(container.firstChild).toHaveClass('skeleton');
  });
});
