import { describe, expect, beforeEach, test } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePointCloudAnnotationMappingForAssetId } from './usePointCloudAnnotationMappingForAssetId';
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
  createPointCloudDMMock,
  createPointCloudIntersectionMock
} from '#test-utils/fixtures/pointCloud';
import { cadMock } from '#test-utils/fixtures/cadModel';
import { type PointCloudAnnotationMappedAssetData } from '../types';
import { createAssetMock, createFdmNodeItem } from '#test-utils/fixtures/assets';
import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';
import {
  defaultUsePointCloudAnnotationMappingForAssetIdDependencies,
  UsePointCloudAnnotationMappingForAssetIdContext
} from './usePointCloudAnnotationMappingForAssetId.context';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false
    }
  }
});

const dependencies = getMocksByDefaultDependencies(
  defaultUsePointCloudAnnotationMappingForAssetIdDependencies
);

const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
  <QueryClientProvider client={queryClient}>
    <UsePointCloudAnnotationMappingForAssetIdContext.Provider value={dependencies}>
      {children}
    </UsePointCloudAnnotationMappingForAssetIdContext.Provider>
  </QueryClientProvider>
);

describe(usePointCloudAnnotationMappingForAssetId.name, () => {
  const mockClassicIdEither: IdEither = { id: 123 };
  const classicAssetInstance = createAssetMock(123);
  const classicAssetInstance2 = createAssetMock(456);

  const dmAssetInstance = createFdmNodeItem({ externalId: 'ext-id', space: 'asset-space' });

  const mockDmsIdentifier: DMInstanceRef = { externalId: dmAssetInstance.externalId, space: dmAssetInstance.space };

  const pointCloudModelMock = createPointCloudMock({
    modelId: 456,
    revisionId: 789
  });

  const pointCloudDMMock = createPointCloudDMMock({
    revisionExternalId: 'revision-ext-id',
    revisionSpace: 'test-space'
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

  const mockDmsIntersection = createPointCloudIntersectionMock({
    model: pointCloudDMMock,
    assetRef: mockDmsIdentifier,
    instanceRef: undefined,
    annotationId: 3
  });

  const mockFetchAnnotationsForModelReturn: PointCloudAnnotationMappedAssetData[] = [
    { annotationId: 1, asset: classicAssetInstance },
    { annotationId: 2, asset: classicAssetInstance2 }
  ];
  beforeEach(() => {
    queryClient.clear();
    dependencies.getInstanceDataFromIntersection.mockReturnValue({
      classicModelIdentifier: { modelId: cadMock.modelId, revisionId: cadMock.revisionId },
      dmsModelUniqueIdentifier: undefined,
      reference: mockClassicIdEither
    });
    dependencies.fetchAnnotationsForModel.mockResolvedValue(mockFetchAnnotationsForModelReturn);
  });

  test('returns undefined when intersection is undefined', async () => {
    const { result } = renderHook(() => usePointCloudAnnotationMappingForAssetId(undefined), {
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

    const { result } = renderHook(() => usePointCloudAnnotationMappingForAssetId(cadIntersection), {
      wrapper
    });

    expect(result.current.data).toBeUndefined();
    expect(result.current.isFetching).toBe(false);
  });

  test('returns annotation mappings for classic intersection with assetRef', async () => {
    dependencies.fetchAnnotationsForModel.mockReturnValue(mockFetchAnnotationsForModelReturn);

    const { result } = renderHook(
      () => usePointCloudAnnotationMappingForAssetId(mockClassicIntersection),
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
    const mockAnnotationMap:  PointCloudAnnotationMappedAssetData[] = [
      { annotationId: 2, asset: dmAssetInstance }
    ];

    dependencies.fetchAnnotationsForModel.mockResolvedValue(mockAnnotationMap);


    const { result } = renderHook(
      () => usePointCloudAnnotationMappingForAssetId(mockHybridIntersection),
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

    const { result } = renderHook(() => usePointCloudAnnotationMappingForAssetId(cadIntersection), {
      wrapper
    });

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

    dependencies.getInstanceDataFromIntersection.mockReturnValue({
      classicModelIdentifier: { modelId: cadMock.modelId, revisionId: cadMock.revisionId },
      dmsModelUniqueIdentifier: undefined,
      reference: undefined
    });

    const { result } = renderHook(
      () => usePointCloudAnnotationMappingForAssetId(intersectionNoRef),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isFetching).toBe(false);
      expect(result.current.data).toBeUndefined();
      expect(dependencies.fetchAnnotationsForModel).not.toHaveBeenCalled();
    });
  });

  test('handles pointcloud intersection with multiple annotations in map', async () => {

    const mockAnnotationMap:  PointCloudAnnotationMappedAssetData[] = [
      { annotationId: 1, asset: classicAssetInstance },
      { annotationId: 1, asset: classicAssetInstance2 },
      { annotationId: 2, asset: dmAssetInstance }
    ];

    dependencies.fetchAnnotationsForModel.mockResolvedValue(mockAnnotationMap);

    const { result } = renderHook(
      () => usePointCloudAnnotationMappingForAssetId(mockClassicIntersection),
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
