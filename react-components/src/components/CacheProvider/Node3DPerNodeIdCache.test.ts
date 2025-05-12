import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Node3DPerNodeIdCache } from './Node3DPerNodeIdCache';
import { type CogniteClient, type Node3D } from '@cognite/sdk';
import { modelRevisionNodesAssetToKey } from './idAndKeyTranslation';
import { type ModelId, type RevisionId } from './types';
import { Mock } from 'moq.ts';

describe(Node3DPerNodeIdCache.name, () => {
  let cache: Node3DPerNodeIdCache;

  const mockModelId: ModelId = 1;
  const mockRevisionId: RevisionId = 1;

  const mockNode: Node3D = {
    id: 1,
    treeIndex: 10,
    parentId: 0,
    depth: 0,
    name: 'mock-node',
    subtreeSize: 0
  };

  const mockNode2: Node3D = {
    id: 2,
    treeIndex: 20,
    parentId: 0,
    depth: 0,
    name: 'mock-node-2',
    subtreeSize: 0
  };

  const mockNodes: Node3D[] = [mockNode, mockNode2];

  const sdkMock = new Mock<CogniteClient>()
  .setup((p) => p.revisions3D.retrieve3DNodes)
  .returns(async () => mockNodes)
  .object();


  beforeEach(() => {
    cache = new Node3DPerNodeIdCache(sdkMock, false);
    vi.clearAllMocks();
  });

  describe('splitChunkInCacheNode3D', () => {
    it('should split node IDs into cached and non-cached chunks', async () => {
      const cachedKey = modelRevisionNodesAssetToKey(mockModelId, mockRevisionId, mockNode.id);
      cache.setNodeIdToNode3DCacheItem(cachedKey, Promise.resolve(mockNode));

      const result = await cache['splitChunkInCacheNode3D']([mockNode.id, mockNode2.id], mockModelId, mockRevisionId);

      expect(result.chunkInCache).toEqual([mockNode]);
      expect(result.chunkNotInCacheIdClassic).toEqual([mockNode2.id]);
    });
  });

  describe('generateNode3DCachePerItem', () => {
    it('should generate cache items for given node IDs', async () => {
      vi.spyOn(cache, 'getNodesForNodeIds').mockResolvedValueOnce([mockNode, mockNode2]);

      await cache.generateNode3DCachePerItem(mockModelId, mockRevisionId, [mockNode.id, mockNode2.id]);

      const cachedNode1 = await cache.getNodeIdToNode3DCacheItem(
        modelRevisionNodesAssetToKey(mockModelId, mockRevisionId, mockNode.id)
      );
      const cachedNode2 = await cache.getNodeIdToNode3DCacheItem(
        modelRevisionNodesAssetToKey(mockModelId, mockRevisionId, mockNode2.id)
      );

      expect(cachedNode1).toEqual(mockNode);
      expect(cachedNode2).toEqual(mockNode2);
    });
  });

  describe('getNodesForNodeIds', () => {
    it('should return nodes for given node IDs, fetching missing ones', async () => {
      const mockNode3: Node3D = {
        id: 3,
        treeIndex: 30,
        parentId: 0,
        depth: 0,
        name: 'mock-node-3',
        subtreeSize: 0
      };
      const cachedKey = modelRevisionNodesAssetToKey(mockModelId, mockRevisionId, mockNode3.id);
      cache.setNodeIdToNode3DCacheItem(cachedKey, Promise.resolve(mockNode3));

      const result = await cache.getNodesForNodeIds(mockModelId, mockRevisionId, [mockNode3.id, mockNode.id, mockNode2.id]);

      expect(result).toEqual([mockNode3, mockNode, mockNode2]);
    });

    it('should return only cached nodes if all are cached', async () => {
      const cachedKey1 = modelRevisionNodesAssetToKey(mockModelId, mockRevisionId, mockNode.id);
      const cachedKey2 = modelRevisionNodesAssetToKey(mockModelId, mockRevisionId, mockNode2.id);

      cache.setNodeIdToNode3DCacheItem(cachedKey1, Promise.resolve(mockNode));
      cache.setNodeIdToNode3DCacheItem(cachedKey2, Promise.resolve(mockNode2));

      const result = await cache.getNodesForNodeIds(mockModelId, mockRevisionId, [mockNode.id, mockNode2.id]);

      expect(result).toEqual([mockNode, mockNode2]);
    });
  });

  describe('getNodeIdToNode3DCacheItem', () => {
    it('should return undefined if the node is not cached', async () => {
      const key = modelRevisionNodesAssetToKey(mockModelId, mockRevisionId, mockNode.id);
      const result = await cache.getNodeIdToNode3DCacheItem(key);

      expect(result).toBeUndefined();
    });

    it('should return the cached node if it exists', async () => {
      const key = modelRevisionNodesAssetToKey(mockModelId, mockRevisionId, mockNode.id);
      cache.setNodeIdToNode3DCacheItem(key, Promise.resolve(mockNode));

      const result = await cache.getNodeIdToNode3DCacheItem(key);

      expect(result).toEqual(mockNode);
    });
  });

  describe('setNodeIdToNode3DCacheItem', () => {
    it('should set a node in the cache', async () => {
      const key = modelRevisionNodesAssetToKey(mockModelId, mockRevisionId, mockNode.id);
      cache.setNodeIdToNode3DCacheItem(key, Promise.resolve(mockNode));

      const result = await cache.getNodeIdToNode3DCacheItem(key);

      expect(result).toEqual(mockNode);
    });
  });
});
