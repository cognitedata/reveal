import { describe, expect, test } from 'vitest';
import { createClassicCadAssetMappingCache } from './ClassicCadAssetMappingCacheImpl';
import {
  assetMappings3DFilterMock,
  assetMappings3DListMock,
  nodes3dRetrieveMock,
  sdkMock
} from '#test-utils/fixtures/sdk';
import { createCadNodeMock } from '#test-utils/fixtures/cadNode';
import { createCursorAndAsyncIteratorMock } from '#test-utils/fixtures/cursorAndIterator';
import { type InstanceId, isClassicInstanceId } from '../../../utilities/instanceIds';
import { type RawCdfHybridCadAssetMapping } from './rawAssetMappingTypes';
import { type AssetMapping3D, type Node3D } from '@cognite/sdk';

describe(createClassicCadAssetMappingCache.name, () => {
  const MODEL_ID = 123;
  const REVISION_ID = 234;

  const CAD_NODES = [
    createCadNodeMock({ id: 123, treeIndex: 234 }),
    createCadNodeMock({ id: 987, treeIndex: 345 }),
    createCadNodeMock({ id: 678, treeIndex: 456 })
  ];

  const ASSET_ID = 42;

  describe('getAssetMappingsForLowestAncestor', () => {
    test('returns no mappings when no nodes were supplied', async () => {
      const cache = createClassicCadAssetMappingCache(sdkMock);

      const result = await cache.getAssetMappingsForLowestAncestor(MODEL_ID, REVISION_ID, []);
      expect(result).toEqual({ mappings: [] });
    });

    test('returns nothing if no relevant mappings exist', async () => {
      assetMappings3DFilterMock.mockReturnValue(createCursorAndAsyncIteratorMock({ items: [] }));

      const cache = createClassicCadAssetMappingCache(sdkMock);

      const result = await cache.getAssetMappingsForLowestAncestor(
        MODEL_ID,
        REVISION_ID,
        CAD_NODES
      );

      expect(result).toEqual({ mappings: [] });
    });

    test('returns relevant mappings if exist', async () => {
      const mapping = createRawAssetMappingFromNodeAndInstance(CAD_NODES[0], ASSET_ID);

      assetMappings3DFilterMock.mockReturnValue(
        createCursorAndAsyncIteratorMock({
          // SDK method uses `AssetMapping3D', but its `assetId` may not always
          // be defined in real usage
          items: [mapping] as AssetMapping3D[]
        })
      );

      const cache = createClassicCadAssetMappingCache(sdkMock);
      const result = await cache.getAssetMappingsForLowestAncestor(
        MODEL_ID,
        REVISION_ID,
        CAD_NODES
      );

      expect(result).toEqual({ node: CAD_NODES[0], mappings: [mapping] });
    });

    test('only returns results for the ancestor with the highest tree index', async () => {
      const mappings = [
        createRawAssetMappingFromNodeAndInstance(CAD_NODES[0], 1),
        createRawAssetMappingFromNodeAndInstance(CAD_NODES[1], 2),
        createRawAssetMappingFromNodeAndInstance(CAD_NODES[2], 3)
      ];

      assetMappings3DFilterMock.mockReturnValue(
        createCursorAndAsyncIteratorMock({
          // SDK method uses `AssetMapping3D', but its `assetId` may not always
          // be defined in real usage
          items: mappings as AssetMapping3D[]
        })
      );

      const cache = createClassicCadAssetMappingCache(sdkMock);
      const result = await cache.getAssetMappingsForLowestAncestor(
        MODEL_ID,
        REVISION_ID,
        CAD_NODES
      );

      expect(result).toEqual({ node: CAD_NODES[2], mappings: [mappings[2]] });
    });
  });

  describe('getNodesForInstanceIds', () => {
    test('returns empty map if no associated mapping exists', async () => {
      assetMappings3DFilterMock.mockReturnValue(
        createCursorAndAsyncIteratorMock({
          items: [
            createRawAssetMappingFromNodeAndInstance(CAD_NODES[0], ASSET_ID)
          ] as AssetMapping3D[]
        })
      );
      const cache = createClassicCadAssetMappingCache(sdkMock);
      const result = await cache.getNodesForInstanceIds(MODEL_ID, REVISION_ID, [ASSET_ID]);

      expect(result).toEqual(new Map());
    });

    test('returns map with relevant mappings for input instance', async () => {
      assetMappings3DFilterMock.mockReturnValue(
        createCursorAndAsyncIteratorMock({
          items: [
            createRawAssetMappingFromNodeAndInstance(CAD_NODES[0], ASSET_ID)
          ] as AssetMapping3D[]
        })
      );

      nodes3dRetrieveMock.mockResolvedValue([CAD_NODES[0]]);
      const cache = createClassicCadAssetMappingCache(sdkMock);
      const result = await cache.getNodesForInstanceIds(MODEL_ID, REVISION_ID, [ASSET_ID]);

      expect(result).toEqual(new Map([[ASSET_ID, [CAD_NODES[0]]]]));
    });

    test('calls asset mappings mock with model and asset IDs', async () => {
      const cache = createClassicCadAssetMappingCache(sdkMock);
      await cache.getNodesForInstanceIds(MODEL_ID, REVISION_ID, [ASSET_ID]);
      expect(assetMappings3DFilterMock).toHaveBeenCalledWith(MODEL_ID, REVISION_ID, {
        limit: 1000,
        filter: { assetIds: [ASSET_ID] }
      });
    });
  });

  describe('getAssetMappingsForModel', () => {
    test('returns nothing if no relevant asset mappings exist', async () => {
      const cache = createClassicCadAssetMappingCache(sdkMock);

      const result = await cache.getAssetMappingsForModel(MODEL_ID, REVISION_ID);
      expect(result).toEqual([]);
    });

    test('uses SDK to fetch asset mappings for model', async () => {
      const mappings = [
        createRawAssetMappingFromNodeAndInstance(CAD_NODES[0], ASSET_ID),
        createRawAssetMappingFromNodeAndInstance(CAD_NODES[2], 43)
      ];
      assetMappings3DListMock.mockReturnValueOnce(
        createCursorAndAsyncIteratorMock({
          items: mappings as AssetMapping3D[]
        })
      );

      const cache = createClassicCadAssetMappingCache(sdkMock);

      const result = await cache.getAssetMappingsForModel(MODEL_ID, REVISION_ID);

      expect(result).toEqual(mappings);
      expect(assetMappings3DListMock).toHaveBeenCalledWith(MODEL_ID, REVISION_ID, {
        limit: 1000,
        getDmsInstances: true
      });
    });

    test('caches result from SDK', async () => {
      const cache = createClassicCadAssetMappingCache(sdkMock);

      const result = await cache.getAssetMappingsForModel(MODEL_ID, REVISION_ID);

      // The list endpoint is called twice, once for classic assets and once for DM
      expect(assetMappings3DListMock).toHaveBeenCalledTimes(2);

      const result1 = await cache.getAssetMappingsForModel(MODEL_ID, REVISION_ID);

      expect(result).toEqual(result1);
      expect(assetMappings3DListMock).toHaveBeenCalledTimes(2);
    });
  });
});

function createRawAssetMappingFromNodeAndInstance(
  node: Node3D,
  instanceId: InstanceId
): RawCdfHybridCadAssetMapping {
  const assetMappingBase = {
    nodeId: node.id,
    treeIndex: node.treeIndex,
    subtreeSize: node.subtreeSize
  };

  if (isClassicInstanceId(instanceId)) {
    return { ...assetMappingBase, assetId: instanceId };
  }

  return { ...assetMappingBase, assetInstanceId: instanceId };
}
