/**
 * Component tests for EmptyState
 * Tests empty state component with actions
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmptyState from '@/components/common/EmptyState';

describe('EmptyState', () => {
  it('should render title and description', () => {
    render(
      <EmptyState
        title="No Movies Found"
        description="Try adjusting your filters"
      />
    );

    expect(screen.getByText('No Movies Found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your filters')).toBeInTheDocument();
  });

  it('should render icon when provided', () => {
    render(
      <EmptyState
        title="Empty"
        description="No data"
        icon="🎬"
      />
    );

    expect(screen.getByText('🎬')).toBeInTheDocument();
  });

  it('should render action button when provided', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(
      <EmptyState
        title="No Movies"
        description="Load some movies"
        actionLabel="Load Movies"
        onAction={handleClick}
      />
    );

    const button = screen.getByRole('button', { name: /load movies/i });
    expect(button).toBeInTheDocument();

    await user.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not render button when no action provided', () => {
    render(
      <EmptyState
        title="No Movies"
        description="Description"
      />
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should center content', () => {
    const { container } = render(
      <EmptyState
        title="Title"
        description="Description"
      />
    );

    expect(container.firstChild).toHaveClass('text-center');
  });
});
