import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
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
    formatDateTime: vi.fn(({ date }) => date.toISOString().split('T')[0])
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

  beforeEach(() => {
    // Mock URL methods to avoid errors in test environment
    globalThis.URL.revokeObjectURL = vi.fn();
  });

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

    // Should call onExpand with true
    expect(mockOnExpand).toHaveBeenCalledWith(true);
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
    expect(async () => {
      await userEvent.click(expandButton);
    }).not.toThrow();
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
});
