import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { type AddModelOptions } from '@cognite/reveal';
import { useHybridMappingsForAssetInstances } from './useHybridMappingsForAssetInstances';
import {
  UseHybridMappingsForAssetInstancesContext,
  type UseHybridMappingsForAssetInstancesDependencies
} from './useHybridMappingsForAssetInstances.context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type DmsUniqueIdentifier } from '../data-providers';
import { type ThreeDModelFdmMappings } from '../hooks/types';
import { type ClassicCadAssetMappingCache } from '../components/CacheProvider/cad/ClassicCadAssetMappingCache';
import { Mock } from 'moq.ts';
import type { FC, PropsWithChildren } from 'react';
import { type FdmKey } from '../components/CacheProvider/types';
import { type Node3D } from '@cognite/sdk';

const queryClient = new QueryClient();

const modelsMock: AddModelOptions[] = [
  { modelId: 456, revisionId: 789 },
  { modelId: 123, revisionId: 456 }
];

const assetInstanceIdsMock: DmsUniqueIdentifier[] = [
  { space: 'test-space', externalId: 'instance-1' },
  { space: 'test-space', externalId: 'instance-2' }
];

const firstNode3DMock: Node3D = {
  id: 123,
  name: 'Test Node',
  treeIndex: 456,
  boundingBox: { min: [0, 0, 0], max: [1, 1, 1] },
  parentId: 0,
  depth: 1,
  subtreeSize: 1
};

const secondNode3DMock: Node3D = {
  id: 987,
  name: 'Test Node',
  treeIndex: 789,
  boundingBox: { min: [0, 0, 0], max: [1, 1, 1] },
  parentId: 0,
  depth: 1,
  subtreeSize: 1
};

const firstMappingsMock = new Map<FdmKey, Node3D[]>([['test-space/instance-1', [firstNode3DMock]]]);

const secondMappingsMock = new Map<FdmKey, Node3D[]>([
  ['test-space/instance-2', [secondNode3DMock]]
]);

const emptyMappingsMock = new Map<FdmKey, Node3D[]>();

const mockThreeDModelFdmMappings: ThreeDModelFdmMappings[] = [
  {
    modelId: modelsMock[0].modelId,
    revisionId: modelsMock[0].revisionId,
    mappings: firstMappingsMock
  },
  {
    modelId: modelsMock[1].modelId,
    revisionId: modelsMock[1].revisionId,
    mappings: secondMappingsMock
  }
];

const mockClassicCadAssetMappingCache = new Mock<ClassicCadAssetMappingCache>()
  .setup((p) => p.getNodesForInstanceIds)
  .returns(vi.fn<() => Promise<Map<FdmKey, Node3D[]>>>())
  .object();

const mockUseClassicCadAssetMappingCache = vi.fn<() => ClassicCadAssetMappingCache>();

const mockDependencies: UseHybridMappingsForAssetInstancesDependencies = {
  useClassicCadAssetMappingCache: mockUseClassicCadAssetMappingCache
};

const wrapper: FC<PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <UseHybridMappingsForAssetInstancesContext.Provider value={mockDependencies}>
      {children}
    </UseHybridMappingsForAssetInstancesContext.Provider>
  </QueryClientProvider>
);

describe(useHybridMappingsForAssetInstances.name, () => {
  beforeEach(() => {
    queryClient.clear();

    mockUseClassicCadAssetMappingCache.mockReturnValue(mockClassicCadAssetMappingCache);
    vi.mocked(mockClassicCadAssetMappingCache.getNodesForInstanceIds).mockResolvedValue(
      firstMappingsMock
    );
  });

  it('should return mappings for asset instance IDs', async () => {
    vi.mocked(mockClassicCadAssetMappingCache.getNodesForInstanceIds)
      .mockResolvedValueOnce(firstMappingsMock)
      .mockResolvedValueOnce(secondMappingsMock);

    const { result } = renderHook(
      () => useHybridMappingsForAssetInstances(modelsMock, assetInstanceIdsMock),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(mockThreeDModelFdmMappings);
    });

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.[0]).toMatchObject({
      modelId: modelsMock[0].modelId,
      revisionId: modelsMock[0].revisionId,
      mappings: firstMappingsMock
    });
    expect(result.current.data?.[1]).toMatchObject({
      modelId: modelsMock[1].modelId,
      revisionId: modelsMock[1].revisionId,
      mappings: secondMappingsMock
    });

    modelsMock.forEach((model) => {
      expect(mockClassicCadAssetMappingCache.getNodesForInstanceIds).toHaveBeenCalledWith(
        model.modelId,
        model.revisionId,
        assetInstanceIdsMock
      );
    });
  });

  it('should handle empty asset instance IDs', async () => {
    const { result } = renderHook(() => useHybridMappingsForAssetInstances(modelsMock, []), {
      wrapper
    });

    await waitFor(() => {
      expect(result.current.data).toHaveLength(modelsMock.length);
      result.current.data?.forEach((item, idx) => {
        expect(item).toMatchObject({
          modelId: modelsMock[idx].modelId,
          revisionId: modelsMock[idx].revisionId,
          mappings: emptyMappingsMock
        });
      });
    });

    expect(result.current.data).toHaveLength(modelsMock.length);
    result.current.data?.forEach((item, idx) => {
      expect(item).toMatchObject({
        mappings: emptyMappingsMock,
        modelId: modelsMock[idx].modelId,
        revisionId: modelsMock[idx].revisionId
      });
    });

    expect(result.current.data).toHaveLength(modelsMock.length);
    result.current.data?.forEach((item, idx) => {
      expect(item).toMatchObject({
        mappings: emptyMappingsMock,
        modelId: modelsMock[idx].modelId,
        revisionId: modelsMock[idx].revisionId
      });
    });

    expect(mockClassicCadAssetMappingCache.getNodesForInstanceIds).not.toHaveBeenCalled();
  });

  it('should handle empty models array', async () => {
    const { result } = renderHook(
      () => useHybridMappingsForAssetInstances([], assetInstanceIdsMock),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual([]);
    });

    expect(mockClassicCadAssetMappingCache.getNodesForInstanceIds).not.toHaveBeenCalled();
  });

  it('should handle single model', async () => {
    const singleModel = [modelsMock[0]];
    const expectedResult = [mockThreeDModelFdmMappings[0]];

    const { result } = renderHook(
      () => useHybridMappingsForAssetInstances(singleModel, assetInstanceIdsMock),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(expectedResult);
    });

    expect(mockClassicCadAssetMappingCache.getNodesForInstanceIds).toHaveBeenCalledTimes(1);
    expect(mockClassicCadAssetMappingCache.getNodesForInstanceIds).toHaveBeenCalledWith(
      modelsMock[0].modelId,
      modelsMock[0].revisionId,
      assetInstanceIdsMock
    );
  });

  it('should handle cache returning empty mappings', async () => {
    vi.mocked(mockClassicCadAssetMappingCache.getNodesForInstanceIds).mockResolvedValue(new Map());

    const { result } = renderHook(
      () => useHybridMappingsForAssetInstances(modelsMock, assetInstanceIdsMock),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.data).toHaveLength(2);
      result.current.data?.forEach((item, idx) => {
        expect(item).toMatchObject({
          modelId: modelsMock[idx].modelId,
          revisionId: modelsMock[idx].revisionId,
          mappings: new Map()
        });
      });
    });

    expect(result.current.data).toHaveLength(2);
    result.current.data?.forEach((item) => {
      expect(item.mappings.size).toBe(0);
    });
    expect(result.current.isError).toBe(false);

    expect(mockClassicCadAssetMappingCache.getNodesForInstanceIds).toHaveBeenCalledTimes(2);
  });

  it('should use correct query key and validate hook dependencies', async () => {
    const { result } = renderHook(
      () => useHybridMappingsForAssetInstances(modelsMock, assetInstanceIdsMock),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(mockUseClassicCadAssetMappingCache).toHaveBeenCalled();

    expect(result.current.data).toHaveLength(2);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it('should have infinite staleTime', async () => {
    const { result } = renderHook(
      () => useHybridMappingsForAssetInstances(modelsMock, assetInstanceIdsMock),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.isStale).toBe(false);
  });

  it('should handle different asset instance ID formats', async () => {
    const differentAssetInstanceIds: DmsUniqueIdentifier[] = [
      { space: 'different-space', externalId: 'external-1' },
      { space: 'another-space', externalId: 'external-2' }
    ];

    vi.mocked(mockClassicCadAssetMappingCache.getNodesForInstanceIds)
      .mockResolvedValueOnce(firstMappingsMock)
      .mockResolvedValueOnce(secondMappingsMock);

    const { result } = renderHook(
      () => useHybridMappingsForAssetInstances(modelsMock, differentAssetInstanceIds),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(mockThreeDModelFdmMappings);
    });

    expect(mockClassicCadAssetMappingCache.getNodesForInstanceIds).toHaveBeenCalledWith(
      modelsMock[0].modelId,
      modelsMock[0].revisionId,
      differentAssetInstanceIds
    );
  });

  it('should call cache for each model when fetching mappings', async () => {
    vi.mocked(mockClassicCadAssetMappingCache.getNodesForInstanceIds)
      .mockResolvedValueOnce(firstMappingsMock)
      .mockResolvedValueOnce(secondMappingsMock);

    const { result } = renderHook(
      () => useHybridMappingsForAssetInstances(modelsMock, assetInstanceIdsMock),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data![0]).toMatchObject({
      modelId: modelsMock[0].modelId,
      revisionId: modelsMock[0].revisionId,
      mappings: firstMappingsMock
    });
    expect(result.current.data![1]).toMatchObject({
      modelId: modelsMock[1].modelId,
      revisionId: modelsMock[1].revisionId,
      mappings: secondMappingsMock
    });

    expect(mockClassicCadAssetMappingCache.getNodesForInstanceIds).toHaveBeenCalledTimes(2);
    expect(mockClassicCadAssetMappingCache.getNodesForInstanceIds).toHaveBeenNthCalledWith(
      1,
      modelsMock[0].modelId,
      modelsMock[0].revisionId,
      assetInstanceIdsMock
    );
    expect(mockClassicCadAssetMappingCache.getNodesForInstanceIds).toHaveBeenNthCalledWith(
      2,
      modelsMock[1].modelId,
      modelsMock[1].revisionId,
      assetInstanceIdsMock
    );
  });

  it('should refetch when models change', async () => {
    vi.mocked(mockClassicCadAssetMappingCache.getNodesForInstanceIds)
      .mockResolvedValueOnce(firstMappingsMock)
      .mockResolvedValueOnce(firstMappingsMock)
      .mockResolvedValueOnce(secondMappingsMock);

    const { result, rerender } = renderHook(
      ({ models }) => useHybridMappingsForAssetInstances(models, assetInstanceIdsMock),
      {
        wrapper,
        initialProps: { models: [modelsMock[0]] }
      }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual([mockThreeDModelFdmMappings[0]]);
    });

    expect(mockClassicCadAssetMappingCache.getNodesForInstanceIds).toHaveBeenCalledTimes(1);

    rerender({ models: modelsMock });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockThreeDModelFdmMappings);
    });

    expect(mockClassicCadAssetMappingCache.getNodesForInstanceIds).toHaveBeenCalledTimes(3);
  });

  it('should refetch when asset instance IDs change', async () => {
    vi.mocked(mockClassicCadAssetMappingCache.getNodesForInstanceIds)
      .mockResolvedValueOnce(firstMappingsMock)
      .mockResolvedValueOnce(secondMappingsMock)
      .mockResolvedValueOnce(firstMappingsMock)
      .mockResolvedValueOnce(secondMappingsMock);

    const initialInstanceIds = [assetInstanceIdsMock[0]];
    const { result, rerender } = renderHook(
      ({ instanceIds }) => useHybridMappingsForAssetInstances(modelsMock, instanceIds),
      {
        wrapper,
        initialProps: { instanceIds: initialInstanceIds }
      }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(mockThreeDModelFdmMappings);
    });

    expect(mockClassicCadAssetMappingCache.getNodesForInstanceIds).toHaveBeenCalledWith(
      modelsMock[0].modelId,
      modelsMock[0].revisionId,
      initialInstanceIds
    );

    rerender({ instanceIds: assetInstanceIdsMock });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockThreeDModelFdmMappings);
    });

    expect(mockClassicCadAssetMappingCache.getNodesForInstanceIds).toHaveBeenCalledWith(
      modelsMock[0].modelId,
      modelsMock[0].revisionId,
      assetInstanceIdsMock
    );
  });
});
