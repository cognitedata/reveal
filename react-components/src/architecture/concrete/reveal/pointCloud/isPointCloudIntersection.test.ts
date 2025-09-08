import { describe, expect, test } from 'vitest';
import { isPointCloudIntersection } from './isPointCloudIntersection';
import { type AnyIntersection, type PointCloudIntersection } from '@cognite/reveal';
import { Vector3 } from 'three';
import { createPointCloudMock } from '../../../../../tests/tests-utilities/fixtures/pointCloud';
import { createCadMock } from '../../../../../tests/tests-utilities/fixtures/cadModel';

describe(isPointCloudIntersection.name, () => {
  test('should return true for valid PointCloudIntersection', () => {
    const mockPointCloudIntersection: PointCloudIntersection = {
      type: 'pointcloud',
      point: new Vector3(1, 2, 3),
      pointIndex: 123,
      distanceToCamera: 42,
      model: createPointCloudMock(),
      annotationId: 456
    } satisfies PointCloudIntersection;

    const result = isPointCloudIntersection(mockPointCloudIntersection);
    expect(result).toBe(true);
  });

  test('should return false for undefined intersection', () => {
    const result = isPointCloudIntersection(undefined);
    expect(result).toBe(false);
  });

  test('should return false for intersection with different type', () => {
    const mockCadIntersection = {
      type: 'cad',
      point: new Vector3(1, 2, 3),
      model: createCadMock(),
      treeIndex: 1,
      distanceToCamera: 42
    } satisfies AnyIntersection;

    const result = isPointCloudIntersection(mockCadIntersection);
    expect(result).toBe(false);
  });
});
