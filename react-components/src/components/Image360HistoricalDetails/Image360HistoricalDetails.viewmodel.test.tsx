import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { type ReactElement, type ReactNode } from 'react';
import { useImage360HistoricalDetailsViewModel } from './Image360HistoricalDetails.viewmodel';
import { type Image360HistoricalDetailsProps } from './types';
import { viewerMock } from '#test-utils/fixtures/viewer';
import {
  createMockImage360Entity,
  createMockImage360Revision
} from '#test-utils/fixtures/image360Station';
import {
  defaultImage360HistoricalDetailsViewModelDependencies,
  Image360HistoricalDetailsViewModelContext
} from './Image360HistoricalDetails.viewmodel.context';
import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';
import { type ClassicDataSourceType, type Image360Revision } from '@cognite/reveal';
import { Mock } from 'moq.ts';

describe(useImage360HistoricalDetailsViewModel.name, () => {
  const mockDefaultDateTime = '2024-01-15T10:30:00Z';
  const mockDefaultDate = '2024-01-15';
  const mockDefaultThumbnailUrl = 'https://example.com/thumb1.jpg';
  const defaultDependencies = getMocksByDefaultDependencies(
    defaultImage360HistoricalDetailsViewModelDependencies
  );
  const mockOnExpand = vi.fn();

  const mockRevisions: Array<Image360Revision<ClassicDataSourceType>> = [
    createMockImage360Revision({
      date: new Date(mockDefaultDateTime),
      thumbnailUrl: mockDefaultThumbnailUrl
    })
  ];

  const mockEntity = createMockImage360Entity(mockRevisions);

  const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
    <Image360HistoricalDetailsViewModelContext.Provider value={defaultDependencies}>
      {children}
    </Image360HistoricalDetailsViewModelContext.Provider>
  );

  test('should initialize with correct default values when no 360 image entity provided', () => {
    const { result } = renderHook(
      () =>
        useImage360HistoricalDetailsViewModel({
          viewer: viewerMock,
          image360Entity: undefined,
          onExpand: mockOnExpand,
          fallbackLanguage: 'en'
        }),
      { wrapper }
    );

    expect(result.current.revisionDetailsExpanded).toBe(false);
    expect(result.current.activeRevision).toBe(0);
    expect(result.current.revisionCollection).toEqual([]);
    expect(result.current.imageUrls).toEqual([]);
    expect(result.current.minWidth).toBe('100px');
    expect(result.current.stationId).toBeUndefined();
    expect(result.current.stationName).toBeUndefined();
    expect(result.current.newScrollPosition.current).toBe(0);
  });

  test('should update revisionDetailsExpanded state', () => {
    const { result } = renderHook(
      () =>
        useImage360HistoricalDetailsViewModel({
          viewer: viewerMock,
          image360Entity: mockEntity,
          onExpand: mockOnExpand,
          fallbackLanguage: 'en'
        }),
      { wrapper }
    );

    act(() => {
      result.current.setRevisionDetailsExpanded(true);
    });

    expect(result.current.revisionDetailsExpanded).toBe(true);
    expect(result.current.minWidth).toBe('100%');
    expect(mockOnExpand).toHaveBeenCalledWith(true);
  });

  test('should update activeRevision state', () => {
    const { result } = renderHook(
      () =>
        useImage360HistoricalDetailsViewModel({
          viewer: viewerMock,
          image360Entity: mockEntity,
          onExpand: mockOnExpand,
          fallbackLanguage: 'en'
        }),
      { wrapper }
    );

    act(() => {
      result.current.setActiveRevision(5);
    });

    expect(result.current.activeRevision).toBe(5);
  });

  test('should extract station information from image 360 entity', () => {
    defaultDependencies.formatDateTime.mockReturnValue(mockDefaultDate);
    const { result } = renderHook(
      () =>
        useImage360HistoricalDetailsViewModel({
          viewer: viewerMock,
          image360Entity: mockEntity,
          onExpand: mockOnExpand,
          fallbackLanguage: 'en'
        }),
      { wrapper }
    );

    expect(result.current.stationId).toBeDefined();
    expect(result.current.stationId).toBe(mockEntity.id);
    expect(result.current.stationName).toBe(mockEntity.label);
  });

  test('should process revision collection when image 360 entity is provided', async () => {
    defaultDependencies.formatDateTime
      .mockReturnValueOnce(mockDefaultDate)
      .mockReturnValueOnce('2024-02-20');

    const testRevisions = [
      createMockImage360Revision({
        date: new Date(mockDefaultDateTime),
        thumbnailUrl: mockDefaultThumbnailUrl
      }),
      createMockImage360Revision({
        date: new Date('2024-02-20T14:45:00Z'),
        thumbnailUrl: 'https://example.com/thumb2.jpg'
      })
    ];

    const mockEntity = createMockImage360Entity(testRevisions);

    const { result } = renderHook(
      () =>
        useImage360HistoricalDetailsViewModel({
          viewer: viewerMock,
          image360Entity: mockEntity,
          onExpand: mockOnExpand,
          fallbackLanguage: 'en'
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.revisionCollection.length).toBe(2);
    });

    expect(defaultDependencies.formatDateTime).toHaveBeenCalledWith({
      date: new Date(mockDefaultDateTime)
    });
    expect(defaultDependencies.formatDateTime).toHaveBeenCalledWith({
      date: new Date('2024-02-20T14:45:00Z')
    });

    expect(result.current.revisionCollection[0]).toEqual({
      date: mockDefaultDate,
      imageUrl: mockDefaultThumbnailUrl,
      index: 0,
      image360Entity: mockEntity
    });

    expect(result.current.revisionCollection[1]).toEqual({
      date: '2024-02-20',
      imageUrl: 'https://example.com/thumb2.jpg',
      index: 1,
      image360Entity: mockEntity
    });

    expect(result.current.activeRevision).toBe(0);
    expect(result.current.newScrollPosition.current).toBe(0);
  });

  test('should handle image 360 revision date not available', async () => {
    const revisionWithUndefinedDate = new Mock<Image360Revision>()
      .setup((p) => p.date)
      .returns(undefined)
      .setup((p) => p.getPreviewThumbnailUrl)
      .returns(async () => 'mock-thumbnail-url')
      .object();

    const entityWithUndefinedDate = createMockImage360Entity([revisionWithUndefinedDate]);

    const { result } = renderHook(
      () =>
        useImage360HistoricalDetailsViewModel({
          viewer: viewerMock,
          image360Entity: entityWithUndefinedDate,
          onExpand: mockOnExpand,
          fallbackLanguage: 'en'
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.revisionCollection.length).toBeGreaterThan(0);
    });

    expect(result.current.revisionCollection[0].date).toBe('Date not available');
    expect(defaultDependencies.formatDateTime).not.toHaveBeenCalled();
  });

  test('should handle image 360 entity change from undefined to defined', async () => {
    defaultDependencies.formatDateTime.mockReturnValue(mockDefaultDate);

    const initialProps: Image360HistoricalDetailsProps = {
      viewer: viewerMock,
      image360Entity: undefined,
      onExpand: mockOnExpand,
      fallbackLanguage: 'en'
    };

    const { result, rerender } = renderHook(
      (props: Image360HistoricalDetailsProps) => useImage360HistoricalDetailsViewModel(props),
      {
        wrapper,
        initialProps
      }
    );

    expect(result.current.revisionCollection).toEqual([]);

    // Change from undefined to defined entity
    rerender({
      viewer: viewerMock,
      image360Entity: mockEntity,
      onExpand: mockOnExpand,
      fallbackLanguage: 'en'
    });

    await waitFor(() => {
      expect(result.current.revisionCollection.length).toBe(1);
    });

    expect(defaultDependencies.formatDateTime).toHaveBeenCalledWith({
      date: new Date(mockDefaultDateTime)
    });
  });

  test('should handle image 360 entity change to undefined', async () => {
    defaultDependencies.formatDateTime.mockReturnValue(mockDefaultDate);

    const initialProps: Image360HistoricalDetailsProps = {
      viewer: viewerMock,
      image360Entity: mockEntity,
      onExpand: mockOnExpand,
      fallbackLanguage: 'en'
    };

    const { result, rerender } = renderHook(
      (props: Image360HistoricalDetailsProps) => useImage360HistoricalDetailsViewModel(props),
      {
        wrapper,
        initialProps
      }
    );

    // Wait for initial fetch
    await waitFor(() => {
      expect(result.current.revisionCollection.length).toBe(1);
    });

    // Change from defined to undefined
    rerender({
      viewer: viewerMock,
      image360Entity: undefined,
      onExpand: mockOnExpand,
      fallbackLanguage: 'en'
    });

    expect(result.current.stationId).toBeUndefined();
    expect(result.current.stationName).toBeUndefined();
  });

  test('should work without onExpand callback', () => {
    const { result } = renderHook(
      () =>
        useImage360HistoricalDetailsViewModel({
          viewer: viewerMock,
          image360Entity: undefined,
          fallbackLanguage: 'en'
        }),
      { wrapper }
    );

    // Should not throw when toggling expansion without onExpand
    expect(() => {
      act(() => {
        result.current.setRevisionDetailsExpanded(true);
      });
    }).not.toThrow();

    expect(result.current.revisionDetailsExpanded).toBe(true);
    expect(result.current.minWidth).toBe('100%');
  });

  test('should reset active image 360 revision and scroll position when new image 360 entity is provided', async () => {
    defaultDependencies.formatDateTime
      .mockReturnValueOnce(mockDefaultDate)
      .mockReturnValueOnce('2024-02-20')
      .mockReturnValueOnce('2024-03-10');

    const newRevisions = [
      createMockImage360Revision({
        date: new Date('2024-02-20T14:45:00Z'),
        thumbnailUrl: 'https://example.com/thumb2.jpg'
      }),
      createMockImage360Revision({
        date: new Date('2024-03-10T08:15:00Z'),
        thumbnailUrl: 'https://example.com/thumb3.jpg'
      })
    ];

    const initialEntity = mockEntity;
    const newEntity = createMockImage360Entity(newRevisions);

    const initialProps: Image360HistoricalDetailsProps = {
      viewer: viewerMock,
      image360Entity: initialEntity,
      onExpand: mockOnExpand,
      fallbackLanguage: 'en'
    };

    const { result, rerender } = renderHook(
      (props: Image360HistoricalDetailsProps) => useImage360HistoricalDetailsViewModel(props),
      {
        wrapper,
        initialProps
      }
    );

    await waitFor(() => {
      expect(result.current.revisionCollection.length).toBe(1);
    });

    // Change active revision
    act(() => {
      result.current.setActiveRevision(2);
      result.current.newScrollPosition.current = 100;
    });

    expect(result.current.activeRevision).toBe(2);
    expect(result.current.newScrollPosition.current).toBe(100);

    // Change entity - should reset active revision and scroll position
    rerender({
      viewer: viewerMock,
      image360Entity: newEntity,
      onExpand: mockOnExpand,
      fallbackLanguage: 'en'
    });

    await waitFor(() => {
      expect(result.current.revisionCollection.length).toBe(2);
    });

    expect(result.current.activeRevision).toBe(0);
    expect(result.current.newScrollPosition.current).toBe(0);
  });
});
