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
  type DmsUniqueIdentifier,
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
import { createFdmKey } from '../../CacheProvider';

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

  const mockDmCadAssetMappingsList = createDMCadAssetMappingListMock(
    [
      { space: 'test-space', externalId: 'instance-1' },
      { space: 'test-space', externalId: 'instance-2' }
    ],
    [firstNode3DMock, secondNode3DMock]
  );

  const mockDmNodesInspectList: InspectResultList = {
    items: [
      {
        ...mockDmCadAssetMappingsList[0].instanceId,
        inspectionResults: {
          involvedViews: [
            { type: 'view', version: '1', space: 'test-space', externalId: 'view-external-id-1' }
          ],
          involvedContainers: []
        },
        instanceType: 'node'
      },
      {
        ...mockDmCadAssetMappingsList[1].instanceId,
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
    const mockNoMatchedAssetMappingDataMap = createAssetMappingDataMapMock(
      [
        { space: 'test-space', externalId: 'other-instance-1' },
        { space: 'test-space', externalId: 'other-instance-2' }
      ],
      [firstNode3DMock, secondNode3DMock]
    );

    const mockClassicCadAssetMappingCache: ClassicCadAssetMappingCache =
      new Mock<ClassicCadAssetMappingCache>()
        .setup((p) => p.getNodesForInstanceIds)
        .returns(vi.fn(async () => await Promise.resolve(mockNoMatchedAssetMappingDataMap)))
        .object();

    mockDependencies.useClassicCadAssetMappingCache.mockReturnValue(
      mockClassicCadAssetMappingCache
    );

    const mockNoMatchedDmCadAssetMappingsList = createDMCadAssetMappingListMock(
      [
        { space: 'test-space', externalId: 'other-instance-1' },
        { space: 'test-space', externalId: 'other-instance-2' }
      ],
      [firstNode3DMock, secondNode3DMock]
    );

    const { result } = renderHook(
      () =>
        useGetDMConnectionWithNodeFromHybridMappingsQuery(
          mockNoMatchedDmCadAssetMappingsList,
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
    const mockAssetMappingDataMap = createAssetMappingDataMapMock(
      mockDmCadAssetMappingsList.map((mapping) => mapping.instanceId),
      [firstNode3DMock, secondNode3DMock]
    );

    const mockClassicCadAssetMappingCache = new Mock<ClassicCadAssetMappingCache>()
      .setup((p) => p.getNodesForInstanceIds)
      .returns(vi.fn(async () => await Promise.resolve(mockAssetMappingDataMap)))
      .object();

    mockDependencies.useClassicCadAssetMappingCache.mockReturnValue(
      mockClassicCadAssetMappingCache
    );

    const { result } = renderHook(
      () =>
        useGetDMConnectionWithNodeFromHybridMappingsQuery(mockDmCadAssetMappingsList, modelsMock),
      {
        wrapper
      }
    );

    const expectedData = [
      {
        connection: {
          instance: mockDmCadAssetMappingsList[0].instanceId,
          modelId: modelsMock[0].modelId,
          revisionId: modelsMock[0].revisionId,
          treeIndex: firstNode3DMock.treeIndex
        },
        cadNode: firstNode3DMock,
        views: mockDmNodesInspectList.items[0].inspectionResults.involvedViews
      },
      {
        connection: {
          instance: mockDmCadAssetMappingsList[1].instanceId,
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
    map.set(createFdmKey(instanceId), [node3D[index]]);
  });
  return map;
}

function createDMCadAssetMappingListMock(
  instanceIds: DmsUniqueIdentifier[],
  node3ds: Node3D[]
): DmCadAssetMapping[] {
  return instanceIds.map((instanceId, index) => ({
    instanceId,
    treeIndex: node3ds[index].treeIndex,
    nodeId: node3ds[index].id,
    subtreeSize: node3ds[index].subtreeSize
  }));
}
