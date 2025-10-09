import { describe, test, expect } from 'vitest';
import { type AnnotationData, type AnnotationModel } from '@cognite/sdk';
import { isPointCloudAnnotationModel } from './typeGuards';

describe(isPointCloudAnnotationModel.name, () => {
  const commonProperties = {
    id: 123,
    annotatedResourceId: 456,
    annotatedResourceType: 'threedmodel' as const,
    annotationType: 'pointcloud.BoundingVolume',
    createdTime: new Date(),
    lastUpdatedTime: new Date(),
    status: 'approved' as const,
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

  test('returns true for point cloud annotation with minimal required properties', () => {
    expect(isPointCloudAnnotationModel(minimalAnnotationWithEmptyRegion)).toBe(true);
  });

  test('returns true for point cloud annotation with references', () => {
    expect(isPointCloudAnnotationModel(annotationWithExtras)).toBe(true);
  });

  test('returns false for annotation without data property', () => {
    expect(isPointCloudAnnotationModel(annotationWithoutData)).toBe(false);
  });

  test('returns false for annotation with data missing region property', () => {
    const annotationWithoutRegion: AnnotationModel = {
      data: {
        assetRef: { id: 789 } // region property is missing, which indicates it's not a point cloud annotation
      } as const as AnnotationData,
      ...commonProperties
    };

    expect(isPointCloudAnnotationModel(annotationWithoutRegion)).toBe(false);
  });
});
