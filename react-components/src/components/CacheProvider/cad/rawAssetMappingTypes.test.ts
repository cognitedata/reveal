import { describe, expect, test } from 'vitest';
import { convertToHybridAssetMapping } from './rawAssetMappingTypes';

describe('raw asset mapping types', () => {
  const BASE_ASSET_MAPPING = { nodeId: 123, treeIndex: 234, subtreeSize: 345 };
  const ASSET_ID = 987;
  const INSTANCE_ID = { externalId: 'external-id', space: 'space' };

  describe(convertToHybridAssetMapping.name, () => {
    test('extracts nothing if mapping contains no treeIndex/subtreeSize', () => {
      expect(convertToHybridAssetMapping({ nodeId: 123, assetId: ASSET_ID })).toEqual(undefined);
      expect(
        convertToHybridAssetMapping({ nodeId: 123, assetId: ASSET_ID, treeIndex: 234 })
      ).toEqual(undefined);
      expect(
        convertToHybridAssetMapping({ nodeId: 123, assetId: ASSET_ID, subtreeSize: 345 })
      ).toEqual(undefined);
    });

    test('extracts assetId if present', () => {
      expect(convertToHybridAssetMapping({ ...BASE_ASSET_MAPPING, assetId: ASSET_ID })).toEqual({
        ...BASE_ASSET_MAPPING,
        assetId: ASSET_ID
      });
    });

    test('extracts instanceId if present', () => {
      expect(
        convertToHybridAssetMapping({ ...BASE_ASSET_MAPPING, assetInstanceId: INSTANCE_ID })
      ).toEqual({ ...BASE_ASSET_MAPPING, instanceId: INSTANCE_ID });
    });
  });
});
