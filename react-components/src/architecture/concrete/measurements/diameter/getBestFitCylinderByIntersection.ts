import { bestFitCylinder } from '../../../base/utilities/cylinderFit/bestFitCylinder';
import { Cylinder } from '../../../base/utilities/primitives/Cylinder';
import { type LeastSquareCylinderResult } from '../../../base/utilities/cylinderFit/LeastSquareCylinderResult';
import { type PointCloudIntersection } from '@cognite/reveal';
import { Vector3 } from 'three';

const MIN_POINTS_FOR_FIT = 10;
const MAX_RMS = 0.075;
const MIN_ANGULAR_COVERAGE = 0.2;
const MAX_RELATIVE_RADIUS = 2;
const MAX_DISTANCE_BEHIND = 1.5;
const MAX_DISTANCE_FRONT = -0.5;

/**
 * Computes the best-fit cylinder for a set of points near a given intersection in a point cloud.
 *
 * This function determines a region around the intersection point, collects nearby points,
 * and attempts to fit a cylinder using a least-squares approach. The fit is validated against
 * several criteria such as RMS error, relative radius, and angular coverage.
 *
 * The region is defined by a bounding cylinder that extends both in front of and behind the intersection point
 *
 * @param intersection - The intersection information containing the point and associated point cloud model.
 * @param cameraPosition - The position of the camera, used to determine the direction for the cylinder.
 * @param markerRadius - The radius used to define the region of interest and the initial bounding cylinder.
 * @returns The result of the least-squares cylinder fit if a valid cylinder is found; otherwise, `undefined`.
 */
export function getBestFitCylinderByIntersection(
  intersection: PointCloudIntersection,
  cameraPosition: Vector3,
  markerRadius: number
): LeastSquareCylinderResult | undefined {
  const pointCloud = intersection.model;

  const centerA = intersection.point.clone();
  const centerB = intersection.point.clone();
  const direction = new Vector3().subVectors(intersection.point, cameraPosition).normalize();

  centerA.addScaledVector(direction, MAX_DISTANCE_BEHIND * markerRadius); // Behind the point
  centerB.addScaledVector(direction, MAX_DISTANCE_FRONT * markerRadius); // In front of the point

  const boundingCylinder = new Cylinder();
  boundingCylinder.centerA.copy(centerA);
  boundingCylinder.centerB.copy(centerB);
  boundingCylinder.radius = markerRadius;

  const modelMatrix = pointCloud.getModelTransformation();
  const inverseModelMatrix = modelMatrix.clone().invert();
  boundingCylinder.applyMatrix4(inverseModelMatrix);

  const box = boundingCylinder.getBoundingBox();
  const points = pointCloud.getPointsByBoundingBox(box);

  if (points.length < MIN_POINTS_FOR_FIT) {
    return undefined;
  }
  const filteredPoints = boundingCylinder.getPointsInside(points);
  if (filteredPoints.length < MIN_POINTS_FOR_FIT) {
    return undefined;
  }
  for (const point of filteredPoints) {
    point.applyMatrix4(modelMatrix);
  }
  const acceptCylinder = (cylinder: LeastSquareCylinderResult): boolean => {
    const accepted =
      cylinder.rms < MAX_RMS &&
      cylinder.radius < MAX_RELATIVE_RADIUS * markerRadius &&
      cylinder.angularCoverage > MIN_ANGULAR_COVERAGE;
    return accepted; // Want to have it like this because it is easier to debug
  };
  return bestFitCylinder(filteredPoints, acceptCylinder);
}
