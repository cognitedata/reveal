import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AssetMappingAndNode3DCache } from './AssetMappingAndNode3DCache';
import { AssetMapping3D, CursorAndAsyncIterator, type CogniteClient, type Node3D } from '@cognite/sdk';
import { ModelDMSUniqueInstanceKey, type CdfAssetMapping, type ModelId, type RevisionId } from './types';
import { It, Mock } from 'moq.ts';
import { createModelDMSUniqueInstanceKey, modelRevisionNodesAssetToKey } from './idAndKeyTranslation';

describe(AssetMappingAndNode3DCache.name, async () => {
  let cache: AssetMappingAndNode3DCache;

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
  const mockNodes: Node3D[] = [mockNode];

  const mockAssetMapping: CdfAssetMapping = {
    nodeId: mockNode.id,
    treeIndex: mockNode.treeIndex,
    subtreeSize: mockNode.subtreeSize,
    assetId: 100,
    assetInstanceId: { externalId: 'mock-external-id', space: 'mock-space' }
  };

  const mockAssetMapping3DFromSdkClassic: AssetMapping3D = {
    nodeId: mockNode.id,
    treeIndex: mockNode.treeIndex,
    subtreeSize: mockNode.subtreeSize,
    assetId: 100,
    assetInstanceId: undefined
  };

  const mockAssetMapping3DFromSdkHybrid: AssetMapping3D = {
    nodeId: mockNode.id,
    treeIndex: mockNode.treeIndex,
    subtreeSize: mockNode.subtreeSize,
    assetId: 100,
    assetInstanceId: {
      externalId: 'mock-external-id',
      space: 'mock-space'
    }
  };

  const assetMappings3DListMockClassic =  {
    autoPagingToArray: vi.fn().mockResolvedValue([mockAssetMapping3DFromSdkClassic])
  } as unknown as CursorAndAsyncIterator<AssetMapping3D>;

  const assetMappings3DListMockHybrid = {
    autoPagingToArray: vi.fn().mockResolvedValue([mockAssetMapping3DFromSdkHybrid])
  } as unknown as CursorAndAsyncIterator<AssetMapping3D>;

  const sdkMock = new Mock<CogniteClient>()
    .setup((p) => p.revisions3D.retrieve3DNodes)
    .returns(async () => mockNodes)
    .setup((p) => p.assetMappings3D.filter(It.IsAny(), It.IsAny(), It.IsAny()))
    .returns(assetMappings3DListMockClassic)
    .setup(p => p.assetMappings3D.list(It.IsAny(), It.IsAny(), It.IsAny()))
    .returns(assetMappings3DListMockHybrid)
    .object();


  beforeEach(() => {
    cache = new AssetMappingAndNode3DCache(sdkMock, false);
  });

  describe('getNodesForAssetInstancesInHybridMappings', () => {
    it('should return nodes mapped to hybrid asset instances', async () => {
      const mockMappings = [mockAssetMapping];

      const result = await cache.getNodesForAssetInstancesInHybridMappings(
        mockModelId,
        mockRevisionId,
        mockMappings
      );
      const expectedIdentifier = `${mockAssetMapping.assetInstanceId?.space}/${mockAssetMapping.assetInstanceId?.externalId}`;
      expect(result.get(expectedIdentifier)).toEqual(mockNodes);
    });
  });

  describe('getAssetMappingsForLowestAncestor', () => {
    it('should return the nearest ancestor with asset mappings', async () => {

      const result = await cache.getAssetMappingsForLowestAncestor(
        mockModelId,
        mockRevisionId,
        mockNodes
      );

      expect(result.node).toEqual(mockNode);
      expect(result.mappings).toEqual([mockAssetMapping3DFromSdkClassic, mockAssetMapping3DFromSdkHybrid]);
    });
  });

  describe('generateNode3DCachePerItem', () => {
    it('should call generateNode3DCachePerItem on the node cache', async () => {
      const spy = vi
        .spyOn(cache['nodeIdsToNode3DCache'], 'generateNode3DCachePerItem')
        .mockResolvedValueOnce();

      await cache.generateNode3DCachePerItem(mockModelId, mockRevisionId, [1]);

      expect(spy).toHaveBeenCalledWith(mockModelId, mockRevisionId, [1]);
    });
  });

  describe('setHybridItemCacheResult', () => {
    it('should set hybrid item cache result', async () => {
      const itemKey: ModelDMSUniqueInstanceKey = `${mockModelId}/${mockRevisionId}/mock-space/mock-external-id`;
      cache.setHybridItemCacheResult(itemKey, [
        mockAssetMapping
      ]);

      const dmsInstanceCache = await cache.getHybridItemCacheResult(itemKey);
      expect(dmsInstanceCache).toEqual([mockAssetMapping]);
    });
  });

  describe('fetchAssetMappingsRequest', () => {
    it('should fetch asset mappings and cache them', async () => {
      const result = await cache.fetchAssetMappingsRequest(
        [1],
        'nodeIds',
        mockModelId,
        mockRevisionId
      );

      expect(result).toEqual([mockAssetMapping3DFromSdkClassic, mockAssetMapping3DFromSdkHybrid]);
    });
  });

  describe('extractAndSetClassicAssetMappingsCacheItem', () => {
    it('should extract and set classic asset mappings in the cache', async () => {
      await cache.extractAndSetClassicAssetMappingsCacheItem(mockModelId, mockRevisionId, [
        mockAssetMapping
      ]);

      const nodeKey = modelRevisionNodesAssetToKey(mockModelId, mockRevisionId, mockAssetMapping.nodeId);
      const assetKey = modelRevisionNodesAssetToKey(
        mockModelId,
        mockRevisionId,
        mockAssetMapping.assetId
      );

      // Check if the cache was set correctly per nodeId
      const nodeCache = await cache.getItemCacheResult('nodeIds', nodeKey);
      expect(nodeCache).toEqual([mockAssetMapping]);

      // Check if the cache was set correctly per assetId
      const assetCache = await cache.getItemCacheResult('assetIds', assetKey);
      expect(assetCache).toEqual([mockAssetMapping]);
    });
  });

  describe('extractAndSetHybridAssetMappingsCacheItem', () => {
    it('should extract and set hybrid asset mappings in the cache', async () => {

      await cache.extractAndSetHybridAssetMappingsCacheItem(
        mockModelId,
        mockRevisionId,
        [mockAssetMapping],
        [1]
      );

      const mockDmInstance = {
        externalId: mockAssetMapping.assetInstanceId?.externalId || '',
        space: mockAssetMapping.assetInstanceId?.space || ''
      }

      const dmsKey = createModelDMSUniqueInstanceKey(mockModelId, mockRevisionId, mockDmInstance.space, mockDmInstance.externalId);

      // Check if the cache was set correctly per nodeId
      const dmsInstanceCache = await cache.getHybridItemCacheResult(dmsKey);
      expect(dmsInstanceCache).toEqual([mockAssetMapping]);
    });
  });

  describe('getAssetMappingsForNodes', () => {
    it('should fetch and cache asset mappings for nodes', async () => {

      cache.setItemCacheResult(
        'nodeIds',
        modelRevisionNodesAssetToKey(mockModelId, mockRevisionId, mockAssetMapping.nodeId),
        [mockAssetMapping]
      );
      const result = await cache.getAssetMappingsForNodes(
        mockModelId,
        mockRevisionId,
        mockNodes
      );

      expect(result).toEqual([mockAssetMapping]);
    });
  });

});
