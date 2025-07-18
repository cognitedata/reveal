import { describe, expect, test } from 'vitest';
import { convertToHybridAssetMapping } from './rawAssetMappingTypes';

describe('raw asset mapping types', () => {
  const BASE_ASSET_MAPPING = { nodeId: 123, treeIndex: 234, subtreeSize: 345 };
  const ASSET_ID = 987;
  const INSTANCE_ID = { externalId: 'external-id', space: 'space' };

  describe(convertToHybridAssetMapping.name, () => {
    test('extracts nothing if mapping contains no asset reference', () => {
      expect(convertToHybridAssetMapping(BASE_ASSET_MAPPING)).toEqual([]);
    });

    test('extracts assetId if present', () => {
      expect(convertToHybridAssetMapping({ ...BASE_ASSET_MAPPING, assetId: ASSET_ID })).toEqual([
        { ...BASE_ASSET_MAPPING, assetId: ASSET_ID }
      ]);
    });

    test('extracts instanceId if present', () => {
      expect(
        convertToHybridAssetMapping({ ...BASE_ASSET_MAPPING, assetInstanceId: INSTANCE_ID })
      ).toEqual([{ ...BASE_ASSET_MAPPING, instanceId: INSTANCE_ID }]);
    });

    test('extracts both assetId and instanceId if both present', () => {
      expect(
        convertToHybridAssetMapping({
          ...BASE_ASSET_MAPPING,
          assetId: ASSET_ID,
          assetInstanceId: INSTANCE_ID
        })
      ).toEqual([
        { ...BASE_ASSET_MAPPING, assetId: ASSET_ID },
        { ...BASE_ASSET_MAPPING, instanceId: INSTANCE_ID }
      ]);
    });
  });
});
