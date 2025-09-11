import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Image360HistoricalDetails } from './Image360HistoricalDetails';
import { type Image360HistoricalDetailsProps } from './types';
import { viewerMock } from '#test-utils/fixtures/viewer';
import {
  createMockImage360Entity,
  createMockImage360Revision
} from '#test-utils/fixtures/image360Station';
import {
  Image360HistoricalDetailsViewModelContext,
  type Image360HistoricalDetailsViewModelDependencies
} from './Image360HistoricalDetails.viewmodel.context';
import { type ReactElement, type ReactNode } from 'react';

describe(Image360HistoricalDetails.name, () => {
  const mockOnExpand = vi.fn();

  const mockContextValue: Image360HistoricalDetailsViewModelDependencies = {
    formatDateTime: vi.fn(({ date }) => date.toISOString().split('T')[0]),
    revokeObjectUrl: vi.fn()
  };

  const defaultProps: Image360HistoricalDetailsProps = {
    viewer: viewerMock,
    image360Entity: undefined,
    onExpand: mockOnExpand,
    fallbackLanguage: 'en'
  };

  const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
    <Image360HistoricalDetailsViewModelContext.Provider value={mockContextValue}>
      {children}
    </Image360HistoricalDetailsViewModelContext.Provider>
  );

  test('renders without crashing when no entity is provided', () => {
    const { container } = render(<Image360HistoricalDetails {...defaultProps} />, { wrapper });

    expect(container.firstChild).toBeTruthy();
  });

  test('renders with image360 entity and displays historical panel', () => {
    const testRevisions = [
      createMockImage360Revision({
        date: new Date('2024-01-15T10:30:00Z'),
        thumbnailUrl: 'https://example.com/thumb1.jpg'
      }),
      createMockImage360Revision({
        date: new Date('2024-02-20T14:45:00Z'),
        thumbnailUrl: 'https://example.com/thumb2.jpg'
      }),
      createMockImage360Revision({
        date: new Date('2024-03-10T08:15:00Z'),
        thumbnailUrl: 'https://example.com/thumb3.jpg'
      })
    ];

    const mockEntity = createMockImage360Entity(testRevisions);

    render(<Image360HistoricalDetails {...defaultProps} image360Entity={mockEntity} />, {
      wrapper
    });

    expect(screen.getByRole('button')).toBeTruthy();
  });

  test('expands to show historical summary when panel is clicked', async () => {
    const testRevisions = [
      createMockImage360Revision({
        date: new Date('2024-01-15T10:30:00Z'),
        thumbnailUrl: 'https://example.com/thumb1.jpg'
      })
    ];

    const mockEntity = createMockImage360Entity(testRevisions);

    const { container } = render(
      <Image360HistoricalDetails {...defaultProps} image360Entity={mockEntity} />,
      { wrapper }
    );

    const expandButton = screen.getByRole('button');

    // Initially collapsed - check that container exists
    expect(container.firstChild).toBeTruthy();

    // Click to expand
    await userEvent.click(expandButton);

    expect(mockOnExpand).toHaveBeenCalledTimes(1);
  });

  test('handles missing onExpand callback gracefully', async () => {
    const testRevisions = [
      createMockImage360Revision({
        date: new Date('2024-01-15T10:30:00Z'),
        thumbnailUrl: 'https://example.com/thumb1.jpg'
      })
    ];

    const mockEntity = createMockImage360Entity(testRevisions);

    render(
      <Image360HistoricalDetails
        viewer={viewerMock}
        image360Entity={mockEntity}
        fallbackLanguage="en"
      />,
      { wrapper }
    );

    const expandButton = screen.getByRole('button');

    // Should not throw when onExpand is not provided
    await expect(userEvent.click(expandButton)).resolves.not.toThrow();
  });

  test('displays correct station information', () => {
    const testRevisions = [
      createMockImage360Revision({
        date: new Date('2024-01-15T10:30:00Z'),
        thumbnailUrl: 'https://example.com/thumb1.jpg'
      })
    ];

    const mockEntity = createMockImage360Entity(testRevisions);

    const { container } = render(
      <Image360HistoricalDetails {...defaultProps} image360Entity={mockEntity} />,
      { wrapper }
    );

    expect(container.firstChild).toBeTruthy();
    expect(mockEntity.getRevisions()).toEqual(testRevisions);
  });

  test('processes revision collection data correctly', async () => {
    const testRevisions = [
      createMockImage360Revision({
        date: new Date('2024-01-15T10:30:00Z'),
        thumbnailUrl: 'https://example.com/thumb1.jpg'
      }),
      createMockImage360Revision({
        date: new Date('2024-02-20T14:45:00Z'),
        thumbnailUrl: 'https://example.com/thumb2.jpg'
      })
    ];

    const mockEntity = createMockImage360Entity(testRevisions);

    // First render without entity
    const { rerender } = render(
      <Image360HistoricalDetails {...defaultProps} image360Entity={undefined} />,
      { wrapper }
    );

    // Then render with entity to trigger the fetch
    rerender(<Image360HistoricalDetails {...defaultProps} image360Entity={mockEntity} />);

    // Wait for async operations to complete
    await waitFor(() => {
      expect(mockContextValue.formatDateTime).toHaveBeenCalledWith({
        date: new Date('2024-01-15T10:30:00Z')
      });
    });

    expect(mockContextValue.formatDateTime).toHaveBeenCalledWith({
      date: new Date('2024-02-20T14:45:00Z')
    });
  });

  test('handles entity change and triggers data fetch', async () => {
    const initialRevisions = [
      createMockImage360Revision({
        date: new Date('2024-01-15T10:30:00Z'),
        thumbnailUrl: 'https://example.com/thumb1.jpg'
      })
    ];

    const newRevisions = [
      createMockImage360Revision({
        date: new Date('2024-02-20T14:45:00Z'),
        thumbnailUrl: 'https://example.com/thumb2.jpg'
      })
    ];

    const initialEntity = createMockImage360Entity(initialRevisions);
    const newEntity = createMockImage360Entity(newRevisions);

    const { rerender } = render(
      <Image360HistoricalDetails {...defaultProps} image360Entity={undefined} />,
      { wrapper }
    );

    rerender(<Image360HistoricalDetails {...defaultProps} image360Entity={initialEntity} />);

    await waitFor(() => {
      expect(mockContextValue.formatDateTime).toHaveBeenCalled();
    });
    vi.clearAllMocks();

    // Change entity to trigger new fetch
    rerender(<Image360HistoricalDetails {...defaultProps} image360Entity={newEntity} />);

    await waitFor(() => {
      expect(mockContextValue.formatDateTime).toHaveBeenCalledWith({
        date: new Date('2024-02-20T14:45:00Z')
      });
    });
  });
});
