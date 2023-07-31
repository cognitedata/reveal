import { render, screen } from '@testing-library/react';

import EmptyState from '../EmptyState';

describe('emptyState', () => {
  const loadingText = 'LOADING';
  const loadingSubText = 'PLEASE WAIT';
  const emptyText = 'NO_RESULTS';
  const TestString = 'TEST';
  const TestContent = () => <div>{TestString}</div>;

  it('should not show children when loading and should show loading text', () => {
    render(
      <EmptyState isLoading loadingTitle={loadingText} emptyTitle={emptyText}>
        <TestContent />
      </EmptyState>
    );

    expect(screen.queryByText(loadingText)).toBeVisible();
    expect(screen.queryByText(emptyText)).not.toBeVisible();
    expect(screen.queryByText(TestString)).not.toBeInTheDocument();
  });

  it('should show children when done loading and should show "no results" text', () => {
    render(
      <EmptyState loadingTitle={loadingText} emptyTitle={emptyText}>
        <TestContent />
      </EmptyState>
    );

    expect(screen.getByText(loadingText)).not.toBeVisible();
    expect(screen.getByText(emptyText)).toBeVisible();
    expect(screen.getByText(TestString)).toBeInTheDocument();
  });

  it('should not show children when loading and should show sub text', () => {
    render(
      <EmptyState
        isLoading
        loadingTitle={loadingText}
        emptyTitle={emptyText}
        loadingSubtitle={loadingSubText}
      >
        <TestContent />
      </EmptyState>
    );

    expect(screen.queryByText(loadingText)).toBeVisible();
    expect(screen.queryByText(loadingSubText)).toBeVisible();
    expect(screen.queryByText(emptyText)).not.toBeVisible();
    expect(screen.queryByText(TestString)).not.toBeInTheDocument();
  });

  it('should show search illustration by default', () => {
    render(<EmptyState />);

    expect(screen.getByRole('search')).toBeInTheDocument();
  });

  it('should show favorites illustration', () => {
    render(<EmptyState img="Favorites" />);

    expect(screen.getByRole('favorites')).toBeInTheDocument();
  });

  it('should show recent illustration', () => {
    render(<EmptyState img="Recent" />);

    expect(screen.getByRole('recent')).toBeInTheDocument();
  });
});
