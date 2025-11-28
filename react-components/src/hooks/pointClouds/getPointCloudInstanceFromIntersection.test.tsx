import { describe, expect, test } from 'vitest';
import { type IdEither } from '@cognite/sdk';
import {
  type AnyIntersection,
  type ClassicDataSourceType,
  type DMInstanceRef,
  type PointCloudIntersection,
  type DataSourceType,
  type CognitePointCloudModel
} from '@cognite/reveal';
import { Vector3 } from 'three';
import { getPointCloudInstanceFromIntersection } from './getPointCloudInstanceFromIntersection';
import { cadMock } from '#test-utils/fixtures/cadModel';
import { createPointCloudMock } from '#test-utils/fixtures/pointCloud';

describe(getPointCloudInstanceFromIntersection.name, () => {
  const mockClassicIdEither: IdEither = { id: 123 };
  const mockDmsIdentifier: DMInstanceRef = { externalId: 'ext-id', space: 'space' };

  const pointCloudModelMock = createPointCloudMock({
    modelId: 456,
    revisionId: 789
  });

  const classicIntersection = createIntersectionWithVolumeMetadataMock<ClassicDataSourceType>(
    pointCloudModelMock,
    1,
    {
      assetRef: mockClassicIdEither,
      annotationId: 1
    }
  );

  const hybridIntersection = createIntersectionWithVolumeMetadataMock<ClassicDataSourceType>(
    pointCloudModelMock,
    2,
    {
      instanceRef: mockDmsIdentifier,
      annotationId: 2
    }
  );

  test('should return undefined when intersection is undefined', () => {
    const result = getPointCloudInstanceFromIntersection(undefined);
    expect(result).toEqual(undefined);
  });

  test('should return emptyResult when intersection type is not pointcloud', () => {
    const nonPointCloudIntersection: AnyIntersection = {
      type: 'cad',
      model: cadMock,
      point: new Vector3(0, 0, 0),
      treeIndex: 0,
      distanceToCamera: 0
    };

    const result = getPointCloudInstanceFromIntersection(nonPointCloudIntersection);
    expect(result).toEqual(undefined);
  });

  describe('pointcloud intersections', () => {
    test('should return classic model data when assetRef is IdEither and model is classic', () => {
      const result = getPointCloudInstanceFromIntersection(classicIntersection);

      expect(result).toEqual({
        classicModelIdentifier: classicIntersection.model.modelIdentifier,
        dmsModelUniqueIdentifier: undefined,
        instanceReference: mockClassicIdEither
      });
    });

    test('should return classic model data with DMS reference for hybrid intersection (instanceRef)', () => {
      const result = getPointCloudInstanceFromIntersection(hybridIntersection);

      expect(result).toEqual({
        classicModelIdentifier: hybridIntersection.model.modelIdentifier,
        dmsModelUniqueIdentifier: undefined,
        instanceReference: mockDmsIdentifier
      });
    });

    test('should return emptyResult when intersection has no volumeMetadata', () => {
      const intersectionNoVolume: PointCloudIntersection<ClassicDataSourceType> = {
        type: 'pointcloud',
        model: pointCloudModelMock,
        volumeMetadata: undefined,
        point: new Vector3(1, 2, 3),
        pointIndex: 0,
        distanceToCamera: 0,
        annotationId: 1
      };

      const result = getPointCloudInstanceFromIntersection(intersectionNoVolume);

      expect(result).toEqual(undefined);
    });
    test('should return emptyResult when no conditions are met', () => {
      const mockInvalidIntersection: PointCloudIntersection<ClassicDataSourceType> = {
        type: 'pointcloud',
        model: pointCloudModelMock,
        volumeMetadata: {
          annotationId: 1
        },
        point: new Vector3(1, 2, 3),
        pointIndex: 0,
        distanceToCamera: 0,
        annotationId: 1
      };

      const result = getPointCloudInstanceFromIntersection(mockInvalidIntersection);

      expect(result).toEqual(undefined);
    });
  });
});

function createIntersectionWithVolumeMetadataMock<T extends DataSourceType>(
  model: CognitePointCloudModel<T>,
  annotationId: number = 1,
  pointCloudVolumeMetadata: T['pointCloudVolumeMetadata']
): PointCloudIntersection<T> {
  return {
    type: 'pointcloud',
    model,
    point: new Vector3(1, 2, 3),
    pointIndex: 0,
    distanceToCamera: 0,
    annotationId,
    volumeMetadata: pointCloudVolumeMetadata
  };
}
