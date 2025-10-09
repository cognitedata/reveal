import { describe, expect, beforeEach, test } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactElement, type ReactNode } from 'react';
import { type IdEither } from '@cognite/sdk';
import {
  type PointCloudIntersection,
  type ClassicDataSourceType,
  type DMInstanceRef,
  type AnyIntersection
} from '@cognite/reveal';
import { Vector3 } from 'three';
import {
  createPointCloudMock,
  createPointCloudIntersectionMock
} from '#test-utils/fixtures/pointCloud';
import { cadMock } from '#test-utils/fixtures/cadModel';
import { type PointCloudAnnotationMappedAssetData } from '../types';
import { createAssetMock, createFdmNodeItem } from '#test-utils/fixtures/assets';
import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';
import {
  defaultUsePointCloudAnnotationMappingForIntersectionDependencies,
  UsePointCloudAnnotationMappingForIntersectionContext
} from './usePointCloudAnnotationMappingForIntersection.context';
import { usePointCloudAnnotationMappingForIntersection } from './usePointCloudAnnotationMappingForIntersection';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false
    }
  }
});

const dependencies = getMocksByDefaultDependencies(
  defaultUsePointCloudAnnotationMappingForIntersectionDependencies
);

const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
  <QueryClientProvider client={queryClient}>
    <UsePointCloudAnnotationMappingForIntersectionContext.Provider value={dependencies}>
      {children}
    </UsePointCloudAnnotationMappingForIntersectionContext.Provider>
  </QueryClientProvider>
);

describe(usePointCloudAnnotationMappingForIntersection.name, () => {
  const mockClassicIdEither: IdEither = { id: 123 };
  const classicAssetInstance = createAssetMock(123);
  const classicAssetInstance2 = createAssetMock(456);

  const dmAssetInstance = createFdmNodeItem({ externalId: 'ext-id', space: 'asset-space' });

  const mockDmsIdentifier: DMInstanceRef = {
    externalId: dmAssetInstance.externalId,
    space: dmAssetInstance.space
  };

  const pointCloudModelMock = createPointCloudMock({
    modelId: 456,
    revisionId: 789
  });

  const mockClassicIntersection = createPointCloudIntersectionMock({
    model: pointCloudModelMock,
    assetRef: mockClassicIdEither,
    instanceRef: undefined,
    annotationId: 1
  });

  const mockHybridIntersection = createPointCloudIntersectionMock({
    model: pointCloudModelMock,
    assetRef: undefined,
    instanceRef: mockDmsIdentifier,
    annotationId: 2
  });

  const mockFetchAnnotationsForModelReturn: PointCloudAnnotationMappedAssetData[] = [
    { annotationId: 1, asset: classicAssetInstance },
    { annotationId: 2, asset: classicAssetInstance2 }
  ];
  beforeEach(() => {
    queryClient.clear();
    dependencies.fetchAnnotationsForModel.mockResolvedValue(mockFetchAnnotationsForModelReturn);
  });

  test('returns undefined when intersection is undefined', async () => {
    const { result } = renderHook(() => usePointCloudAnnotationMappingForIntersection(undefined), {
      wrapper
    });

    expect(result.current.data).toBeUndefined();
    expect(result.current.isFetching).toBe(false);
  });

  test('returns undefined when intersection is not pointcloud type', async () => {
    const cadIntersection: AnyIntersection = {
      type: 'cad',
      model: cadMock,
      point: new Vector3(0, 0, 0),
      treeIndex: 0,
      distanceToCamera: 0
    };

    const { result } = renderHook(
      () => usePointCloudAnnotationMappingForIntersection(cadIntersection),
      {
        wrapper
      }
    );

    expect(result.current.data).toBeUndefined();
    expect(result.current.isFetching).toBe(false);
  });

  test('returns annotation mappings for classic intersection with assetRef', async () => {
    dependencies.fetchAnnotationsForModel.mockResolvedValue(mockFetchAnnotationsForModelReturn);

    const { result } = renderHook(
      () => usePointCloudAnnotationMappingForIntersection(mockClassicIntersection),
      { wrapper }
    );

    const expectedResult: PointCloudAnnotationMappedAssetData[] | undefined = [
      { annotationId: 1, asset: classicAssetInstance },
      { annotationId: 2, asset: classicAssetInstance2 }
    ];
    await waitFor(() => {
      expect(result.current.data).toEqual(expectedResult);
    });
  });

  test('returns annotation mappings for hybrid intersection with instanceRef', async () => {
    const mockAnnotationMap: PointCloudAnnotationMappedAssetData[] = [
      { annotationId: 2, asset: dmAssetInstance }
    ];

    dependencies.fetchAnnotationsForModel.mockResolvedValue(mockAnnotationMap);

    const { result } = renderHook(
      () => usePointCloudAnnotationMappingForIntersection(mockHybridIntersection),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(mockAnnotationMap);
    });
  });

  test('query is disabled when intersection is not pointcloud type', async () => {
    const cadIntersection: AnyIntersection = {
      type: 'cad',
      model: cadMock,
      point: new Vector3(0, 0, 0),
      treeIndex: 0,
      distanceToCamera: 0
    };

    const { result } = renderHook(
      () => usePointCloudAnnotationMappingForIntersection(cadIntersection),
      {
        wrapper
      }
    );

    expect(result.current.isFetching).toBe(false);
    expect(dependencies.fetchAnnotationsForModel).not.toHaveBeenCalled();
  });

  test('query is disabled when reference is undefined', async () => {
    const intersectionNoRef: PointCloudIntersection<ClassicDataSourceType> = {
      type: 'pointcloud',
      model: pointCloudModelMock,
      volumeMetadata: {
        annotationId: 1
      },
      point: new Vector3(1, 2, 3),
      pointIndex: 0,
      distanceToCamera: 0,
      annotationId: 1
    };

    const { result } = renderHook(
      () => usePointCloudAnnotationMappingForIntersection(intersectionNoRef),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isFetching).toBe(false);
      expect(result.current.data).toBeUndefined();
      expect(dependencies.fetchAnnotationsForModel).not.toHaveBeenCalled();
    });
  });

  test('handles pointcloud intersection with multiple annotations in map', async () => {
    const mockAnnotationMap: PointCloudAnnotationMappedAssetData[] = [
      { annotationId: 1, asset: classicAssetInstance },
      { annotationId: 1, asset: classicAssetInstance2 },
      { annotationId: 2, asset: dmAssetInstance }
    ];

    dependencies.fetchAnnotationsForModel.mockResolvedValue(mockAnnotationMap);

    const { result } = renderHook(
      () => usePointCloudAnnotationMappingForIntersection(mockClassicIntersection),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual([
        { annotationId: 1, asset: classicAssetInstance },
        { annotationId: 1, asset: classicAssetInstance2 },
        { annotationId: 2, asset: dmAssetInstance }
      ]);
    });
  });
});
