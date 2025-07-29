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

const mockModels: AddModelOptions[] = [
  { modelId: 456, revisionId: 789 },
  { modelId: 123, revisionId: 456 }
];

const mockAssetInstanceIds: DmsUniqueIdentifier[] = [
  { space: 'test-space', externalId: 'instance-1' },
  { space: 'test-space', externalId: 'instance-2' }
];

const mockNode3D: Node3D = {
  id: 123,
  name: 'Test Node',
  treeIndex: 456,
  boundingBox: { min: [0, 0, 0], max: [1, 1, 1] },
  parentId: 0,
  depth: 1,
  subtreeSize: 1
};

const mockFdmKey: FdmKey = 'test-space/instance-1';

const mockMappingsMap = new Map<FdmKey, Node3D[]>([
  [mockFdmKey, [mockNode3D]]
]);

const mockThreeDModelFdmMappings: ThreeDModelFdmMappings[] = [
  {
    modelId: mockModels[0].modelId,
    revisionId: mockModels[0].revisionId,
    mappings: mockMappingsMap
  },
  {
    modelId: mockModels[1].modelId,
    revisionId: mockModels[1].revisionId,
    mappings: mockMappingsMap
  }
];

const mockClassicCadAssetMappingCache = new Mock<ClassicCadAssetMappingCache>()
  .setup((p) => p.getNodesForInstanceIds)
  .returns(vi.fn())
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
      mockMappingsMap
    );
  });

  it('should return mappings for asset instance IDs', async () => {
    const { result } = renderHook(
      () => useHybridMappingsForAssetInstances(mockModels, mockAssetInstanceIds),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(mockThreeDModelFdmMappings);
    });

    expect(mockClassicCadAssetMappingCache.getNodesForInstanceIds).toHaveBeenCalledWith(
      mockModels[0].modelId,
      mockModels[0].revisionId,
      mockAssetInstanceIds
    );
  });

  it('should handle empty asset instance IDs', async () => {
    const { result } = renderHook(
      () => useHybridMappingsForAssetInstances(mockModels, []),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual([
        {
          mappings: { items: [] },
          model: mockModels[0]
        },
        {
          mappings: { items: [] },
          model: mockModels[1]
        }
      ]);
    });

    expect(mockClassicCadAssetMappingCache.getNodesForInstanceIds).not.toHaveBeenCalled();
  });

  it('should handle empty models array', async () => {
    const { result } = renderHook(
      () => useHybridMappingsForAssetInstances([], mockAssetInstanceIds),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual([]);
    });

    expect(mockClassicCadAssetMappingCache.getNodesForInstanceIds).not.toHaveBeenCalled();
  });

  it('should handle single model', async () => {
    const singleModel = [mockModels[0]];
    const expectedResult = [mockThreeDModelFdmMappings[0]];

    const { result } = renderHook(
      () => useHybridMappingsForAssetInstances(singleModel, mockAssetInstanceIds),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(expectedResult);
    });

    expect(mockClassicCadAssetMappingCache.getNodesForInstanceIds).toHaveBeenCalledTimes(1);
    expect(mockClassicCadAssetMappingCache.getNodesForInstanceIds).toHaveBeenCalledWith(
      mockModels[0].modelId,
      mockModels[0].revisionId,
      mockAssetInstanceIds
    );
  });

  it('should handle cache returning empty mappings', async () => {
    vi.mocked(mockClassicCadAssetMappingCache.getNodesForInstanceIds).mockResolvedValue(
      new Map()
    );

    const { result } = renderHook(
      () => useHybridMappingsForAssetInstances(mockModels, mockAssetInstanceIds),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual([
        {
          modelId: mockModels[0].modelId,
          revisionId: mockModels[0].revisionId,
          mappings: new Map()
        },
        {
          modelId: mockModels[1].modelId,
          revisionId: mockModels[1].revisionId,
          mappings: new Map()
        }
      ]);
    });

    expect(mockClassicCadAssetMappingCache.getNodesForInstanceIds).toHaveBeenCalledTimes(2);
  });

  it('should have infinite staleTime', async () => {
    const { result } = renderHook(
      () => useHybridMappingsForAssetInstances(mockModels, mockAssetInstanceIds),
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

    const { result } = renderHook(
      () => useHybridMappingsForAssetInstances(mockModels, differentAssetInstanceIds),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(mockThreeDModelFdmMappings);
    });

    expect(mockClassicCadAssetMappingCache.getNodesForInstanceIds).toHaveBeenCalledWith(
      mockModels[0].modelId,
      mockModels[0].revisionId,
      differentAssetInstanceIds
    );
  });

  it('should call cache for each model when fetching mappings', async () => {
    const { result } = renderHook(
      () => useHybridMappingsForAssetInstances(mockModels, mockAssetInstanceIds),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(mockClassicCadAssetMappingCache.getNodesForInstanceIds).toHaveBeenCalledTimes(2);
    expect(mockClassicCadAssetMappingCache.getNodesForInstanceIds).toHaveBeenNthCalledWith(
      1,
      mockModels[0].modelId,
      mockModels[0].revisionId,
      mockAssetInstanceIds
    );
    expect(mockClassicCadAssetMappingCache.getNodesForInstanceIds).toHaveBeenNthCalledWith(
      2,
      mockModels[1].modelId,
      mockModels[1].revisionId,
      mockAssetInstanceIds
    );
  });

  it('should refetch when models change', async () => {
    const { result, rerender } = renderHook(
      ({ models }) => useHybridMappingsForAssetInstances(models, mockAssetInstanceIds),
      {
        wrapper,
        initialProps: { models: [mockModels[0]] }
      }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual([mockThreeDModelFdmMappings[0]]);
    });

    expect(mockClassicCadAssetMappingCache.getNodesForInstanceIds).toHaveBeenCalledTimes(1);

    rerender({ models: mockModels });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockThreeDModelFdmMappings);
    });

    expect(mockClassicCadAssetMappingCache.getNodesForInstanceIds).toHaveBeenCalledTimes(3);
  });

  it('should refetch when asset instance IDs change', async () => {
    const initialInstanceIds = [mockAssetInstanceIds[0]];
    const { result, rerender } = renderHook(
      ({ instanceIds }) => useHybridMappingsForAssetInstances(mockModels, instanceIds),
      {
        wrapper,
        initialProps: { instanceIds: initialInstanceIds }
      }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(mockThreeDModelFdmMappings);
    });

    expect(mockClassicCadAssetMappingCache.getNodesForInstanceIds).toHaveBeenCalledWith(
      mockModels[0].modelId,
      mockModels[0].revisionId,
      initialInstanceIds
    );

    rerender({ instanceIds: mockAssetInstanceIds });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockThreeDModelFdmMappings);
    });

    expect(mockClassicCadAssetMappingCache.getNodesForInstanceIds).toHaveBeenCalledWith(
      mockModels[0].modelId,
      mockModels[0].revisionId,
      mockAssetInstanceIds
    );
  });
}); 