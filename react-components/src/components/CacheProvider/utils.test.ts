import { describe, expect, test } from 'vitest';
import {
  getInstanceReferencesFromPointCloudAnnotation,
  getInstanceReferencesFromPointCloudVolume,
  getPointCloudVolumeId
} from './utils';
import { createPointCloudAnnotationMock } from '#test-utils/fixtures/pointCloudAnnotation';
import {
  createClassicPointCloudVolumeMock,
  createDmPointCloudVolumeMock
} from '#test-utils/fixtures/pointCloudVolume';

describe('utils', () => {
  const ASSET_REF = { id: 123 };
  const DMS_ID = { externalId: 'asset-external-id', space: 'asset-space' };

  describe(getInstanceReferencesFromPointCloudAnnotation.name, () => {
    test('returns nothing when annotations contain no annotations', () => {
      const annotation = createPointCloudAnnotationMock();

      const instances = getInstanceReferencesFromPointCloudAnnotation(annotation);
      expect(instances).toEqual([]);
    });

    test('returns asset ref when annotations contain no annotations', () => {
      const annotation = createPointCloudAnnotationMock({ assetId: ASSET_REF.id });

      const instances = getInstanceReferencesFromPointCloudAnnotation(annotation);
      expect(instances).toEqual([ASSET_REF]);
    });

    test('returns instance ref when annotation contains instance ref', () => {
      const annotation = createPointCloudAnnotationMock({ dmIdentifier: DMS_ID });

      const instances = getInstanceReferencesFromPointCloudAnnotation(annotation);
      expect(instances).toEqual([DMS_ID]);
    });

    test('returns nothing when annotations contain no annotations', () => {
      const annotation = createPointCloudAnnotationMock({
        assetId: ASSET_REF.id,
        dmIdentifier: DMS_ID
      });

      const instances = getInstanceReferencesFromPointCloudAnnotation(annotation);
      expect(instances).toEqual([ASSET_REF, DMS_ID]);
    });
  });

  describe(getInstanceReferencesFromPointCloudVolume.name, () => {
    test('returns nothing for empty annotations', () => {
      const classicAnnotation = createClassicPointCloudVolumeMock();
      const dmAnnotation = createClassicPointCloudVolumeMock();

      const classicInstances = getInstanceReferencesFromPointCloudVolume(classicAnnotation);
      const dmInstances = getInstanceReferencesFromPointCloudVolume(dmAnnotation);
      expect(classicInstances).toEqual([]);
      expect(dmInstances).toEqual([]);
    });

    test('returns classic asset ref when present', () => {
      const classicAnnotation = createClassicPointCloudVolumeMock({ classicAssetId: ASSET_REF });

      const classicInstances = getInstanceReferencesFromPointCloudVolume(classicAnnotation);
      expect(classicInstances).toEqual([ASSET_REF]);
    });

    test('returns DM asset from classic annotation when present', () => {
      const classicAnnotation = createClassicPointCloudVolumeMock({
        dmAssetId: DMS_ID
      });

      const dmInstances = getInstanceReferencesFromPointCloudVolume(classicAnnotation);
      expect(dmInstances).toEqual([DMS_ID]);
    });

    test('returns both classic and DM asset from classic annotation when present', () => {
      const classicAnnotation = createClassicPointCloudVolumeMock({
        classicAssetId: ASSET_REF,
        dmAssetId: DMS_ID
      });

      const instances = getInstanceReferencesFromPointCloudVolume(classicAnnotation);
      expect(instances).toEqual([ASSET_REF, DMS_ID]);
    });

    test('returns DM asset from DM annotation when present', () => {
      const dmAnnotation = createDmPointCloudVolumeMock({
        assetId: DMS_ID
      });

      const classicInstances = getInstanceReferencesFromPointCloudVolume(dmAnnotation);
      expect(classicInstances).toEqual([DMS_ID]);
    });
  });

  describe(getPointCloudVolumeId.name, () => {
    test('returns ID of classic point cloud volume', () => {
      const volume = createClassicPointCloudVolumeMock({ id: 456 });
      expect(getPointCloudVolumeId(volume)).toBe(456);
    });

    test('returns ID of DM point cloud volume', () => {
      const volumeId = { externalId: 'volume-external-id', space: 'volume-space' };
      const volume = createDmPointCloudVolumeMock({ id: volumeId });
      expect(getPointCloudVolumeId(volume)).toBe(volumeId);
    });
  });
});
