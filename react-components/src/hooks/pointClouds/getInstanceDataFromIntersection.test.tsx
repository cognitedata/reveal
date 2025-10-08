import { describe, expect, test } from 'vitest';
import { type IdEither } from '@cognite/sdk';
import {
  type AnyIntersection,
  type ClassicDataSourceType,
  type DMInstanceRef,
  type PointCloudIntersection,
  type DMDataSourceType
} from '@cognite/reveal';
import { Vector3 } from 'three';
import { getInstanceDataFromIntersection } from './getInstanceDataFromIntersection';
import { cadMock } from '#test-utils/fixtures/cadModel';
import { createPointCloudDMMock, createPointCloudMock } from '#test-utils/fixtures/pointCloud';

describe(getInstanceDataFromIntersection.name, () => {
  const mockClassicIdEither: IdEither = { id: 123 };
  const mockDmsIdentifier: DMInstanceRef = { externalId: 'ext-id', space: 'space' };
  const mockDmsIdentifier2: DMInstanceRef = { externalId: 'ext-id-2', space: 'space-2' };

  const pointCloudModelMock = createPointCloudMock({
    modelId: 456,
    revisionId: 789
  });

  const pointCloudDMMock = createPointCloudDMMock({
    revisionExternalId: 'revision-ext-id',
    revisionSpace: 'test-space'
  });

  // Create test data that the real type guards will recognize
  const classicIntersection: PointCloudIntersection<ClassicDataSourceType> = {
    type: 'pointcloud',
    model: pointCloudModelMock,
    volumeMetadata: {
      assetRef: mockClassicIdEither,
      annotationId: 1
    },
    point: new Vector3(1, 2, 3),
    pointIndex: 0,
    distanceToCamera: 0,
    annotationId: 1
  };

  const hybridIntersection: PointCloudIntersection<ClassicDataSourceType> = {
    type: 'pointcloud',
    model: pointCloudModelMock,
    volumeMetadata: {
      instanceRef: mockDmsIdentifier,
      annotationId: 2
    },
    point: new Vector3(1, 2, 3),
    pointIndex: 0,
    distanceToCamera: 0,
    annotationId: 2
  };

  const dmsIntersection: PointCloudIntersection<DMDataSourceType> = {
    type: 'pointcloud',
    model: pointCloudDMMock,
    volumeMetadata: {
      assetRef: mockDmsIdentifier,
      volumeInstanceRef: mockDmsIdentifier2
    },
    point: new Vector3(1, 2, 3),
    pointIndex: 0,
    distanceToCamera: 0,
    annotationId: 3
  };

  test('should return undefined when intersection is undefined', () => {
    const result = getInstanceDataFromIntersection(undefined);
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

    const result = getInstanceDataFromIntersection(nonPointCloudIntersection);
    expect(result).toEqual(undefined);
  });

  describe('pointcloud intersections', () => {
    test('should return classic model data when assetRef is IdEither and model is classic', () => {
      const result = getInstanceDataFromIntersection(classicIntersection);

      expect(result).toEqual({
        classicModelIdentifier: classicIntersection.model.modelIdentifier,
        dmsModelUniqueIdentifier: undefined,
        reference: mockClassicIdEither
      });
    });

    test('should return DMS model data when assetRef is DMS instance and model is DM', () => {
      const result = getInstanceDataFromIntersection(dmsIntersection);

      expect(result).toEqual({
        classicModelIdentifier: undefined,
        dmsModelUniqueIdentifier: dmsIntersection.model.modelIdentifier,
        reference: mockDmsIdentifier
      });
    });

    test('should return classic model data with DMS reference for hybrid intersection (instanceRef)', () => {
      const result = getInstanceDataFromIntersection(hybridIntersection);

      expect(result).toEqual({
        classicModelIdentifier: hybridIntersection.model.modelIdentifier,
        dmsModelUniqueIdentifier: undefined,
        reference: mockDmsIdentifier
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

      const result = getInstanceDataFromIntersection(intersectionNoVolume);

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

      const result = getInstanceDataFromIntersection(mockInvalidIntersection);

      expect(result).toEqual(undefined);
    });
  });
});
