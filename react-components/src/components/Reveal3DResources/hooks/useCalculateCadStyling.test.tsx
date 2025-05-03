import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCalculateCadStyling } from './useCalculateCadStyling';
import { ModelWithAssetMappings, ThreeDModelFdmMappings } from '../../../hooks';
import { QueryClient, QueryClientProvider, UseQueryResult } from '@tanstack/react-query';
import {
  FdmConnectionWithNode,
  ModelId,
  ModelRevisionToConnectionMap,
  RevisionId
} from '../../CacheProvider/types';
import { CogniteInternalId, Node3D } from '@cognite/sdk';
import {
  AssetStylingGroup,
  CadModelOptions,
  FdmAssetStylingGroup,
  HybridFdmAssetStylingGroup
} from '..';
import { IndexSet, NumericRange } from '@cognite/reveal';
import { Color } from 'three';
import { renderHook, waitFor } from '@testing-library/react';
import { CommandsController, RevealRenderTarget, RootDomainObject } from '../../../architecture';
import { Mock } from 'moq.ts';
import { FC, PropsWithChildren } from 'react';
import { ViewerContext } from '../../RevealCanvas/ViewerContext';
import { CdfCaches } from '../../../architecture/base/renderTarget/CdfCaches';
import { viewerMock } from '#test-utils/fixtures/viewer';
import { sdkMock } from '#test-utils/fixtures/sdk';
import { AssetMappingAndNode3DCache } from '../../CacheProvider';
import { StyledModel } from '../types';
import { getNodeSubtreeNumericRange } from './utils/getNodeSubtreeNumericRange';
import { AssetMappingsContext } from '../../../hooks/AssetMappings.context';

describe('useCalculateCadStyling', () => {
  const mockModels = [
    { modelId: 1, revisionId: 1, type: 'cad' } as unknown as CadModelOptions,
    { modelId: 2, revisionId: 2, type: 'cad' } as unknown as CadModelOptions
  ];

  const mockFdmConnectionWithNodes: FdmConnectionWithNode[] = [
    {
      connection: {
        instance: { externalId: 'externalId1', space: 'space1' },
        modelId: 1,
        revisionId: 1,
        treeIndex: 1
      },
      cadNode: {
        id: 1,
        name: 'Node1',
        properties: {},
        treeIndex: 1,
        parentId: 0,
        depth: 0,
        subtreeSize: 0
      },
      views: [{ externalId: 'viewExternalId1', space: 'space1', version: 'v1', type: 'view' }]
    },
    {
      connection: {
        instance: { externalId: 'externalId2', space: 'space2' },
        modelId: 2,
        revisionId: 2,
        treeIndex: 2
      },
      cadNode: {
        id: 2,
        name: 'Node2',
        properties: {},
        treeIndex: 2,
        parentId: 0,
        depth: 0,
        subtreeSize: 0
      },
      views: [{ externalId: 'viewExternalId2', space: 'space2', version: 'v1', type: 'view' }]
    }
  ];

  const mockAssetNodesForRevisionData = [
    {
      model: mockModels[0],
      assetMappings: [
        {
          treeIndex: 1,
          subtreeSize: 0,
          nodeId: 1,
          assetId: undefined,
          assetInstanceId: { externalId: 'externalId1', space: 'space1' }
        }
      ]
    },
    {
      model: mockModels[1],
      assetMappings: [{ treeIndex: 2, subtreeSize: 0, nodeId: 1, assetId: 1 }]
    }
  ];

  const indexSet0 = new IndexSet();
  const indexRange0 = new NumericRange(1, 0);
  indexSet0.addRange(indexRange0);

  const indexSet1 = new IndexSet();
  mockFdmConnectionWithNodes.forEach((edge) => {
    const treeIndexRange = getNodeSubtreeNumericRange(edge.cadNode);
    indexSet1.addRange(treeIndexRange);
  });

  const indexSet2 = new IndexSet();
  const indexRange2 = new NumericRange(2, 0);
  indexSet2.addRange(indexRange2);

  const styledModelsExpected: StyledModel[] = [
    {
      model: mockModels[0],
      styleGroups: [
        {
          style: { color: new Color('red') },
          treeIndexSet: indexSet0
        },
        {
          style: { color: new Color('red') },
          treeIndexSet: indexSet1
        }
      ]
    },
    {
      model: mockModels[1],
      styleGroups: [
        {
          style: { color: new Color('red') },
          treeIndexSet: indexSet2
        },
        {
          style: { color: new Color('red') },
          treeIndexSet: new IndexSet()
        }
      ]
    }
  ];

  const mockInstanceGroups: Array<
    FdmAssetStylingGroup | AssetStylingGroup | HybridFdmAssetStylingGroup
  > = [
    {
      fdmAssetExternalIds: [
        {
          externalId: 'externalId1',
          space: 'space1'
        }
      ],
      style: {
        cad: { color: new Color('red') }
      }
    },
    {
      assetIds: [1, 2],
      style: {
        cad: { color: new Color('red') }
      }
    },
    {
      hybridFdmAssetExternalIds: [
        {
          externalId: 'externalId2',
          space: 'space2'
        }
      ],
      style: {
        cad: { color: new Color('red') }
      }
    }
  ];

  const mockDefaultResourceStyling = {
    cad: {
      mapped: { color: new Color('red') }
    }
  };

  const mockNodesForAssetIds = async (
    _modelId: ModelId,
    _revisionId: RevisionId,
    assetIds: CogniteInternalId[]
  ) => {
    const assetToNodeMap = new Map<CogniteInternalId, Node3D[]>();
    for (const assetId of assetIds) {
      assetToNodeMap.set(assetId, [
        {
          id: assetId,
          treeIndex: assetId,
          parentId: 0,
          depth: 0,
          name: 'node-name',
          subtreeSize: 0
        } as Node3D
      ]);
    }
    return assetToNodeMap;
  };
  const assetMappingAndNode3DCacheMock = new Mock<AssetMappingAndNode3DCache>()
    .setup((p) => p.getNodesForAssetIds)
    .returns(mockNodesForAssetIds);

  const cdfCachesMock = new Mock<CdfCaches>()
    .setup((p) => p.assetMappingAndNode3dCache)
    .returns(assetMappingAndNode3DCacheMock.object())
    .object();

  const commandsControllerMock = new Mock<CommandsController>()
    .setup((p) => p.update.bind(p))
    .returns(vi.fn())
    .setup((p) => p.addEventListeners.bind(p))
    .returns(vi.fn())
    .setup((p) => p.removeEventListeners.bind(p))
    .returns(vi.fn())
    .setup((p) => p.dispose.bind(p))
    .returns(vi.fn())
    .object();

  const mockBaseRenderTarget = new Mock<RevealRenderTarget>()
    .setup((p) => p.viewer)
    .returns(viewerMock)
    .setup((p) => p.cdfCaches)
    .returns(cdfCachesMock)
    .setup((p) => p.commandsController)
    .returns(commandsControllerMock)
    .setup((p) => p.invalidate.bind(p))
    .returns(vi.fn());

  const root = new RootDomainObject(mockBaseRenderTarget.object(), sdkMock);
  const renderTargetMock = mockBaseRenderTarget
    .setup((p) => p.rootDomainObject)
    .returns(root)
    .object();

  const mockUseAssetMappedNodesForRevisions = vi.fn();
  const mockUseMappedEdgesForRevisions = vi.fn();
  const mockUseHybridAssetMappings = vi.fn();
  const queryClient = new QueryClient();

  const wrapper: FC<PropsWithChildren> = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <ViewerContext.Provider value={renderTargetMock}>
        <AssetMappingsContext.Provider
          value={{
            useAssetMappedNodesForRevisions: mockUseAssetMappedNodesForRevisions,
            useHybridAssetMappings: mockUseHybridAssetMappings,
            useMappedEdgesForRevisions: mockUseMappedEdgesForRevisions
          }}>
          {children}
        </AssetMappingsContext.Provider>
      </ViewerContext.Provider>
    </QueryClientProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return styled models and loading state when mappings are available', async () => {
    const mappedEdgesForRevisionData = new Map<`${number}/${number}`, FdmConnectionWithNode[]>();
    mappedEdgesForRevisionData.set('1/1', mockFdmConnectionWithNodes);

    const mappedEdgesForRevision = {
      data: mappedEdgesForRevisionData,
      isLoading: false,
      isFetched: true,
      isError: false
    } as UseQueryResult<ModelRevisionToConnectionMap>;

    mockUseMappedEdgesForRevisions.mockReturnValue(mappedEdgesForRevision);

    const mappedAssetNodesForRevision = {
      data: mockAssetNodesForRevisionData,
      isLoading: false,
      isFetched: true,
      isError: false
    } as UseQueryResult<ModelWithAssetMappings[]>;

    mockUseAssetMappedNodesForRevisions.mockReturnValue(mappedAssetNodesForRevision);

    const hybridAssetMappingsData = {
      data: [
        {
          modelId: 1,
          revisionId: 1,
          mappings: new Map([[1, [mockFdmConnectionWithNodes[0].cadNode]]])
        },
        {
          modelId: 2,
          revisionId: 2,
          mappings: new Map([[2, [mockFdmConnectionWithNodes[1].cadNode]]])
        }
      ],
      isLoading: false,
      isFetched: true,
      isError: false
    } as unknown as UseQueryResult<ThreeDModelFdmMappings[]>;

    mockUseHybridAssetMappings.mockReturnValue(hybridAssetMappingsData);

    const { result } = renderHook(
      () => useCalculateCadStyling(mockModels, mockInstanceGroups, mockDefaultResourceStyling),
      {
        wrapper
      }
    );

    expect(result.current.styledModels).toBeDefined();
    await waitFor(() => {
      expect(result.current.isModelMappingsLoading).toBe(false);
    });
    await waitFor(() => {
      expect(result.current.styledModels).toEqual(styledModelsExpected);
    });
  });

  it('should handle loading state when mappings are still loading and styled groups are empty for each model', () => {
    const mappedEdgesForRevision = {
      data: undefined,
      isLoading: true
    } as UseQueryResult<ModelRevisionToConnectionMap>;

    mockUseMappedEdgesForRevisions.mockReturnValue(mappedEdgesForRevision);

    const mappedAssetNodesForRevision = {
      data: undefined,
      isLoading: true
    } as UseQueryResult<ModelWithAssetMappings[]>;

    mockUseAssetMappedNodesForRevisions.mockReturnValue(mappedAssetNodesForRevision);

    const hybridAssetMappingsData = {
      data: undefined,
      isLoading: true
    } as UseQueryResult<ThreeDModelFdmMappings[]>;

    mockUseHybridAssetMappings.mockReturnValue(hybridAssetMappingsData);

    const { result } = renderHook(
      () => useCalculateCadStyling(mockModels, mockInstanceGroups, mockDefaultResourceStyling),
      {
        wrapper
      }
    );

    const expectedResult = [
      {
        model: {
          modelId: 1,
          revisionId: 1,
          type: 'cad'
        },
        styleGroups: []
      },
      {
        model: {
          modelId: 2,
          revisionId: 2,
          type: 'cad'
        },
        styleGroups: []
      }
    ];

    expect(result.current.styledModels).toEqual(expectedResult);
    expect(result.current.isModelMappingsLoading).toBe(true);
  });
});
