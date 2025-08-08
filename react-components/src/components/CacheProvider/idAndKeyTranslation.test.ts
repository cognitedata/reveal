import { describe, expect, test } from 'vitest';
import {
  createFdmKey,
  createInstanceKey,
  createModelRevisionKey,
  createModelTreeIndexKey,
  createModelInstanceIdKey,
  revisionKeyToIds,
  createModelNodeIdKey,
  instanceIdToInstanceReference,
  fdmKeyToId
} from './idAndKeyTranslation';

describe('idAndKeyTranslation', () => {
  const MODEL_ID = 123;
  const REVISION_ID = 456;
  const INSTANCE = { externalId: 'externalId', space: 'space' };
  const ASSET_ID = 765;
  const NODE_ID = 654;

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

  describe(fdmKeyToId.name, () => {
    test('splits up fdm key into externalId and space', () => {
      expect(fdmKeyToId('some-space/some-externalId')).toEqual({
        space: 'some-space',
        externalId: 'some-externalId'
      });
    });

    test('reverses `createFdmKey`', () => {
      const id = { externalId: 'another-externalId', space: 'another-space' };
      expect(fdmKeyToId(createFdmKey(id))).toEqual(id);
    });

    test('tackles externalIds with slash', () => {
      const id = { externalId: 'another/externalId', space: 'another-space' };
      expect(fdmKeyToId(createFdmKey(id))).toEqual(id);
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

  describe(instanceIdToInstanceReference, () => {
    test('correctly translates classic ID', () => {
      expect(instanceIdToInstanceReference(ASSET_ID)).toEqual({ id: ASSET_ID });
    });

    test('correctly preserves DM ID', () => {
      expect(instanceIdToInstanceReference(INSTANCE)).toEqual(INSTANCE);
    });
  });

  describe(createModelInstanceIdKey.name, () => {
    test('concatenates model ID, revision ID and asset ID into key', () => {
      expect(createModelInstanceIdKey(MODEL_ID, REVISION_ID, ASSET_ID)).toBe(
        `${MODEL_ID}/${REVISION_ID}/${ASSET_ID}`
      );
    });
  });

  describe(createModelNodeIdKey.name, () => {
    test('concatenates model ID, revision ID and node ID into key', () => {
      expect(createModelNodeIdKey(MODEL_ID, REVISION_ID, NODE_ID)).toBe(
        `${MODEL_ID}/${REVISION_ID}/${NODE_ID}`
      );
    });
  });
});
