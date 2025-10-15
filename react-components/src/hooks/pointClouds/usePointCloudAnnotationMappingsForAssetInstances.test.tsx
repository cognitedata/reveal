import { describe, expect, beforeEach, test, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactElement, type ReactNode } from 'react';
import { usePointCloudAnnotationMappingsForAssetInstances } from './usePointCloudAnnotationMappingsForAssetInstances';
import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';
import {
  defaultUsePointCloudAnnotationMappingsForAssetInstancesDependencies,
  UsePointCloudAnnotationMappingsForAssetInstancesContext
} from './usePointCloudAnnotationMappingsForAssetInstances.context';
import { type TypedReveal3DModel } from '../../components/Reveal3DResources/types';
import { createAssetMock, createFdmNodeItem } from '#test-utils/fixtures/assets';
import { type PointCloudAnnotationCache } from '../../components/CacheProvider/PointCloudAnnotationCache';
import { type AddModelOptions, type ClassicDataSourceType } from '@cognite/reveal';
import { type InstanceReference } from '../../utilities/instanceIds';
import { Mock } from 'moq.ts';

describe(usePointCloudAnnotationMappingsForAssetInstances.name, () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });

  const dependencies = getMocksByDefaultDependencies(
    defaultUsePointCloudAnnotationMappingsForAssetInstancesDependencies
  );

  const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
    <QueryClientProvider client={queryClient}>
      <UsePointCloudAnnotationMappingsForAssetInstancesContext.Provider value={dependencies}>
        {children}
      </UsePointCloudAnnotationMappingsForAssetInstancesContext.Provider>
    </QueryClientProvider>
  );

  const mockMatchPointCloudAnnotationsForModel =
    vi.fn<PointCloudAnnotationCache['matchPointCloudAnnotationsForModel']>();

  const mockPointCloudAnnotationCache = new Mock<PointCloudAnnotationCache>()
    .setup((instance) => instance.matchPointCloudAnnotationsForModel)
    .returns(mockMatchPointCloudAnnotationsForModel)
    .setup((instance) => instance.getPointCloudAnnotationsForModel)
    .returns(async () => [])
    .setup((instance) => instance.getPointCloudAnnotationsForInstanceIds)
    .returns(async () => new Map())
    .object();

  const classicModelOptions: AddModelOptions<ClassicDataSourceType> = {
    modelId: 123,
    revisionId: 456
  };

  const classicModelOptions2: AddModelOptions<ClassicDataSourceType> = {
    modelId: 789,
    revisionId: 321
  };

  const typedModels: TypedReveal3DModel[] = [
    {
      type: 'pointcloud',
      ...classicModelOptions
    }
  ];

  const typedModels2: TypedReveal3DModel[] = [
    {
      type: 'pointcloud',
      ...classicModelOptions
    },
    {
      type: 'pointcloud',
      ...classicModelOptions2
    }
  ];

  const classicAssetInstance = createAssetMock(123);
  const classicAssetInstance2 = createAssetMock(456);
  const dmAssetInstance = createFdmNodeItem({
    externalId: 'test-external-id-1',
    space: 'asset-space'
  });

  const classicInstanceReference: InstanceReference = { id: 123 };
  const classicInstanceReference2: InstanceReference = { id: 456 };
  const dmInstanceReference: InstanceReference = {
    externalId: 'test-external-id-1',
    space: 'test-space'
  };

  beforeEach(() => {
    queryClient.clear();
    mockMatchPointCloudAnnotationsForModel.mockResolvedValue(undefined);
    dependencies.usePointCloudAnnotationCache.mockReturnValue(mockPointCloudAnnotationCache);
    dependencies.useModelIdRevisionIdFromModelOptions.mockReturnValue([classicModelOptions]);
  });

  test('returns undefined when assetInstances is undefined', async () => {
    const { result } = renderHook(
      () => usePointCloudAnnotationMappingsForAssetInstances(typedModels, undefined),
      { wrapper }
    );

    expect(result.current.data).toBeUndefined();
    expect(result.current.isFetching).toBe(false);
  });

  test('returns undefined when assetInstances is empty', async () => {
    const { result } = renderHook(
      () => usePointCloudAnnotationMappingsForAssetInstances(typedModels, []),
      { wrapper }
    );

    expect(result.current.data).toBeUndefined();
    expect(result.current.isFetching).toBe(false);
  });

  test('returns annotation mappings for single classic asset instance', async () => {
    const expectedMap = new Map([[1, [classicAssetInstance]]]);
    mockMatchPointCloudAnnotationsForModel.mockResolvedValue(expectedMap);

    const { result } = renderHook(
      () =>
        usePointCloudAnnotationMappingsForAssetInstances(typedModels, [classicInstanceReference]),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual([{ annotationId: 1, asset: classicAssetInstance }]);
  });

  test('returns annotation mappings for multiple classic asset instances', async () => {
    mockMatchPointCloudAnnotationsForModel.mockImplementation(
      async (_modelId, _revisionId, assetId) => {
        if (assetId === classicInstanceReference) {
          return new Map([[1, [classicAssetInstance]]]);
        }
        if (assetId === classicInstanceReference2) {
          return new Map([[2, [classicAssetInstance2]]]);
        }
        return undefined;
      }
    );

    const { result } = renderHook(
      () =>
        usePointCloudAnnotationMappingsForAssetInstances(typedModels, [
          classicInstanceReference,
          classicInstanceReference2
        ]),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual([
      { annotationId: 1, asset: classicAssetInstance },
      { annotationId: 2, asset: classicAssetInstance2 }
    ]);
  });

  test('returns annotation mappings for DM asset instance', async () => {
    const expectedMap = new Map([[1, [dmAssetInstance]]]);
    mockMatchPointCloudAnnotationsForModel.mockResolvedValue(expectedMap);

    const { result } = renderHook(
      () => usePointCloudAnnotationMappingsForAssetInstances(typedModels, [dmInstanceReference]),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual([{ annotationId: 1, asset: dmAssetInstance }]);
  });

  test('returns annotation mappings for mixed classic and DM asset instances', async () => {
    mockMatchPointCloudAnnotationsForModel.mockImplementation(
      async (_modelId, _revisionId, assetId) => {
        if (assetId === classicInstanceReference) {
          return new Map([[1, [classicAssetInstance]]]);
        }
        if (assetId === dmInstanceReference) {
          return new Map([[2, [dmAssetInstance]]]);
        }
        return undefined;
      }
    );

    const { result } = renderHook(
      () =>
        usePointCloudAnnotationMappingsForAssetInstances(typedModels, [
          classicInstanceReference,
          dmInstanceReference
        ]),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual([
      { annotationId: 1, asset: classicAssetInstance },
      { annotationId: 2, asset: dmAssetInstance }
    ]);
  });

  test('returns flattened annotation mappings for multiple models', async () => {
    mockMatchPointCloudAnnotationsForModel.mockImplementation(async (modelId) => {
      if (modelId === classicModelOptions.modelId) {
        return new Map([[1, [classicAssetInstance]]]);
      }
      if (modelId === classicModelOptions2.modelId) {
        return new Map([[2, [classicAssetInstance2]]]);
      }
      return undefined;
    });

    dependencies.useModelIdRevisionIdFromModelOptions.mockReturnValue([
      classicModelOptions,
      classicModelOptions2
    ]);

    const { result } = renderHook(
      () =>
        usePointCloudAnnotationMappingsForAssetInstances(typedModels2, [classicInstanceReference]),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual([
      { annotationId: 1, asset: classicAssetInstance },
      { annotationId: 2, asset: classicAssetInstance2 }
    ]);
  });

  test('returns empty array when cache returns undefined', async () => {
    mockMatchPointCloudAnnotationsForModel.mockResolvedValue(undefined);

    const { result } = renderHook(
      () =>
        usePointCloudAnnotationMappingsForAssetInstances(typedModels, [classicInstanceReference]),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual([]);
  });

  test('handles multiple annotations for the same asset', async () => {
    mockMatchPointCloudAnnotationsForModel.mockImplementation(
      async (_modelId, _revisionId, assetId) => {
        if (assetId === classicInstanceReference) {
          return new Map([
            [1, [classicAssetInstance]],
            [2, [classicAssetInstance]]
          ]);
        }
        if (assetId === classicInstanceReference2) {
          return new Map([[3, [classicAssetInstance2]]]);
        }
        return undefined;
      }
    );

    const { result } = renderHook(
      () =>
        usePointCloudAnnotationMappingsForAssetInstances(typedModels, [
          classicInstanceReference,
          classicInstanceReference2
        ]),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual([
      { annotationId: 1, asset: classicAssetInstance },
      { annotationId: 2, asset: classicAssetInstance },
      { annotationId: 3, asset: classicAssetInstance2 }
    ]);
  });

  test('uses correct query key with sorted model ids and asset instances', async () => {
    mockMatchPointCloudAnnotationsForModel.mockResolvedValue(undefined);

    const { result } = renderHook(
      () =>
        usePointCloudAnnotationMappingsForAssetInstances(typedModels, [
          dmInstanceReference,
          classicInstanceReference
        ]),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(dependencies.useModelIdRevisionIdFromModelOptions).toHaveBeenCalledWith(typedModels);
  });

  test('calls usePointCloudAnnotationCache hook', async () => {
    mockMatchPointCloudAnnotationsForModel.mockResolvedValue(undefined);

    renderHook(
      () =>
        usePointCloudAnnotationMappingsForAssetInstances(typedModels, [classicInstanceReference]),
      { wrapper }
    );

    await waitFor(() => {
      expect(dependencies.usePointCloudAnnotationCache).toHaveBeenCalled();
    });
  });

  test('calls useModelIdRevisionIdFromModelOptions with correct models', async () => {
    mockMatchPointCloudAnnotationsForModel.mockResolvedValue(undefined);

    renderHook(
      () =>
        usePointCloudAnnotationMappingsForAssetInstances(typedModels, [classicInstanceReference]),
      { wrapper }
    );

    await waitFor(() => {
      expect(dependencies.useModelIdRevisionIdFromModelOptions).toHaveBeenCalledWith(typedModels);
    });
  });
});
