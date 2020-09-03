/*!
 * Copyright 2020 Cognite AS
 */

import { CogniteClient, CogniteInternalId } from '@cognite/sdk';
import { NodeIdAndTreeIndexMaps } from '@/public/migration/NodeIdAndTreeIndexMaps';

import { sleep } from '../wait';
import nock from 'nock';

// jest.mock('@cognite/sdk');

type ByTreeIndicesRequestBody = {
  items: CogniteInternalId[];
};

type ByNodeIdsRequestBody = {
  items: number[];
};

describe('NodeIdAndTreeIndexMaps', () => {
  let client: CogniteClient;

  beforeEach(() => {
    client = new CogniteClient({ appId: 'test' });
    client.loginWithApiKey({ project: 'test', apiKey: 'mykey' });
  });

  function stubTreeIndexToNodeId(treeIndex: number): CogniteInternalId {
    return treeIndex + 1337;
  }

  function stubNodeIdToTreeIndex(nodeId: CogniteInternalId): number {
    return nodeId - 1337;
  }

  // beforeAll(() => {
  // jest.useFakeTimers();
  nock.disableNetConnect();
  // nock(/.*/)
  //   .post(/\/ids\/bytreeindices/)
  //   .reply(200, {});
  // nock(/.*/).persist().post('/api/v1/projects/test/3d/models/0/revisions/0/nodes/treeindices/byids').reply(200, {});
  nock(/.*/)
    .persist()
    .post(/.*\/ids\/bytreeindices/)
    .reply(200, (_uri, requestBody: ByTreeIndicesRequestBody) => {
      return { items: requestBody.items.map(stubTreeIndexToNodeId) };
    });
  nock(/.*/)
    .persist()
    .post(/.*\/treeindices\/byids/)
    .reply(200, (_uri, requestBody: ByNodeIdsRequestBody) => {
      return { items: requestBody.items.map(stubNodeIdToTreeIndex) };
    });

  // const CogniteClientMock = CogniteClient as jest.Mock<CogniteClient>;
  // CogniteClientMock.mockImplementation(() => {
  //   return {
  //     revisions3D: {
  //       retrieve3DNodes: async (_modelId: number, _revisionId: number, ids: InternalId[]) => {
  //         return ids.map((id: InternalId) => {
  //           return {
  //             id: id.id,
  //             treeIndex: -id.id
  //           };
  //         });
  //       }
  //     }
  //   } as CogniteClient;
  // });
  // });

  test('tree index is returned correctly', async () => {
    const maps = new NodeIdAndTreeIndexMaps(0, 0, client);
    const treeIndex1Promise = maps.getTreeIndex(1);
    const treeIndex2Promise = maps.getTreeIndex(2);
    const treeIndices = await Promise.all([treeIndex1Promise, treeIndex2Promise]);
    expect(treeIndices[0]).toEqual(stubNodeIdToTreeIndex(1));
    expect(treeIndices[1]).toEqual(stubNodeIdToTreeIndex(2));
  });

  test('requesting same index twice returns correctly twice', async () => {
    const maps = new NodeIdAndTreeIndexMaps(0, 0, client);
    const treeIndex1 = await maps.getTreeIndex(1);
    const treeIndex2 = await maps.getTreeIndex(1);
    expect(treeIndex1).toEqual(stubNodeIdToTreeIndex(1));
    expect(treeIndex2).toEqual(stubNodeIdToTreeIndex(1));
  });

  test('requesting same index twice in same batch, returns same result for both', async () => {
    const maps = new NodeIdAndTreeIndexMaps(0, 0, client);
    const treeIndex1Promise = maps.getTreeIndex(1);
    const treeIndex2Promise = maps.getTreeIndex(1);
    const treeIndices = await Promise.all([treeIndex1Promise, treeIndex2Promise]);
    expect(treeIndices[0]).toEqual(treeIndices[1]);
  });

  test('requesting same index twice with sleep in-between returns same result', async () => {
    const maps = new NodeIdAndTreeIndexMaps(0, 0, client);
    const treeIndex1 = await maps.getTreeIndex(1);
    await sleep(100);
    const treeIndex2 = await maps.getTreeIndex(1);
    expect(treeIndex1).toEqual(treeIndex2);
  });

  test('getTreeIndices with cached IDs', async () => {
    // Arrange
    const maps = new NodeIdAndTreeIndexMaps(0, 0, client);
    maps.add(1, 2);
    maps.add(3, 4);
    maps.add(5, 6);

    // Act
    const treeIndices = await maps.getTreeIndices([1, 3, 5]);

    // Assert
    expect(treeIndices).toEqual([2, 4, 6]);
  });

  test('getTreeIndices without cached IDs returns correct results', async () => {
    const maps = new NodeIdAndTreeIndexMaps(0, 0, client);
    const input = [1, 3, 5];
    const treeIndices = await maps.getTreeIndices([1, 3, 5]);
    expect(treeIndices).toEqual(input.map(stubNodeIdToTreeIndex));
  });

  test('getTreeIndices with partially cached IDs, maps only uncached', async () => {
    // Arrange
    const maps = new NodeIdAndTreeIndexMaps(0, 0, client);
    maps.add(3, 4);

    // Act
    const treeIndices = await maps.getTreeIndices([1, 3, 5]);

    // Assert
    expect(treeIndices).toEqual([stubNodeIdToTreeIndex(1), 4, stubNodeIdToTreeIndex(5)]);
  });

  test('requesting same nodeId twice returns correctly twice', async () => {
    const maps = new NodeIdAndTreeIndexMaps(0, 0, client);
    const nodeId1 = await maps.getNodeId(1);
    const nodeId2 = await maps.getNodeId(1);
    expect(nodeId1).toEqual(stubTreeIndexToNodeId(1));
    expect(nodeId2).toEqual(stubTreeIndexToNodeId(1));
  });

  test('requesting same nodeId twice in same batch, returns same result for both', async () => {
    const maps = new NodeIdAndTreeIndexMaps(0, 0, client);
    const nodeId1Promise = maps.getNodeId(1);
    const nodeId2Promise = maps.getNodeId(1);
    const nodeIds = await Promise.all([nodeId1Promise, nodeId2Promise]);
    expect(nodeIds[0]).toEqual(nodeIds[1]);
  });

  test('requesting same nodeId twice with sleep in-between returns same result', async () => {
    const maps = new NodeIdAndTreeIndexMaps(0, 0, client);
    const nodeId1 = await maps.getNodeId(1);
    await sleep(100);
    const nodeId2 = await maps.getNodeId(1);
    expect(nodeId1).toEqual(nodeId2);
  });

  test('getNodeIds with cached IDs', async () => {
    // Arrange
    const maps = new NodeIdAndTreeIndexMaps(0, 0, client);
    maps.add(1, 2);
    maps.add(3, 4);
    maps.add(5, 6);

    // Act
    const treeIndices = await maps.getNodeIds([2, 4, 6]);

    // Assert
    expect(treeIndices).toEqual([1, 3, 5]);
  });

  test('getNodeIds without cached IDs returns correct results', async () => {
    const maps = new NodeIdAndTreeIndexMaps(0, 0, client);
    const input = [1, 3, 5];
    const treeIndices = await maps.getNodeIds([1, 3, 5]);
    expect(treeIndices).toEqual(input.map(stubTreeIndexToNodeId));
  });

  test('getNodeIds with partially cached IDs, maps only uncached', async () => {
    // Arrange
    const maps = new NodeIdAndTreeIndexMaps(0, 0, client);
    maps.add(3, 4);

    // Act
    const treeIndices = await maps.getNodeIds([1, 4, 5]);

    // Assert
    expect(treeIndices).toEqual([stubTreeIndexToNodeId(1), 3, stubTreeIndexToNodeId(5)]);
  });
});
