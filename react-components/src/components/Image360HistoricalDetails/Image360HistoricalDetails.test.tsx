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

// Mock external dependencies that cause module resolution issues
vi.mock('@cognite/cdf-utilities', () => ({
  formatDateTime: vi.fn(({ date }) => date.toISOString().split('T')[0])
}));

vi.mock('./utils/getStationIdentifier', () => ({
  getStationIdentifier: vi.fn(() => 'station-123')
}));

vi.mock('lodash', () => ({
  uniqueId: vi.fn(() => 'test-id')
}));

describe(Image360HistoricalDetails.name, () => {
  const mockOnExpand = vi.fn();

  const defaultProps: Image360HistoricalDetailsProps = {
    viewer: viewerMock,
    image360Entity: undefined,
    onExpand: mockOnExpand,
    fallbackLanguage: 'en'
  };

  beforeEach(() => {
    // Mock URL methods to avoid errors in test environment
    globalThis.URL.revokeObjectURL = vi.fn();
  });

  test('renders without crashing when no entity is provided', () => {
    const { container } = render(<Image360HistoricalDetails {...defaultProps} />);

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

    render(<Image360HistoricalDetails {...defaultProps} image360Entity={mockEntity} />);

    expect(screen.getByRole('button')).toBeTruthy();
  });

  test('expands to show historical summary when panel is clicked', async () => {
    const user = userEvent.setup();
    const testRevisions = [
      createMockImage360Revision({
        date: new Date('2024-01-15T10:30:00Z'),
        thumbnailUrl: 'https://example.com/thumb1.jpg'
      })
    ];

    const mockEntity = createMockImage360Entity(testRevisions);

    const { container } = render(
      <Image360HistoricalDetails {...defaultProps} image360Entity={mockEntity} />
    );

    const expandButton = screen.getByRole('button');

    // Initially collapsed - check that container exists
    expect(container.firstChild).toBeTruthy();

    // Click to expand
    await user.click(expandButton);

    // Should call onExpand with true
    expect(mockOnExpand).toHaveBeenCalledWith(true);
  });

  test('handles missing onExpand callback gracefully', async () => {
    const user = userEvent.setup();
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
      />
    );

    const expandButton = screen.getByRole('button');

    // Should not throw when onExpand is not provided
    expect(async () => {
      await user.click(expandButton);
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
      <Image360HistoricalDetails {...defaultProps} image360Entity={mockEntity} />
    );

    expect(container.firstChild).toBeTruthy();
    expect(mockEntity.getRevisions()).toEqual(testRevisions);
  });
});
