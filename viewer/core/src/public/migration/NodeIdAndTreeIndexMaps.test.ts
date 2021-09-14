/*!
 * Copyright 2021 Cognite AS
 */

import { CogniteInternalId } from '@cognite/sdk';
import { NodeIdAndTreeIndexMaps } from './NodeIdAndTreeIndexMaps';

import { sleep } from '../../../../test-utilities';
import { NodesApiClient } from '@reveal/nodes-api';

import { Mock, It } from 'moq.ts';

function stubTreeIndexToNodeId(treeIndex: number): CogniteInternalId {
  return treeIndex + 1337;
}

function stubNodeIdToTreeIndex(nodeId: CogniteInternalId): number {
  return nodeId - 1337;
}

describe('NodeIdAndTreeIndexMaps', () => {
  let mockClient: Mock<NodesApiClient>;
  let maps: NodeIdAndTreeIndexMaps;

  beforeEach(() => {
    mockClient = new Mock<NodesApiClient>();
    mockClient
      .setup(x => x.mapTreeIndicesToNodeIds(It.IsAny(), It.IsAny(), It.IsAny()))
      .callback(({ args }) => {
        const treeIndices = args[2] as number[];
        return Promise.resolve(treeIndices.map(stubTreeIndexToNodeId));
      });
    mockClient
      .setup(x => x.mapNodeIdsToTreeIndices(It.IsAny(), It.IsAny(), It.IsAny()))
      .callback(({ args }) => {
        const nodeIds = args[2] as CogniteInternalId[];
        return Promise.resolve(nodeIds.map(stubNodeIdToTreeIndex));
      });

    maps = new NodeIdAndTreeIndexMaps(0, 0, mockClient.object());
  });

  test('tree index is returned correctly', async () => {
    const treeIndex1Promise = maps.getTreeIndex(1);
    const treeIndex2Promise = maps.getTreeIndex(2);
    const treeIndices = await Promise.all([treeIndex1Promise, treeIndex2Promise]);
    expect(treeIndices[0]).toEqual(stubNodeIdToTreeIndex(1));
    expect(treeIndices[1]).toEqual(stubNodeIdToTreeIndex(2));
  });

  test('requesting same index twice returns correctly twice', async () => {
    const treeIndex1 = await maps.getTreeIndex(1);
    const treeIndex2 = await maps.getTreeIndex(1);
    expect(treeIndex1).toEqual(stubNodeIdToTreeIndex(1));
    expect(treeIndex2).toEqual(stubNodeIdToTreeIndex(1));
  });

  test('requesting same index twice in same batch, returns same result for both', async () => {
    const treeIndex1Promise = maps.getTreeIndex(1);
    const treeIndex2Promise = maps.getTreeIndex(1);
    const treeIndices = await Promise.all([treeIndex1Promise, treeIndex2Promise]);
    expect(treeIndices[0]).toEqual(treeIndices[1]);
  });

  test('requesting same index twice with sleep in-between returns same result', async () => {
    const treeIndex1 = await maps.getTreeIndex(1);
    await sleep(100);
    const treeIndex2 = await maps.getTreeIndex(1);
    expect(treeIndex1).toEqual(treeIndex2);
  });

  test('getTreeIndices with cached IDs', async () => {
    // Arrange
    maps.add(1, 2);
    maps.add(3, 4);
    maps.add(5, 6);

    // Act
    const treeIndices = await maps.getTreeIndices([1, 3, 5]);

    // Assert
    expect(treeIndices).toEqual([2, 4, 6]);
  });

  test('getTreeIndices without cached IDs returns correct results', async () => {
    const input = [1, 3, 5];
    const treeIndices = await maps.getTreeIndices([1, 3, 5]);
    expect(treeIndices).toEqual(input.map(stubNodeIdToTreeIndex));
  });

  test('getTreeIndices with partially cached IDs, maps only uncached', async () => {
    // Arrange
    maps.add(3, 4);

    // Act
    const treeIndices = await maps.getTreeIndices([1, 3, 5]);

    // Assert
    expect(treeIndices).toEqual([stubNodeIdToTreeIndex(1), 4, stubNodeIdToTreeIndex(5)]);
  });

  test('requesting same nodeId twice returns correctly twice', async () => {
    const nodeId1 = await maps.getNodeId(1);
    const nodeId2 = await maps.getNodeId(1);
    expect(nodeId1).toEqual(stubTreeIndexToNodeId(1));
    expect(nodeId2).toEqual(stubTreeIndexToNodeId(1));
  });

  test('requesting same nodeId twice in same batch, returns same result for both', async () => {
    const nodeId1Promise = maps.getNodeId(1);
    const nodeId2Promise = maps.getNodeId(1);
    const nodeIds = await Promise.all([nodeId1Promise, nodeId2Promise]);
    expect(nodeIds[0]).toEqual(nodeIds[1]);
  });

  test('requesting same nodeId twice with sleep in-between returns same result', async () => {
    const nodeId1 = await maps.getNodeId(1);
    await sleep(100);
    const nodeId2 = await maps.getNodeId(1);
    expect(nodeId1).toEqual(nodeId2);
  });

  test('getNodeIds with cached IDs', async () => {
    // Arrange
    maps.add(1, 2);
    maps.add(3, 4);
    maps.add(5, 6);

    // Act
    const treeIndices = await maps.getNodeIds([2, 4, 6]);

    // Assert
    expect(treeIndices).toEqual([1, 3, 5]);
  });

  test('getNodeIds without cached IDs returns correct results', async () => {
    const input = [1, 3, 5];
    const treeIndices = await maps.getNodeIds([1, 3, 5]);
    expect(treeIndices).toEqual(input.map(stubTreeIndexToNodeId));
  });

  test('getNodeIds with partially cached IDs, maps only uncached', async () => {
    // Arrange
    maps.add(3, 4);

    // Act
    const treeIndices = await maps.getNodeIds([1, 4, 5]);

    // Assert
    expect(treeIndices).toEqual([stubTreeIndexToNodeId(1), 3, stubTreeIndexToNodeId(5)]);
  });
});
