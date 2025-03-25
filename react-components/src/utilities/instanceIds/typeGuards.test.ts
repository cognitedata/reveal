import { describe, it, expect } from 'vitest';
import {
  isIdEither,
  isExternalId,
  isInternalId,
  isDmsInstance,
  isObject3DIdentifier,
  type AnnotationAssetRef
} from '../../../src/utilities/instanceIds/typeGuards';
import { type IdEither } from '@cognite/sdk';
import { type DmsUniqueIdentifier } from '../../../src/data-providers';
import { type InstanceReference } from '../../../src/utilities/instanceIds/types';

describe('typeGuards', () => {
  describe(isIdEither.name, () => {
    it('should return true for an ExternalId', () => {
      const instance: InstanceReference = { externalId: 'external-id' };
      expect(isIdEither(instance)).toBe(true);
    });

    it('should return true for an InternalId', () => {
      const instance: InstanceReference = { id: 123 };
      expect(isIdEither(instance)).toBe(true);
    });

    it('should return false for an invalid object', () => {
      const instance = { someKey: 'value' } as const as AnnotationAssetRef;
      expect(isIdEither(instance)).toBe(false);
    });
  });

  describe(isExternalId.name, () => {
    it('should return true for an ExternalId', () => {
      const idEither: IdEither = { externalId: 'external-id' };
      expect(isExternalId(idEither)).toBe(true);
    });

    it('should return false for an InternalId', () => {
      const idEither: IdEither = { id: 123 };
      expect(isExternalId(idEither)).toBe(false);
    });

    it('should return false for an object with both externalId and space', () => {
      const idEither: DmsUniqueIdentifier = { externalId: 'external-id', space: 'space' };
      expect(isExternalId(idEither)).toBe(false);
    });
  });

  describe(isInternalId.name, () => {
    it('should return true for an InternalId', () => {
      const idEither: IdEither = { id: 123 };
      expect(isInternalId(idEither)).toBe(true);
    });

    it('should return false for an ExternalId', () => {
      const idEither: IdEither = { externalId: 'external-id' };
      expect(isInternalId(idEither)).toBe(false);
    });

    it('should return false for an invalid object with no InternalId', () => {
      const idEither: AnnotationAssetRef = { externalId: 'external-id' };
      expect(isInternalId(idEither)).toBe(false);
    });
  });

  describe(isDmsInstance.name, () => {
    it('should return true for a DmsUniqueIdentifier', () => {
      const instance: InstanceReference = { externalId: 'external-id', space: 'space' };
      expect(isDmsInstance(instance)).toBe(true);
    });

    it('should return false for an object without externalId', () => {
      const instance = { space: 'space' };
      expect(isDmsInstance(instance)).toBe(false);
    });

    it('should return false for an object without space', () => {
      const instance = { externalId: 'external-id' };
      expect(isDmsInstance(instance)).toBe(false);
    });

    it('should return false for an InternalId', () => {
      const instance: InstanceReference = { id: 123 };
      expect(isDmsInstance(instance)).toBe(false);
    });
    it('should return false for null or undefined', () => {
      expect(isDmsInstance(null)).toBe(false);
      expect(isDmsInstance(undefined)).toBe(false);
    });
  });
});
