import { describe, expect, expectTypeOf, test } from 'vitest';
import {
  type ClassicCadAssetMapping,
  type ClassicCadAssetMappingInstance,
  type ClassicCadAssetTreeIndexMapping,
  type DmCadAssetMapping,
  type DmCadAssetMappingInstance,
  type DmCadAssetTreeIndexMapping,
  type HybridCadAssetMapping,
  type HybridCadAssetMappingInstance,
  type HybridCadAssetTreeIndexMapping,
  isClassicCadAssetMapping,
  isClassicCadAssetMappingInstance,
  isClassicCadAssetTreeIndexMapping,
  isDmCadAssetMapping,
  isDmCadAssetMappingInstance,
  isDmCadAssetTreeIndexMapping
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

  describe(isClassicCadAssetMappingInstance.name, () => {
    test('recognizes classic asset mapping', () => {
      expect(isClassicCadAssetMappingInstance({ assetId: ASSET_ID })).toBeTruthy();
    });

    test('does not accept DM asset mapping', () => {
      expect(isClassicCadAssetMappingInstance({ instanceId: DM_INSTANCE_ID })).toBeFalsy();
    });

    test('asserts asset mapping to be ClassicCadAssetMapping', () => {
      const mapping = classicAssetMapping as HybridCadAssetMappingInstance;
      assert(isClassicCadAssetMappingInstance(mapping));
      expectTypeOf<ClassicCadAssetMappingInstance>(mapping);
    });
  });

  describe(isDmCadAssetMappingInstance.name, () => {
    test('recognizes DM asset mapping', () => {
      expect(isDmCadAssetMappingInstance({ instanceId: DM_INSTANCE_ID })).toBeTruthy();
    });

    test('rejects classic asset mapping', () => {
      expect(isDmCadAssetMappingInstance({ assetId: ASSET_ID })).toBeFalsy();
    });

    test('asserts asset mapping to be ClassicCadAssetMapping', () => {
      const mapping = dmAssetMapping as HybridCadAssetMappingInstance;
      assert(isDmCadAssetMappingInstance(mapping));
      expectTypeOf<DmCadAssetMappingInstance>(mapping);
    });
  });

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
});
