import { render } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach, assert } from 'vitest';
import { Image360HistoricalDetails } from './Image360HistoricalDetails';
import { type Image360HistoricalDetailsProps } from './types';
import { viewerMock } from '#test-utils/fixtures/viewer';
import { createMockImage360Entity } from '#test-utils/fixtures/image360Station';
import {
  type Image360HistoricalDetailsDependencies,
  Image360HistoricalDetailsContext
} from './Image360HistoricalDetails.context';
import { type ReactElement, type ReactNode, forwardRef } from 'react';

describe(Image360HistoricalDetails.name, () => {
  const mockOnExpand = vi.fn();

  const mockEntity = createMockImage360Entity([]);

  // Create a proper mutable ref object for React
  const mockRef = { current: 100 };
  Object.defineProperty(mockRef, 'current', {
    writable: true,
    enumerable: true,
    configurable: true,
    value: 100
  });

  const mockViewModelResult: ReturnType<
    Image360HistoricalDetailsDependencies['useImage360HistoricalDetailsViewModel']
  > = {
    revisionDetailsExpanded: false,
    setRevisionDetailsExpanded: vi.fn(),
    activeRevision: 2,
    setActiveRevision: vi.fn(),
    revisionCollection: [
      { date: '2024-01-15', imageUrl: 'thumb1.jpg', index: 0, image360Entity: mockEntity },
      { date: '2024-02-20', imageUrl: 'thumb2.jpg', index: 1, image360Entity: mockEntity },
      { date: '2024-03-10', imageUrl: 'thumb3.jpg', index: 2, image360Entity: mockEntity }
    ],
    imageUrls: ['thumb1.jpg', 'thumb2.jpg', 'thumb3.jpg'],
    minWidth: '250px',
    newScrollPosition: mockRef,
    stationId: 'station-123',
    stationName: 'Main Station'
  };

  const mockUseImage360HistoricalDetailsViewModel = vi.fn(() => mockViewModelResult);

  const mockImage360HistoricalPanel = vi.fn((_props) => (
    <div data-testid="historical-panel">Panel</div>
  ));

  const mockImage360HistoricalSummaryFn = vi.fn((_props, ref) => (
    <div data-testid="historical-summary" ref={ref}>
      Summary
    </div>
  ));

  const mockImage360HistoricalSummary = forwardRef<number, any>(mockImage360HistoricalSummaryFn);

  const mockDependencies: Image360HistoricalDetailsDependencies = {
    Image360HistoricalPanel: mockImage360HistoricalPanel,
    Image360HistoricalSummary: mockImage360HistoricalSummary,
    useImage360HistoricalDetailsViewModel: mockUseImage360HistoricalDetailsViewModel
  };

  beforeEach(() => {
    mockUseImage360HistoricalDetailsViewModel.mockReturnValue(mockViewModelResult);
  });

  const defaultProps: Image360HistoricalDetailsProps = {
    viewer: viewerMock,
    image360Entity: mockEntity,
    onExpand: mockOnExpand,
    fallbackLanguage: 'en'
  };

  const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
    <Image360HistoricalDetailsContext.Provider value={mockDependencies}>
      {children}
    </Image360HistoricalDetailsContext.Provider>
  );

  test('renders DetailsContainer with correct minWidth style', () => {
    const { container } = render(<Image360HistoricalDetails {...defaultProps} />, { wrapper });

    assert(container.firstChild !== null);

    const detailsContainer = container.firstChild as HTMLElement;
    expect(detailsContainer.style.minWidth).toBe('250px');
  });

  test('renders Image360HistoricalPanel with correct props', () => {
    render(<Image360HistoricalDetails {...defaultProps} />, { wrapper });

    expect(mockImage360HistoricalPanel).toHaveBeenCalledWith(
      expect.objectContaining({
        revisionCount: 3,
        revisionDetailsExpanded: false,
        setRevisionDetailsExpanded: expect.any(Function),
        fallbackLanguage: 'en'
      }),
      expect.anything()
    );
  });

  test('renders Image360HistoricalSummary when expanded with correct props', () => {
    mockUseImage360HistoricalDetailsViewModel.mockReturnValue({
      ...mockViewModelResult,
      revisionDetailsExpanded: true
    });

    render(<Image360HistoricalDetails {...defaultProps} />, { wrapper });

    expect(mockImage360HistoricalSummaryFn).toHaveBeenCalledWith(
      expect.objectContaining({
        viewer: viewerMock,
        stationId: 'station-123',
        stationName: 'Main Station',
        activeRevision: 2,
        setActiveRevision: expect.any(Function),
        revisionCollection: expect.arrayContaining([
          expect.objectContaining({
            date: '2024-01-15',
            imageUrl: 'thumb1.jpg',
            index: 0,
            image360Entity: mockEntity
          }),
          expect.objectContaining({
            date: '2024-02-20',
            imageUrl: 'thumb2.jpg',
            index: 1,
            image360Entity: mockEntity
          }),
          expect.objectContaining({
            date: '2024-03-10',
            imageUrl: 'thumb3.jpg',
            index: 2,
            image360Entity: mockEntity
          })
        ]),
        fallbackLanguage: 'en'
      }),
      expect.anything()
    );
  });

  test('does not render Image360HistoricalSummary when not expanded', () => {
    mockUseImage360HistoricalDetailsViewModel.mockReturnValue({
      ...mockViewModelResult,
      revisionDetailsExpanded: false
    });

    render(<Image360HistoricalDetails {...defaultProps} />, { wrapper });

    expect(mockImage360HistoricalSummaryFn).not.toHaveBeenCalled();
  });

  test('passes all props correctly to useImage360HistoricalDetailsViewModel', () => {
    render(<Image360HistoricalDetails {...defaultProps} />, { wrapper });

    expect(mockUseImage360HistoricalDetailsViewModel).toHaveBeenCalledWith({
      viewer: viewerMock,
      image360Entity: mockEntity,
      onExpand: mockOnExpand,
      fallbackLanguage: 'en'
    });
  });
});
