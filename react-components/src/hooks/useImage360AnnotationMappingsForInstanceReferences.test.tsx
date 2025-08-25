import { describe, expect, beforeEach, test, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useImage360AnnotationMappingsForInstanceReferences } from './useImage360AnnotationMappingsForInstanceReferences';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { classic360AnnotationFixture } from '#test-utils/fixtures/image360Annotations';
import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';
import {
  defaultImage360AnnotationMappingsDependencies,
  Image360AnnotationMappingsContext
} from './useImage360AnnotationMappingsForInstanceReferences.context';
import { type ReactElement, type ReactNode } from 'react';
import { Image360AnnotationCache } from '../components/CacheProvider/Image360AnnotationCache';
import { sdkMock } from '#test-utils/fixtures/sdk';
import { viewerMock } from '#test-utils/fixtures/viewer';

const mockReveal360Annotations = [
  {
    asset: { id: 3449 },
    assetAnnotationImage360Info: {
      annotation: {
        annotation: classic360AnnotationFixture,
        getCenter: () => ({ applyMatrix4: () => ({}) })
      },
      image: { transform: {} }
    },
    position: {}
  }
];

const dependencies = getMocksByDefaultDependencies(defaultImage360AnnotationMappingsDependencies);

const queryClient = new QueryClient();

const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
  <QueryClientProvider client={queryClient}>
    <Image360AnnotationMappingsContext.Provider value={dependencies}>
      {children}
    </Image360AnnotationMappingsContext.Provider>
  </QueryClientProvider>
);

const mockImage360AnnotationCache = new Image360AnnotationCache(sdkMock, viewerMock);

describe(useImage360AnnotationMappingsForInstanceReferences.name, () => {
  beforeEach(() => {
    dependencies.useImage360AnnotationCache.mockReturnValue(mockImage360AnnotationCache);
    mockImage360AnnotationCache.getReveal360AnnotationsForAssets = vi.fn().mockResolvedValue([]);
  });

  test('returns empty array if assetIds or siteIds are undefined', async () => {
    const { result } = renderHook(
      () => useImage360AnnotationMappingsForInstanceReferences(undefined, undefined),
      { wrapper }
    );
    await waitFor(() => {
      expect(result.current.data).toEqual([]);
    });
  });

  test('returns empty array if assetIds or siteIds are empty', async () => {
    const { result } = renderHook(
      () => useImage360AnnotationMappingsForInstanceReferences([], []),
      { wrapper }
    );
    await waitFor(() => {
      expect(result.current.data).toEqual([]);
    });
  });

  test('returns filtered annotation asset info', async () => {
    mockImage360AnnotationCache.getReveal360AnnotationsForAssets = vi
      .fn()
      .mockResolvedValue(mockReveal360Annotations);
    const { result } = renderHook(
      () => useImage360AnnotationMappingsForInstanceReferences([{ id: 3449 }], ['siteId1']),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data?.length).toBe(1);
    });

    expect(result.current.data?.[0]).toMatchObject(mockReveal360Annotations[0]);
  });

  test('returns empty array if no matching asset', async () => {
    const { result } = renderHook(
      () => useImage360AnnotationMappingsForInstanceReferences([{ id: 654 }], ['siteId1']),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([]);
  });
});
