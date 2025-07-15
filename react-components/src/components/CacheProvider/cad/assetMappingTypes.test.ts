import { describe, expect, expectTypeOf, test } from 'vitest';
import {
  type ClassicCadAssetMapping,
  type ClassicCadAssetTreeIndexMapping,
  type DmCadAssetMapping,
  type DmCadAssetTreeIndexMapping,
  type HybridCadAssetMapping,
  type HybridCadAssetTreeIndexMapping,
  isClassicCadAssetMapping,
  isClassicCadAssetTreeIndexMapping,
  isDmCadAssetMapping,
  isDmCadAssetTreeIndexMapping,
  isValidClassicCadAssetMapping
} from './assetMappingTypes';
import assert from 'assert';

describe('assetMappingTypes', () => {
  const DM_INSTANCE_ID = { externalId: 'externalId', space: 'space' };
  const NODE_ID = 123;
  const ASSET_ID = 234;
  const TREE_INDEX = 345;
  const SUBTREE_SIZE = 456;

  const classicAssetMapping: ClassicCadAssetMapping = {
    nodeId: NODE_ID,
    assetId: ASSET_ID,
    treeIndex: TREE_INDEX,
    subtreeSize: SUBTREE_SIZE
  };
  const dmAssetMapping: DmCadAssetMapping = {
    nodeId: NODE_ID,
    instanceId: DM_INSTANCE_ID,
    treeIndex: TREE_INDEX,
    subtreeSize: SUBTREE_SIZE
  };

  const classicAssetTreeIndexMapping: ClassicCadAssetTreeIndexMapping = {
    assetId: ASSET_ID,
    treeIndex: TREE_INDEX,
    subtreeSize: SUBTREE_SIZE
  };
  const dmAssetTreeIndexMapping: DmCadAssetTreeIndexMapping = {
    instanceId: DM_INSTANCE_ID,
    treeIndex: TREE_INDEX,
    subtreeSize: SUBTREE_SIZE
  };

  describe(isClassicCadAssetMapping.name, () => {
    test('recognizes classic asset mapping', () => {
      expect(isClassicCadAssetMapping(classicAssetMapping)).toBeTruthy();
    });

    test('does not accept DM asset mapping', () => {
      expect(isClassicCadAssetMapping(dmAssetMapping)).toBeFalsy();
    });

    test('asserts asset mapping to be ClassicCadAssetMapping', () => {
      const mapping = classicAssetMapping as HybridCadAssetMapping;
      assert(isClassicCadAssetMapping(mapping));
      expectTypeOf<ClassicCadAssetMapping>(mapping);
    });
  });

  describe(isDmCadAssetMapping.name, () => {
    test('recognizes DM asset mapping', () => {
      expect(isDmCadAssetMapping(dmAssetMapping)).toBeTruthy();
    });

    test('rejectsclassic asset mapping', () => {
      expect(isDmCadAssetMapping(classicAssetMapping)).toBeFalsy();
    });

    test('asserts asset mapping to be DmCadAssetMapping', () => {
      const mapping = dmAssetMapping as HybridCadAssetMapping;
      assert(isDmCadAssetMapping(mapping));
      expectTypeOf<DmCadAssetMapping>(mapping);
    });
  });

  describe(isValidClassicCadAssetMapping.name, () => {
    test('rejects asset mappings without treeIndex and subtreeSize', () => {
      expect(isValidClassicCadAssetMapping({ nodeId: 1, assetId: 12 })).toBeFalsy();
      expect(isValidClassicCadAssetMapping({ nodeId: 1, assetId: 12, treeIndex: 23 })).toBeFalsy();
      expect(isValidClassicCadAssetMapping({ nodeId: 1, assetId: 12, subtreeSize: 3 })).toBeFalsy();
    });

    test('recognizes asset mappings with all fields, and asserts type', () => {
      expect(isValidClassicCadAssetMapping(classicAssetMapping)).toBeTruthy();
    });

    test('asserts asset mapping to be ClassicCadAssetMapping', () => {
      const mapping = classicAssetMapping as HybridCadAssetMapping;
      assert(isValidClassicCadAssetMapping(mapping));
      expectTypeOf<ClassicCadAssetMapping>(mapping);
    });
  });

  describe(isClassicCadAssetTreeIndexMapping.name, () => {
    test('recognizes classic tree index mapping', () => {
      expect(isClassicCadAssetTreeIndexMapping(classicAssetTreeIndexMapping)).toBeTruthy();
    });

    test('rejects DM tree index mapping', () => {
      expect(isClassicCadAssetTreeIndexMapping(dmAssetTreeIndexMapping)).toBeFalsy();
    });

    test('asserts tree index mapping to be ClassicCadAssetTreeIndexMapping', () => {
      const mapping = classicAssetTreeIndexMapping as HybridCadAssetTreeIndexMapping;
      assert(isClassicCadAssetTreeIndexMapping(mapping));
      expectTypeOf<ClassicCadAssetTreeIndexMapping>(mapping);
    });
  });

  describe(isDmCadAssetTreeIndexMapping.name, () => {
    test('recognizes DM tree index mapping', () => {
      expect(isDmCadAssetTreeIndexMapping(dmAssetTreeIndexMapping)).toBeTruthy();
    });

    test('rejects classic tree index mapping', () => {
      expect(isDmCadAssetTreeIndexMapping(classicAssetTreeIndexMapping)).toBeFalsy();
    });

    test('asserts tree index mapping to be DmCadAssetTreeIndexMapping', () => {
      const mapping = dmAssetTreeIndexMapping as HybridCadAssetTreeIndexMapping;
      assert(isDmCadAssetTreeIndexMapping(mapping));
      expectTypeOf<DmCadAssetTreeIndexMapping>(mapping);
    });
  });
});
