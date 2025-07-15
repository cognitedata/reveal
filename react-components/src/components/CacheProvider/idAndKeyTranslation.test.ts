import { describe, expect, test } from 'vitest';
import {
  createFdmKey,
  createInstanceKey,
  createModelRevisionKey,
  createModelTreeIndexKey,
  modelRevisionNodesAssetToKey,
  revisionKeyToIds
} from './idAndKeyTranslation';

describe('idAndKeyTranslation', () => {
  const MODEL_ID = 123;
  const REVISION_ID = 456;
  const INSTANCE = { externalId: 'externalId', space: 'space' };
  const ASSET_ID = 765;

  describe(createModelRevisionKey.name, () => {
    test('concatenates model and revision into key', () => {
      expect(createModelRevisionKey(MODEL_ID, REVISION_ID)).toBe(`${MODEL_ID}/${REVISION_ID}`);
    });
  });

  describe(revisionKeyToIds.name, () => {
    test('extract IDs from model revisionkey', () => {
      expect(revisionKeyToIds(`${MODEL_ID}/${REVISION_ID}`)).toEqual([MODEL_ID, REVISION_ID]);
    });

    test('reverses operation of `createModelRevisionKey`', () => {
      expect(revisionKeyToIds(createModelRevisionKey(MODEL_ID, REVISION_ID))).toEqual([
        MODEL_ID,
        REVISION_ID
      ]);
    });
  });

  describe(createModelTreeIndexKey.name, () => {
    const TREE_INDEX = 789;
    test('concatenates model ID, revision ID and tree index into key', () => {
      expect(createModelTreeIndexKey(MODEL_ID, REVISION_ID, TREE_INDEX)).toBe(
        `${MODEL_ID}/${REVISION_ID}/${TREE_INDEX}`
      );
    });
  });

  describe(createFdmKey.name, () => {
    test('concatenates externalId and space into key', () => {
      expect(createFdmKey(INSTANCE)).toBe(`${INSTANCE.space}/${INSTANCE.externalId}`);
    });
  });

  describe(createInstanceKey.name, () => {
    test('returns classic ID untouched', () => {
      expect(createInstanceKey(ASSET_ID)).toBe(ASSET_ID);
    });

    test('returns DM ID as key', () => {
      const result = createInstanceKey(INSTANCE);
      expect(result).toBeTypeOf('string');
      expect(result).toBe(createFdmKey(INSTANCE));
    });
  });

  describe(modelRevisionNodesAssetToKey.name, () => {
    test('concatenates model ID, revision ID and asset ID into key', () => {
      expect(modelRevisionNodesAssetToKey(MODEL_ID, REVISION_ID, ASSET_ID)).toBe(
        `${MODEL_ID}/${REVISION_ID}/${ASSET_ID}`
      );
    });
  });
});
