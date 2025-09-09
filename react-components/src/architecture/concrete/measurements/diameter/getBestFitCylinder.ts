import { bestFitCylinder } from '../../../base/utilities/cylinderFit/bestFitCylinder';
import { Cylinder } from '../../../base/utilities/primitives/Cylinder';
import { type LeastSquareCylinderResult } from '../../../base/utilities/cylinderFit/LeastSquareCylinderResult';
import { type PointCloudIntersection } from '@cognite/reveal';
import { Vector3 } from 'three';

const MIN_POINTS_FOR_FIT = 10;
const MAX_RMS = 0.05;
const MIN_ANGULAR_COVERAGE = 0.2;
const MAX_RELATIVE_RADIUS = 2;
const MAX_DISTANCE_BEHIND = 1;
const MAX_DISTANCE_FRONT = -0.5;

export function getBestFitCylinder(
  cameraPosition: Vector3,
  markerRadius: number,
  intersection: PointCloudIntersection
): LeastSquareCylinderResult | undefined {
  const pointCloud = intersection.model;
  const minPoint = intersection.point.clone();
  const maxPoint = intersection.point.clone();
  const direction = new Vector3().subVectors(intersection.point, cameraPosition).normalize();

  minPoint.addScaledVector(direction, MAX_DISTANCE_BEHIND * markerRadius); // Behind the point
  maxPoint.addScaledVector(direction, MAX_DISTANCE_FRONT * markerRadius); // In front of the point

  const boundingCylinder = new Cylinder();
  boundingCylinder.centerA.copy(minPoint);
  boundingCylinder.centerB.copy(maxPoint);
  boundingCylinder.radius = markerRadius;

  const box = boundingCylinder.getBoundingBox();
  const points = pointCloud.getPointsByBoundingBox(box);
  if (points.length < MIN_POINTS_FOR_FIT) {
    return undefined;
  }
  const filteredPoints = boundingCylinder.getPointsInside(points);
  if (filteredPoints.length < MIN_POINTS_FOR_FIT) {
    return undefined;
  }
  const acceptCylinder = (cylinder: LeastSquareCylinderResult): boolean => {
    return (
      cylinder.rms < MAX_RMS &&
      cylinder.radius < MAX_RELATIVE_RADIUS * markerRadius &&
      cylinder.angularCoverage > MIN_ANGULAR_COVERAGE
    );
  };
  return bestFitCylinder(filteredPoints, acceptCylinder);
}
