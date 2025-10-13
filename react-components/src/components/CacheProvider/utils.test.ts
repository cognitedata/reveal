import { describe, expect, test } from 'vitest';
import { getInstanceReferencesFromPointCloudAnnotation } from './utils';
import { createPointCloudAnnotationMock } from '#test-utils/fixtures/pointCloudAnnotation';

describe('utils', () => {
  describe(getInstanceReferencesFromPointCloudAnnotation.name, () => {
    const ASSET_REF = { id: 123 };
    const DMS_ID = { externalId: 'asset-external-id', space: 'asset-space' };

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
});
