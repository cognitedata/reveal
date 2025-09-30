import { describe, expect, test } from 'vitest';
import { getBestFitCylinderByIntersection } from './getBestFitCylinderByIntersection';
import { Matrix4, Vector3 } from 'three';
import { type PointCloudIntersection } from '@cognite/reveal';
import { LeastSquareCylinderResult } from '../../../base/utilities/cylinderFit/LeastSquareCylinderResult';
import { createPointCloudMock } from '#test-utils/fixtures/pointCloud';
import {
  checkCorrectness,
  createPoints
} from '../../../base/utilities/cylinderFit/bestFitCylinder.test';
import { Random } from '../../../base/utilities/misc/Random';

describe(getBestFitCylinderByIntersection.name, () => {
  test('Should get cylinder only if many points and marker radius is large', () => {
    // Number ogf points are the points in the point cloud that can be used for the fit
    for (const pointCount of [5, 100]) {
      // Marker fraction is the fraction of the actual radius of the expected cylinder
      for (const markerFraction of [3, 1, 0.5, 0.1, 0.01]) {
        const expectCylinder = markerFraction >= 1 && pointCount >= 10;
        testCylinder(markerFraction, pointCount, expectCylinder);
      }
    }
  });
});

function testCylinder(markerFraction: number, pointCount: number, expectCylinder: boolean): void {
  const { intersection, expectedCylinder, cameraPosition } =
    createPointCloudIntersectionWithCylinder(pointCount);

  const actualCylinder = getBestFitCylinderByIntersection(
    intersection,
    cameraPosition,
    expectedCylinder.radius * markerFraction
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

export function createPointCloudIntersectionWithCylinder(pointCount: number): {
  intersection: PointCloudIntersection;
  expectedCylinder: LeastSquareCylinderResult;
  cameraPosition: Vector3;
} {
  // Create the cylinder
  const expectedCylinder = new LeastSquareCylinderResult(
    new Vector3(0, 0, 0),
    new Vector3(0, 0, 1),
    1,
    2
  );
  // Create the intersection point on the cylinder surface
  const intersectionPosition = new Vector3(1, 1, 0)
    .normalize()
    .multiplyScalar(expectedCylinder.radius)
    .add(expectedCylinder.center);

  // Create the camera position some distance to the intersection point
  const cameraPosition = new Vector3(1, 1, 0)
    .normalize()
    .multiplyScalar(expectedCylinder.radius * 10)
    .add(expectedCylinder.center);

  // Create the point cloud
  const pointCloud = createPointCloudMock();

  const modelTransformation = new Matrix4().setPosition(10, 20, 30);
  const inverseModelTransformation = modelTransformation.clone().invert();

  const random = new Random(42);
  const points = createPoints(expectedCylinder, pointCount, random, 0, 1);
  for (const point of points) {
    point.applyMatrix4(inverseModelTransformation);
  }
  pointCloud.setModelTransformation(modelTransformation);
  pointCloud.getPointsByBoundingBox = () => points;

  // Create the intersection object
  const intersection: PointCloudIntersection = {
    type: 'pointcloud',
    point: intersectionPosition,
    pointIndex: 0,
    distanceToCamera: intersectionPosition.distanceTo(cameraPosition),
    model: pointCloud,
    annotationId: 0
  };
  return { intersection, expectedCylinder, cameraPosition };
}
