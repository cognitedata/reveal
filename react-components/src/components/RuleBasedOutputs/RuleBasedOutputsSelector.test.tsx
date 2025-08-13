import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { RuleBasedOutputsSelector } from './RuleBasedOutputsSelector';
import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';
import {
  defaultRuleBasedOutputsSelectorDependencies,
  RuleBasedOutputsSelectorContext
} from './RuleBasedOutputsSelector.context';
import { type PropsWithChildren, type ReactElement } from 'react';
import { cadMock } from '#test-utils/fixtures/cadModel';
import { type ModelWithAssetMappings } from '../../hooks/cad/modelWithAssetMappings';
import { QueryClient, QueryClientProvider, type UseQueryResult } from '@tanstack/react-query';
import { type Asset, type Node3D } from '@cognite/sdk';
import {
  type CadNodeIdData,
  type FdmCadConnection,
  type FdmConnectionWithNode,
  type ModelRevisionToConnectionMap
} from '../CacheProvider/types';
import {
  type AllMappingStylingGroupAndStyleIndex,
  type AssetStylingGroupAndStyleIndex,
  type FdmInstanceNodeWithConnectionAndProperties,
  type FdmStylingGroupAndStyleIndex,
  type RuleOutputSet
} from './types';
import { SDKProvider } from '../RevealCanvas/SDKProvider';
import { sdkMock } from '#test-utils/fixtures/sdk';
import { ViewerContextProvider } from '../RevealCanvas/ViewerContext';
import { createRenderTargetMock } from '#test-utils/fixtures/renderTarget';
import { type DmCadAssetMapping } from '../CacheProvider/cad/assetMappingTypes';
import { TreeIndexNodeCollection } from '@cognite/reveal';
import { type ClassicAssetStylingGroup } from '../Reveal3DResources';

describe(RuleBasedOutputsSelector.name, () => {
  const queryClient = new QueryClient();
  const renderTargetMock = createRenderTargetMock();

  const mockRuleSet: RuleOutputSet = {
    id: 'rule-set-1',
    name: 'Test Rule Set',
    rulesWithOutputs: [],
    createdAt: 1111,
    createdBy: 'Test User'
  };
  const mockOnRuleSetChanged = vi.fn();
  const mockOnAllMappingsFetched = vi.fn();

  const mockAssetMappings: ModelWithAssetMappings = {
    model: { modelId: cadMock.modelId, revisionId: cadMock.revisionId, type: 'cad' },
    assetMappings: [{ assetId: 1, treeIndex: 100, subtreeSize: 1, nodeId: 100 }]
  };

  const node3d1: Node3D = {
    id: 100,
    treeIndex: 100,
    subtreeSize: 1,
    parentId: 0,
    depth: 0,
    name: ''
  };

  const node3d2: Node3D = {
    id: 200,
    treeIndex: 200,
    subtreeSize: 1,
    parentId: 0,
    depth: 0,
    name: ''
  };

  const cadNode1: CadNodeIdData = {
    nodeId: 200,
    treeIndex: 200,
    subtreeSize: 1
  };

  const dmUniqueIdentifier1 = {
    externalId: 'dm-unique-id-1',
    space: 'dm-space-1'
  };

  const dmUniqueIdentifier2 = {
    externalId: 'dm-unique-id-2',
    space: 'dm-space-2'
  };

  const mockHybridAssetMappings: ModelWithAssetMappings = {
    model: { modelId: cadMock.modelId, revisionId: cadMock.revisionId, type: 'cad' },
    assetMappings: [
      {
        instanceId: dmUniqueIdentifier1,
        ...cadNode1
      }
    ]
  };
  const mockClassicAssetConnections: Asset[] = [
    {
      id: 1,
      externalId: 'asset-1',
      name: 'Asset 1',
      description: '',
      lastUpdatedTime: new Date(),
      createdTime: new Date(),
      rootId: 0
    },
    {
      id: 2,
      externalId: 'asset-2',
      name: 'Asset 2',
      description: '',
      lastUpdatedTime: new Date(),
      createdTime: new Date(),
      rootId: 0
    }
  ];

  const mockFdmCadConnections: FdmCadConnection[] = [
    {
      instance: dmUniqueIdentifier1,
      modelId: cadMock.modelId,
      revisionId: cadMock.revisionId,
      treeIndex: cadNode1.treeIndex
    },
    {
      instance: dmUniqueIdentifier2,
      modelId: cadMock.modelId,
      revisionId: cadMock.revisionId,
      treeIndex: cadNode1.treeIndex
    }
  ];

  const fdmConnections: FdmConnectionWithNode[] = [
    {
      connection: mockFdmCadConnections[0],
      cadNode: node3d1
    },
    {
      connection: mockFdmCadConnections[1],
      cadNode: node3d2
    }
  ];
  const mockFdmMappedEquipmentEdges: ModelRevisionToConnectionMap = new Map([
    ['1/10', [{ connection: fdmConnections[0].connection, cadNode: fdmConnections[0].cadNode }]],
    ['2/20', [{ connection: fdmConnections[1].connection, cadNode: fdmConnections[1].cadNode }]]
  ]);
  const mockDmConnectionWithNodeFromHybridDataList: FdmConnectionWithNode[] = [
    { connection: fdmConnections[1].connection, cadNode: fdmConnections[1].cadNode }
  ];
  const mockFdmMappings: FdmInstanceNodeWithConnectionAndProperties[] = [
    {
      instanceType: 'node',
      items: [],
      typing: {},
      connection: {
        instance: dmUniqueIdentifier1,
        modelId: cadMock.modelId,
        revisionId: cadMock.revisionId,
        treeIndex: node3d1.treeIndex
      },
      cadNode: node3d1
    },
    {
      instanceType: 'node',
      items: [],
      typing: {},
      connection: {
        instance: dmUniqueIdentifier2,
        modelId: cadMock.modelId,
        revisionId: cadMock.revisionId,
        treeIndex: node3d2.treeIndex
      },
      cadNode: node3d2
    }
  ];

  const nodeCollection = new TreeIndexNodeCollection([0]);
  const mockClassicAssetStylingGroup: ClassicAssetStylingGroup = {
    assetIds: [mockClassicAssetConnections[0].id, mockClassicAssetConnections[1].id],
    style: {}
  };

  const mockAssetStylingGroupAndStyleIndex: AssetStylingGroupAndStyleIndex = {
    styleIndex: nodeCollection,
    assetStylingGroup: mockClassicAssetStylingGroup
  };

  const mockFdmStylingGroupAndStyleIndex: FdmStylingGroupAndStyleIndex = {
    styleIndex: nodeCollection,
    fdmStylingGroup: {
      fdmAssetExternalIds: [dmUniqueIdentifier1, dmUniqueIdentifier2],
      style: {}
    }
  };
  const mockStylings: AllMappingStylingGroupAndStyleIndex[] = [
    {
      assetMappingsStylingGroupAndIndex: mockAssetStylingGroupAndStyleIndex,
      fdmStylingGroupAndStyleIndex: mockFdmStylingGroupAndStyleIndex
    }
  ];

  const defaultDependencies = getMocksByDefaultDependencies(
    defaultRuleBasedOutputsSelectorDependencies
  );

  const wrapper = ({ children }: PropsWithChildren): ReactElement => {
    return (
      <SDKProvider sdk={sdkMock}>
        <QueryClientProvider client={queryClient}>
          <ViewerContextProvider value={renderTargetMock}>
            <RuleBasedOutputsSelectorContext.Provider value={defaultDependencies}>
              {children}
            </RuleBasedOutputsSelectorContext.Provider>
          </ViewerContextProvider>
        </QueryClientProvider>
      </SDKProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();

    defaultDependencies.use3dModels.mockReturnValue([cadMock]);

    const mockuseAssetMappedNodesForRevisionsResult = {
      data: [mockAssetMappings, mockHybridAssetMappings],
      isLoading: false
    };
    defaultDependencies.useAssetMappedNodesForRevisions.mockReturnValue(
      mockuseAssetMappedNodesForRevisionsResult as UseQueryResult<ModelWithAssetMappings[]>
    );

    const mockUseAssetsByIdsQueryResult = {
      data: mockClassicAssetConnections,
      isLoading: false,
      isFetched: true
    };
    defaultDependencies.useAssetsByIdsQuery.mockReturnValue(
      mockUseAssetsByIdsQueryResult as UseQueryResult<Asset[]>
    );

    const mockUseMappedEdgesForRevisionsResult = {
      data: mockFdmMappedEquipmentEdges,
      isLoading: false
    };

    defaultDependencies.useMappedEdgesForRevisions.mockReturnValue(
      mockUseMappedEdgesForRevisionsResult as UseQueryResult<ModelRevisionToConnectionMap>
    );

    const mockUseGetDMConnectionWithNodeFromHybridMappingsQueryReturn = {
      data: mockDmConnectionWithNodeFromHybridDataList,
      isLoading: false
    };
    defaultDependencies.useGetDMConnectionWithNodeFromHybridMappingsQuery.mockReturnValue(
      mockUseGetDMConnectionWithNodeFromHybridMappingsQueryReturn as UseQueryResult<
        FdmConnectionWithNode[]
      >
    );

    const mockUseAll3dDirectConnectionsWithPropertiesReturn = {
      data: mockFdmMappings,
      isLoading: false
    };
    defaultDependencies.useAll3dDirectConnectionsWithProperties.mockReturnValue(
      mockUseAll3dDirectConnectionsWithPropertiesReturn as UseQueryResult<
        FdmInstanceNodeWithConnectionAndProperties[]
      >
    );

    defaultDependencies.generateRuleBasedOutputs.mockResolvedValue(mockStylings);
  });

  it('should call onAllMappingsFetched with true when all data is loaded', () => {
    render(
      <RuleBasedOutputsSelector
        ruleSet={mockRuleSet}
        onRuleSetChanged={mockOnRuleSetChanged}
        onAllMappingsFetched={mockOnAllMappingsFetched}
      />,
      {
        wrapper
      }
    );

    expect(mockOnAllMappingsFetched).toHaveBeenCalledWith(true);
  });

  it('should call onRuleSetChanged when rule-based outputs are initialized', async () => {
    render(
      <RuleBasedOutputsSelector
        ruleSet={mockRuleSet}
        onRuleSetChanged={mockOnRuleSetChanged}
        onAllMappingsFetched={mockOnAllMappingsFetched}
      />,
      {
        wrapper
      }
    );

    expect(mockOnRuleSetChanged).toHaveBeenCalled();
  });

  it('should handle empty ruleSet gracefully', () => {
    render(
      <RuleBasedOutputsSelector
        ruleSet={undefined}
        onRuleSetChanged={mockOnRuleSetChanged}
        onAllMappingsFetched={mockOnAllMappingsFetched}
      />,
      {
        wrapper
      }
    );

    expect(mockOnAllMappingsFetched).not.toHaveBeenCalled();
    expect(mockOnRuleSetChanged).not.toHaveBeenCalled();
  });

  it('should handle hybrid mappings correctly', async () => {
    const dmMappingInstance = mockHybridAssetMappings.assetMappings[0] as DmCadAssetMapping;

    const mockUseGetDMConnectionWithNodeFromHybridMappingsQueryReturn = {
      data: [
        {
          connection: {
            instance: dmMappingInstance.instanceId,
            modelId: mockHybridAssetMappings.model.modelId,
            revisionId: mockHybridAssetMappings.model.revisionId,
            treeIndex: dmMappingInstance.treeIndex
          },
          cadNode: node3d2
        }
      ]
    };
    defaultDependencies.useGetDMConnectionWithNodeFromHybridMappingsQuery.mockReturnValue(
      mockUseGetDMConnectionWithNodeFromHybridMappingsQueryReturn as UseQueryResult<
        FdmConnectionWithNode[]
      >
    );

    render(
      <RuleBasedOutputsSelector
        ruleSet={mockRuleSet}
        onRuleSetChanged={mockOnRuleSetChanged}
        onAllMappingsFetched={mockOnAllMappingsFetched}
      />,
      {
        wrapper
      }
    );

    expect(mockOnAllMappingsFetched).toHaveBeenCalledWith(true);
    expect(
      defaultDependencies.useGetDMConnectionWithNodeFromHybridMappingsQuery
    ).toHaveBeenCalledWith([dmMappingInstance], [mockAssetMappings.model]);

    await waitFor(() => {
      expect(mockOnRuleSetChanged).toHaveBeenCalledWith([
        {
          assetMappingsStylingGroupAndIndex: mockAssetStylingGroupAndStyleIndex,
          fdmStylingGroupAndStyleIndex: mockFdmStylingGroupAndStyleIndex
        }
      ]);
    });
  });
});
