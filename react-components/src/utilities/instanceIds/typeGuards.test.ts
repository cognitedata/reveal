import { describe, it, expect } from 'vitest';
import {
  isIdEither,
  isExternalId,
  isInternalId,
  isDmsInstance,
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
      const instance: IdEither = { externalId: 'external-id' };
      expect(isExternalId(instance)).toBe(true);
    });

    it('should return false for an InternalId', () => {
      const instance: IdEither = { id: 123 };
      expect(isExternalId(instance)).toBe(false);
    });

    it('should return false for an object with both externalId and space', () => {
      const instance: DmsUniqueIdentifier = { externalId: 'external-id', space: 'space' };
      expect(isExternalId(instance)).toBe(false);
    });
  });

  describe(isInternalId.name, () => {
    it('should return true for an InternalId', () => {
      const instance: IdEither = { id: 123 };
      expect(isInternalId(instance)).toBe(true);
    });

    it('should return false for an ExternalId', () => {
      const instance: IdEither = { externalId: 'external-id' };
      expect(isInternalId(instance)).toBe(false);
    });

    it('should return false for an invalid object with no InternalId', () => {
      const instance: AnnotationAssetRef = { externalId: 'external-id' };
      expect(isInternalId(instance)).toBe(false);
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
