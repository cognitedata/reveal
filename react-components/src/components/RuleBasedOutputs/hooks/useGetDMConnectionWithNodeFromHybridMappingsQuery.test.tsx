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
import { type FdmSDK, type InspectResultList } from '../../../data-providers/FdmSDK';
import { type DmCadAssetMapping } from '../../CacheProvider/cad/assetMappingTypes';
import { type CadModelOptions } from '../../Reveal3DResources';
import { renderHook, waitFor } from '@testing-library/react';
import { ViewerContext } from '../../RevealCanvas/ViewerContext';
import { type RevealRenderTarget } from '../../../architecture';
import { type InstanceKey } from '../../../utilities/instanceIds';

describe(useGetDMConnectionWithNodeFromHybridMappingsQuery.name, () => {
  const queryClient = new QueryClient();

  const modelsMock: CadModelOptions[] = [
    {
      type: 'cad',
      modelId: 123,
      revisionId: 456
    }
  ];

  const firstNode3DMock: Node3D = {
    id: 111,
    name: 'Test Node',
    treeIndex: 222,
    boundingBox: { min: [0, 0, 0], max: [1, 1, 1] },
    parentId: 0,
    depth: 1,
    subtreeSize: 1,
    properties: {}
  };

  const secondNode3DMock: Node3D = {
    id: 333,
    name: 'Test Node',
    treeIndex: 444,
    boundingBox: { min: [0, 0, 0], max: [1, 1, 1] },
    parentId: 0,
    depth: 1,
    subtreeSize: 1,
    properties: {}
  };

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

  const mockAssetMappingData = new Map<InstanceKey, Node3D[]>([
    [
      `${mockDmCadAssetMappings[0].instanceId.space}/${mockDmCadAssetMappings[0].instanceId.externalId}` as InstanceKey,
      [firstNode3DMock]
    ],
    [
      `${mockDmCadAssetMappings[1].instanceId.space}/${mockDmCadAssetMappings[1].instanceId.externalId}` as InstanceKey,
      [secondNode3DMock]
    ]
  ]);

  const mockNoMatchedAssetMappingData = new Map<InstanceKey, Node3D[]>([
    ['test-space/other-instance-1', [firstNode3DMock]],
    ['test-space/other-instance-2', [secondNode3DMock]]
  ]);

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
    const mockClassicCadAssetMappingCache = new Mock<ClassicCadAssetMappingCache>()
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
          instanceType: 'node',
          modelId: modelsMock[0].modelId,
          revisionId: modelsMock[0].revisionId,
          treeIndex: firstNode3DMock.treeIndex
        },
        cadNode: {
          id: firstNode3DMock.id,
          parentId: firstNode3DMock.parentId,
          depth: firstNode3DMock.depth,
          name: 'Test Node',
          modelId: modelsMock[0].modelId,
          revisionId: modelsMock[0].revisionId,
          nodeId: firstNode3DMock.id,
          treeIndex: firstNode3DMock.treeIndex,
          subtreeSize: firstNode3DMock.subtreeSize,
          instanceType: 'node',
          version: 1,
          properties: {}
        },
        views: mockDmNodesInspectList.items[0].inspectionResults.involvedViews
      },
      {
        connection: {
          instance: {
            externalId: mockDmCadAssetMappings[1].instanceId.externalId,
            space: mockDmCadAssetMappings[1].instanceId.space
          },
          instanceType: 'node',
          modelId: modelsMock[0].modelId,
          revisionId: modelsMock[0].revisionId,
          treeIndex: secondNode3DMock.treeIndex
        },
        cadNode: {
          id: secondNode3DMock.id,
          parentId: secondNode3DMock.parentId,
          depth: secondNode3DMock.depth,
          name: 'Test Node',
          modelId: modelsMock[0].modelId,
          revisionId: modelsMock[0].revisionId,
          nodeId: secondNode3DMock.id,
          treeIndex: secondNode3DMock.treeIndex,
          subtreeSize: secondNode3DMock.subtreeSize,
          instanceType: 'node',
          version: 1,
          properties: {}
        },
        views: mockDmNodesInspectList.items[1].inspectionResults.involvedViews
      }
    ];
    await waitFor(() => {
      expect(result.current.data).toEqual(expectedData);
    });
  });
});
