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
import { type Node3D } from '@cognite/sdk';
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
import { type CogniteCadModel, TreeIndexNodeCollection } from '@cognite/reveal';
import { type ClassicAssetStylingGroup } from '../Reveal3DResources';
import { createCadNodeMock } from '#test-utils/fixtures/cadNode';
import { createAssetMock } from '#test-utils/fixtures/assets';
import { createModelRevisionKey } from '../CacheProvider/idAndKeyTranslation';

describe(RuleBasedOutputsSelector.name, () => {
  const queryClient = new QueryClient();
  const renderTargetMock = createRenderTargetMock();

  const ARBITRARY_CAD_MODEL_ID = 111;
  const ARBITRARY_CAD_REVISION_ID = 222;

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

  const node3d1 = createCadNodeMock({
    id: 100,
    treeIndex: 100,
    subtreeSize: 1
  });

  const node3d2 = createCadNodeMock({
    id: 200,
    treeIndex: 200,
    subtreeSize: 1
  });

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

  const mockClassicAssetConnections = [createAssetMock(1), createAssetMock(2)];

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
    [createModelRevisionKey(cadMock.modelId, cadMock.revisionId), [fdmConnections[0]]],
    [createModelRevisionKey(ARBITRARY_CAD_MODEL_ID, ARBITRARY_CAD_REVISION_ID), [fdmConnections[1]]]
  ]);
  const mockDmConnectionWithNodeFromHybridDataList: FdmConnectionWithNode[] = [fdmConnections[1]];

  const mockFdmMappings = [
    createFdmInstanceNodeDataMock(dmUniqueIdentifier1, cadMock, node3d1),
    createFdmInstanceNodeDataMock(dmUniqueIdentifier2, cadMock, node3d2)
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
          <ViewerContextProvider renderTarget={renderTargetMock}>
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
      mockuseAssetMappedNodesForRevisionsResult
    );

    const mockUseAssetsByIdsQueryResult = {
      data: mockClassicAssetConnections,
      isLoading: false,
      isFetched: true
    };
    defaultDependencies.useAssetsByIdsQuery.mockReturnValue(mockUseAssetsByIdsQueryResult);

    const mockUseMappedEdgesForRevisionsResult = {
      data: mockFdmMappedEquipmentEdges,
      isLoading: false
    };

    defaultDependencies.useMappedEdgesForRevisions.mockReturnValue(
      mockUseMappedEdgesForRevisionsResult
    );

    const mockUseGetDMConnectionWithNodeFromHybridMappingsQueryReturn = {
      data: mockDmConnectionWithNodeFromHybridDataList,
      isLoading: false
    };
    defaultDependencies.useGetDMConnectionWithNodeFromHybridMappingsQuery.mockReturnValue(
      mockUseGetDMConnectionWithNodeFromHybridMappingsQueryReturn
    );

    const mockUseAll3dDirectConnectionsWithPropertiesReturn = {
      data: mockFdmMappings,
      isLoading: false
    };
    defaultDependencies.useAll3dDirectConnectionsWithProperties.mockReturnValue(
      mockUseAll3dDirectConnectionsWithPropertiesReturn
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

function createFdmInstanceNodeDataMock(
  instance: { externalId: string; space: string },
  cadModel: CogniteCadModel,
  cadNode: Node3D
): FdmInstanceNodeWithConnectionAndProperties {
  return {
    instanceType: 'node',
    items: [],
    typing: {},
    connection: {
      instance,
      modelId: cadModel.modelId,
      revisionId: cadModel.revisionId,
      treeIndex: cadNode.treeIndex
    },
    cadNode
  };
}
