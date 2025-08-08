import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useGetDMConnectionWithNodeFromHybridMappingsQuery } from './useGetDMConnectionWithNodeFromHybridMappingsQuery';
import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';
import { type FC, type PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  defaultUseGetDMConnectionWithNodeFromHybridMappingsQuery,
  UseGetDMConnectionWithNodeFromHybridMappingsQueryContext
} from './useGetDMConnectionWithNodeFromHybridMappingsQuery.context';
import { type ClassicCadAssetMappingCache } from '../../CacheProvider/cad/ClassicCadAssetMappingCache';
import { Mock } from 'moq.ts';
import { type Node3D } from '@cognite/sdk';
import {
  DmsUniqueIdentifier,
  type FdmSDK,
  type InspectResultList
} from '../../../data-providers/FdmSDK';
import { type DmCadAssetMapping } from '../../CacheProvider/cad/assetMappingTypes';
import { type CadModelOptions } from '../../Reveal3DResources';
import { renderHook, waitFor } from '@testing-library/react';
import { ViewerContext } from '../../RevealCanvas/ViewerContext';
import { type RevealRenderTarget } from '../../../architecture';
import { type InstanceKey } from '../../../utilities/instanceIds';
import { createCadNodeMock } from '#test-utils/fixtures/cadNode';

describe(useGetDMConnectionWithNodeFromHybridMappingsQuery.name, () => {
  const queryClient = new QueryClient();

  const modelsMock: CadModelOptions[] = [
    {
      type: 'cad',
      modelId: 123,
      revisionId: 456
    }
  ];

  const firstNode3DMock = createCadNodeMock({
    id: 111,
    treeIndex: 222,
    subtreeSize: 1
  });

  const secondNode3DMock = createCadNodeMock({
    id: 333,
    treeIndex: 444,
    subtreeSize: 1
  });

  const mockDmCadAssetMappings: DmCadAssetMapping[] = [
    {
      instanceId: {
        space: 'test-space',
        externalId: 'instance-1'
      },
      treeIndex: firstNode3DMock.treeIndex,
      nodeId: firstNode3DMock.id,
      subtreeSize: firstNode3DMock.subtreeSize
    },
    {
      instanceId: {
        space: 'test-space',
        externalId: 'instance-2'
      },
      treeIndex: secondNode3DMock.treeIndex,
      nodeId: secondNode3DMock.id,
      subtreeSize: secondNode3DMock.subtreeSize
    }
  ];

  const mockAssetMappingData = createAssetMappingDataMapMock(
    mockDmCadAssetMappings.map((mapping) => mapping.instanceId),
    [firstNode3DMock, secondNode3DMock]
  );

  const mockNoMatchedAssetMappingData = createAssetMappingDataMapMock(
    [
      { space: 'test-space', externalId: 'other-instance-1' },
      { space: 'test-space', externalId: 'other-instance-2' }
    ],
    [firstNode3DMock, secondNode3DMock]
  );

  const mockDmNodesInspectList: InspectResultList = {
    items: [
      {
        space: mockDmCadAssetMappings[0].instanceId.space,
        externalId: mockDmCadAssetMappings[0].instanceId.externalId,
        inspectionResults: {
          involvedViews: [
            { type: 'view', version: '1', space: 'test-space', externalId: 'view-external-id-1' }
          ],
          involvedContainers: []
        },
        instanceType: 'node'
      },
      {
        space: mockDmCadAssetMappings[1].instanceId.space,
        externalId: mockDmCadAssetMappings[1].instanceId.externalId,
        inspectionResults: {
          involvedViews: [
            { type: 'view', version: '1', space: 'test-space', externalId: 'view-external-id-2' }
          ],
          involvedContainers: []
        },
        instanceType: 'node'
      }
    ]
  };

  const mockFdmSdk = new Mock<FdmSDK>()
    .setup((p) => p.inspectInstances)
    .returns(async () => await Promise.resolve(mockDmNodesInspectList))
    .object();

  const mockDependencies = getMocksByDefaultDependencies(
    defaultUseGetDMConnectionWithNodeFromHybridMappingsQuery
  );

  const renderTargetMock = new Mock<RevealRenderTarget>();

  const wrapper: FC<PropsWithChildren> = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <UseGetDMConnectionWithNodeFromHybridMappingsQueryContext.Provider value={mockDependencies}>
        <ViewerContext.Provider value={renderTargetMock.object()}>
          {children}
        </ViewerContext.Provider>
      </UseGetDMConnectionWithNodeFromHybridMappingsQueryContext.Provider>
    </QueryClientProvider>
  );

  beforeEach(() => {
    queryClient.clear();

    mockDependencies.useFdmSdk.mockReturnValue(mockFdmSdk);
  });

  it('should return an empty array if no matched asset mappings are found from the mappings cache', async () => {
    const mockClassicCadAssetMappingCache: ClassicCadAssetMappingCache = new Mock<ClassicCadAssetMappingCache>()
      .setup((p) => p.getNodesForInstanceIds)
      .returns(vi.fn(async () => await Promise.resolve(mockNoMatchedAssetMappingData)))
      .object();

    mockDependencies.useClassicCadAssetMappingCache.mockReturnValue(
      mockClassicCadAssetMappingCache
    );

    const mockNoMatchedDmCadAssetMappings: DmCadAssetMapping[] = [
      {
        instanceId: {
          space: 'test-space',
          externalId: 'instance-555'
        },
        treeIndex: firstNode3DMock.treeIndex,
        nodeId: firstNode3DMock.id,
        subtreeSize: firstNode3DMock.subtreeSize
      },
      {
        instanceId: {
          space: 'test-space',
          externalId: 'instance-666'
        },
        treeIndex: secondNode3DMock.treeIndex,
        nodeId: secondNode3DMock.id,
        subtreeSize: secondNode3DMock.subtreeSize
      }
    ];

    const { result } = renderHook(
      () =>
        useGetDMConnectionWithNodeFromHybridMappingsQuery(
          mockNoMatchedDmCadAssetMappings,
          modelsMock
        ),
      {
        wrapper
      }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual([]);
    });
  });

  it('should return mapped connections and nodes for valid asset mappings', async () => {
    const mockClassicCadAssetMappingCache = new Mock<ClassicCadAssetMappingCache>()
      .setup((p) => p.getNodesForInstanceIds)
      .returns(vi.fn(async () => await Promise.resolve(mockAssetMappingData)))
      .object();

    mockDependencies.useClassicCadAssetMappingCache.mockReturnValue(
      mockClassicCadAssetMappingCache
    );

    const { result } = renderHook(
      () => useGetDMConnectionWithNodeFromHybridMappingsQuery(mockDmCadAssetMappings, modelsMock),
      {
        wrapper
      }
    );

    const expectedData = [
      {
        connection: {
          instance: {
            externalId: mockDmCadAssetMappings[0].instanceId.externalId,
            space: mockDmCadAssetMappings[0].instanceId.space
          },
          modelId: modelsMock[0].modelId,
          revisionId: modelsMock[0].revisionId,
          treeIndex: firstNode3DMock.treeIndex
        },
        cadNode: firstNode3DMock,
        views: mockDmNodesInspectList.items[0].inspectionResults.involvedViews
      },
      {
        connection: {
          instance: {
            externalId: mockDmCadAssetMappings[1].instanceId.externalId,
            space: mockDmCadAssetMappings[1].instanceId.space
          },
          modelId: modelsMock[0].modelId,
          revisionId: modelsMock[0].revisionId,
          treeIndex: secondNode3DMock.treeIndex
        },
        cadNode: secondNode3DMock,
        views: mockDmNodesInspectList.items[1].inspectionResults.involvedViews
      }
    ];
    await waitFor(() => {
      expect(result.current.data).toEqual(expectedData);
    });
  });
});

function createAssetMappingDataMapMock(
  instanceIds: DmsUniqueIdentifier[],
  node3D: Node3D[]
): Map<InstanceKey, Node3D[]> {
  const map = new Map<InstanceKey, Node3D[]>();
  instanceIds.forEach((instanceId, index) => {
    map.set(`${instanceId.space}/${instanceId.externalId}` as const, [node3D[index]]);
  });
  return map;
}
