import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCalculateInstanceStyling } from './useCalculateInstanceStyling';
import { ThreeDModelFdmMappings, useNodesForAssets } from '../../../hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FC, PropsWithChildren } from 'react';
import { AssetMappingsContext } from '../../../hooks/AssetMappings.context';
import { CadModelOptions, ModelStyleGroup } from '../types';
import { mockInstanceGroups } from '#test-utils/fixtures/instanceGroups';
import { renderHook } from '@testing-library/react';
import { ModelRevisionAssetNodesResult } from '../../CacheProvider/types';
import { CogniteExternalId, Node3D } from '@cognite/sdk';
import { isFdmAssetStylingGroup } from '../../../utilities/StylingGroupUtils';
import { getNodeSubtreeNumericRange } from './utils/getNodeSubtreeNumericRange';
import { IndexSet } from '@cognite/reveal';
import { Color } from 'three';

describe('useCalculateInstanceStyling', () => {
  const mockModels = [
    { modelId: 1, revisionId: 1, type: 'cad' } as unknown as CadModelOptions,
    { modelId: 2, revisionId: 2, type: 'cad' } as unknown as CadModelOptions
  ];

  const fdmMapping: Map<CogniteExternalId, Node3D[]> = new Map([
    [
      'externalId1',
      [
        {
          id: 1,
          treeIndex: 0,
          subtreeSize: 1,
          parentId: 0,
          depth: 0,
          name: '1'
        }
      ]
    ]
  ]);
  const mockFdmAssetMappings: ThreeDModelFdmMappings[] = [
    {
      modelId: 1,
      revisionId: 1,
      mappings: fdmMapping
    }
  ];

  const nodes: Node3D[] = [
    {
      id: 1,
      treeIndex: 0,
      subtreeSize: 1,
      parentId: 0,
      depth: 0,
      name: '1'
    }
  ];
  const mockModelAssetMappings: ModelRevisionAssetNodesResult[] = [
    {
      modelId: 1,
      revisionId: 1,
      assetToNodeMap: new Map([
        [101, nodes],
        [102, nodes]
      ])
    },
    {
      modelId: 2,
      revisionId: 2,
      assetToNodeMap: new Map([
        [201, nodes],
        [202, nodes]
      ])
    }
  ];
  const mockModelHybridAssetMappings = [{ data: mockFdmAssetMappings }];

  const mockUseAssetMappedNodesForRevisions = vi.fn();
  const mockUseMappedEdgesForRevisions = vi.fn();
  const mockUseHybridAssetMappings = vi.fn();
  const mockUseNodesForAssets = vi.fn();
  const mockUseFdmAssetMappings = vi.fn();
  const queryClient = new QueryClient();

  const wrapper: FC<PropsWithChildren> = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <AssetMappingsContext.Provider
        value={{
          useAssetMappedNodesForRevisions: mockUseAssetMappedNodesForRevisions,
          useHybridAssetMappings: mockUseHybridAssetMappings,
          useMappedEdgesForRevisions: mockUseMappedEdgesForRevisions,
          useNodesForAssets: mockUseNodesForAssets,
          useFdmAssetMappings: mockUseFdmAssetMappings
        }}>
        {children}
      </AssetMappingsContext.Provider>
    </QueryClientProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return combined mapped style groups and loading state', () => {

    mockUseFdmAssetMappings.mockReturnValue({ data: mockFdmAssetMappings });
    mockUseNodesForAssets.mockReturnValue({
      data: mockModelAssetMappings,
      isLoading: false,
      isFetched: true,
      isError: false
    });
    mockUseHybridAssetMappings.mockReturnValue({ data: mockModelHybridAssetMappings });

    const { result } = renderHook(
      () => useCalculateInstanceStyling(mockModels, mockInstanceGroups),
      { wrapper }
    );

    const fdmInstancesGroups = mockInstanceGroups
      .filter(isFdmAssetStylingGroup)
      .flatMap((instanceGroup) => instanceGroup.fdmAssetExternalIds);

    expect(mockUseFdmAssetMappings).toHaveBeenCalledWith(fdmInstancesGroups, mockModels);
    expect(mockUseNodesForAssets).toHaveBeenCalledWith(mockModels, [1, 2]);
    expect(mockUseHybridAssetMappings).toHaveBeenCalledWith(
      [
        {
          externalId: 'externalId2',
          space: 'space2'
        }
      ],
      mockModels
    );

    const indexSet = new IndexSet();
    nodes.forEach((n) => {
      indexSet.addRange(getNodeSubtreeNumericRange(n));
    });

    const expectedCombinedMappedStyleGroups: ModelStyleGroup[] = [
      {
        model: mockModels[0],
        styleGroup: [
          {
            style: {
              color: new Color('red')
            },
            treeIndexSet: indexSet
          }
        ]
      },
      {
        model: mockModels[1],
        styleGroup: []
      }
    ];

    expect(result.current).toEqual({
      combinedMappedStyleGroups: expectedCombinedMappedStyleGroups,
      isModelMappingsLoading: false
    });
  });

  it('should handle loading state and empty styling group when model mappings are still loading', () => {
    mockUseFdmAssetMappings.mockReturnValue({ data: undefined });
    mockUseHybridAssetMappings.mockReturnValue({ data: undefined });
    mockUseNodesForAssets.mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetched: false,
      isError: false
    });

    const { result } = renderHook(
      () => useCalculateInstanceStyling(mockModels, mockInstanceGroups),
      { wrapper }
    );

    const expectedCombinedStyleGroups = [
      {
        model: {
          modelId: 1,
          revisionId: 1,
          type: "cad",
        },
        styleGroup: [],
      },
      {
        model: {
          modelId: 2,
          revisionId: 2,
          type: "cad",
        },
        styleGroup: [],
      }
    ];

    expect(result.current.isModelMappingsLoading).toBe(true);
    expect(result.current.combinedMappedStyleGroups).toEqual(expectedCombinedStyleGroups);
  });

  it('should return error and empty styleGroups when returning error when fetching any mappings', () => {
    mockUseFdmAssetMappings.mockReturnValue({ data: undefined });
    mockUseHybridAssetMappings.mockReturnValue({ data: undefined });
    mockUseNodesForAssets.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetched: false,
      isError: true
    } as ReturnType<typeof useNodesForAssets>);

    const { result } = renderHook(
      () => useCalculateInstanceStyling(mockModels, mockInstanceGroups),
      { wrapper }
    );

    const expectedCombinedStyleGroups = [
      {
        model: {
          modelId: 1,
          revisionId: 1,
          type: "cad",
        },
        styleGroup: [],
      },
      {
        model: {
          modelId: 2,
          revisionId: 2,
          type: "cad",
        },
        styleGroup: [],
      }
    ];

    expect(result.current.isModelMappingsLoading).toBe(false);
    expect(result.current.isModelMappingsError).toBe(true);
    expect(result.current.combinedMappedStyleGroups).toEqual(expectedCombinedStyleGroups);
  });
});
