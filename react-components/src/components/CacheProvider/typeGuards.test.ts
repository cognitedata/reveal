import { describe, test, expect } from 'vitest';
import { type AnnotationData, type AnnotationModel } from '@cognite/sdk';
import { isPointCloudAnnotationModel } from './typeGuards';

describe(isPointCloudAnnotationModel.name, () => {
  const commonProperties = {
    id: 123,
    annotatedResourceId: 456,
    annotatedResourceType: 'threedmodel' as AnnotationModel['annotatedResourceType'],
    annotationType: 'pointcloud.BoundingVolume',
    createdTime: new Date(),
    lastUpdatedTime: new Date(),
    status: 'approved' as AnnotationModel['status'],
    creatingApp: 'test-app',
    creatingAppVersion: 'test-version',
    creatingUser: 'test-user'
  };

  const minimalAnnotationWithEmptyRegion: AnnotationModel = {
    data: {
      region: []
    },
    ...commonProperties
  };

  const annotationWithExtras: AnnotationModel = {
    data: {
      region: [],
      assetRef: { id: 789 },
      instanceRef: {
        externalId: 'test-id',
        space: 'test-space',
        instanceType: 'node',
        sources: [
          {
            externalId: 'source-external-id',
            space: 'source-space',
            type: 'view' as const,
            version: '1'
          }
        ]
      }
    },
    ...commonProperties
  };

  const annotationWithoutData = {
    ...commonProperties // data property is missing
  } as const as AnnotationModel;

  test('returns true for annotation with minimal required properties', () => {
    const result = isPointCloudAnnotationModel(minimalAnnotationWithEmptyRegion);

    expect(result).toBe(true);
  });

  test('returns false for annotation without data property', () => {
    const result = isPointCloudAnnotationModel(annotationWithoutData);

    expect(result).toBe(false);
  });

  test('returns false for annotation with data missing region property', () => {
    const annotationWithoutRegion: AnnotationModel = {
      data: {
        assetRef: { id: 789 } // region property is missing
      } as const as AnnotationData,
      ...commonProperties
    };

    const result = isPointCloudAnnotationModel(annotationWithoutRegion);

    expect(result).toBe(false);
  });

  test('performs type narrowing correctly', () => {
    if (isPointCloudAnnotationModel(annotationWithExtras)) {
      // We can access data.region without type errors
      expect(typeof annotationWithExtras.data).toBe('object');
      expect(annotationWithExtras.data.region).toBeDefined();
    } else {
      expect.fail('Valid annotation should pass type guard'); // This should not happen for valid annotation
    }
  });
});
