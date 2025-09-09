import { describe, expect, test } from 'vitest';
import { getBestFitCylinder } from './getBestFitCylinder';
import { Vector3 } from 'three';
import { type PointCloudIntersection } from '@cognite/reveal';
import { createPointCloudMock } from '../../../../../tests/tests-utilities/fixtures/pointCloud';
import { LeastSquareCylinderResult } from '../../../base/utilities/cylinderFit/LeastSquareCylinderResult';
import {
  checkCorrectness,
  createPoints
} from '../../../base/utilities/cylinderFit/bestFitCylinder.test';
import { Random } from '../../../base/utilities/misc/Random';

describe(getBestFitCylinder.name, () => {
  test('Should have typename', () => {
    testCylinder(3, true);
    testCylinder(1, true);
    testCylinder(0.5, false);
    testCylinder(0.1, false);
    testCylinder(0.01, false);
  });
});

function testCylinder(markerFraction: number, expectCylinder: boolean): void {
  const expectedCylinder = new LeastSquareCylinderResult(
    new Vector3(0, 0, 0),
    new Vector3(0, 0, 1),
    1,
    2
  );
  const random = new Random(42);
  const points = createPoints(expectedCylinder, 100, random, 0, 1);
  const pointCloud = createPointCloudMock();
  pointCloud.getPointsByBoundingBox = () => points;

  const point = new Vector3(1, 1, 0);
  point.normalize().multiplyScalar(expectedCylinder.radius).add(expectedCylinder.center);
  const cameraPosition = new Vector3(1, 1, 0);

  cameraPosition
    .normalize()
    .multiplyScalar(expectedCylinder.radius * 10)
    .add(expectedCylinder.center);

  const intersection: PointCloudIntersection = {
    type: 'pointcloud',
    point,
    pointIndex: 0,
    distanceToCamera: point.distanceTo(cameraPosition),
    model: pointCloud,
    annotationId: 0
  };
  const actualCylinder = getBestFitCylinder(
    cameraPosition,
    expectedCylinder.radius * markerFraction,
    intersection
  );
  if (actualCylinder !== undefined) {
    actualCylinder.height = expectedCylinder.height; // Ignore the height
  }
  if (expectCylinder) {
    checkCorrectness(actualCylinder, expectedCylinder, 0.1);
  } else {
    expect(actualCylinder).toBeUndefined();
  }
}
