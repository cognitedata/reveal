import { describe, expect, test } from 'vitest';
import {
  buildAssetKeyToAnnotationIdsMap,
  getInstanceReferencesFromPointCloudAnnotation
} from './utils';
import { createPointCloudAnnotationMock } from '#test-utils/fixtures/pointCloudAnnotation';
import { type AssetInstance } from '../../utilities/instances/AssetInstance';
import { createAssetMock, createFdmNodeItem } from '#test-utils/fixtures/assets';

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

  describe(buildAssetKeyToAnnotationIdsMap.name, () => {
    test('returns empty map when no annotation asset mappings provided', () => {
      const annotationAssetMappings = new Map();

      const result = buildAssetKeyToAnnotationIdsMap(annotationAssetMappings);

      expect(result.size).toBe(0);
    });

    test('builds map for classic assets with id', () => {
      const annotationAssetMappings = new Map<number, AssetInstance[]>([
        [1, [createAssetMock(123)]],
        [2, [createAssetMock(456)]]
      ]);

      const result = buildAssetKeyToAnnotationIdsMap(annotationAssetMappings);

      expect(result.get('123')).toEqual(new Set([1]));
      expect(result.get('456')).toEqual(new Set([2]));
    });

    test('builds map for classic assets with id and externalId', () => {
      const annotationAssetMappings = new Map<number, AssetInstance[]>([
        [1, [createAssetMock(123, 'test-external-id-1')]]
      ]);

      const result = buildAssetKeyToAnnotationIdsMap(annotationAssetMappings);

      expect(result.get('123')).toEqual(new Set([1]));
      expect(result.get('test-external-id-1')).toEqual(new Set([1]));
    });

    test('builds map for DMS assets', () => {
      const annotationAssetMappings = new Map([
        [1, [createFdmNodeItem({ space: 'test-space', externalId: 'test-external-id-1' })]]
      ]);

      const result = buildAssetKeyToAnnotationIdsMap(annotationAssetMappings);

      expect(result.get('test-space/test-external-id-1')).toEqual(new Set([1]));
    });

    test('handles multiple annotations mapping to same asset', () => {
      const annotationAssetMappings = new Map([
        [1, [createAssetMock(123)]],
        [2, [createAssetMock(123)]]
      ]);

      const result = buildAssetKeyToAnnotationIdsMap(annotationAssetMappings);

      expect(result.get('123')).toEqual(new Set([1, 2]));
    });

    test('handles mixed classic and DMS assets', () => {
      const annotationAssetMappings = new Map([
        [
          1,
          [
            createAssetMock(123, 'external-123', 'Classic Asset'),
            createFdmNodeItem({ space: 'space1', externalId: 'dms-ext-1' })
          ]
        ]
      ]);

      const result = buildAssetKeyToAnnotationIdsMap(annotationAssetMappings);

      expect(result.get('123')).toEqual(new Set([1]));
      expect(result.get('external-123')).toEqual(new Set([1]));
      expect(result.get('space1/dms-ext-1')).toEqual(new Set([1]));
    });
  });
});
