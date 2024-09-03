/*!
 * Copyright 2024 Cognite AS
 */

import { type Matrix4, type Ray, Vector3 } from 'three';
import {
  type AnnotationsBox,
  type AnnotationsCylinder,
  type AnnotationsCogniteAnnotationTypesPrimitivesGeometry3DGeometry as AnnotationGeometry
} from '@cognite/sdk';
import { type PointCloudAnnotation } from './types';
import { getAnnotationGeometries } from './annotationGeometryUtils';
import { getBoxMatrix } from './getMatrixUtils';
import { ClosestGeometryFinder } from '../../../base/utilities/geometry/ClosestGeometryFinder';
import { createOrientedBox } from '../../../base/utilities/box/createBoxGeometry';

export function getClosestAnnotation(
  annotations: Generator<PointCloudAnnotation>,
  globalMatrix: Matrix4,
  ray: Ray
): ClosestGeometryFinder<AnnotationIntersectInfo> {
  const closestFinder = new ClosestGeometryFinder<AnnotationIntersectInfo>(ray.origin);

  for (const annotation of annotations) {
    for (const geometry of getAnnotationGeometries(annotation)) {
      const point = getIntersectionPoint(geometry, globalMatrix, ray);
      if (point === null) {
        continue;
      }
      const closest = closestFinder.getClosestGeometry();

      const isOverlappingWithClosestGeometry = (): boolean => {
        if (closest === undefined) {
          return false;
        }
        return (
          isPointInside(point, closest.geometry, globalMatrix) ||
          isPointInside(closest.point, geometry, globalMatrix)
        );
      };
      if (closest === undefined || !isOverlappingWithClosestGeometry()) {
        closestFinder.addLazy(
          point,
          () => new AnnotationIntersectInfo(annotation, geometry, point)
        );
        continue;
      }
      if (closest.volume === undefined) {
        closest.volume = getVolume(closest.geometry, globalMatrix); // Optimization, lazy calculation
      }
      const volume = getVolume(geometry, globalMatrix);
      if (volume > closest.volume) {
        continue; // Select the one with the smallest volume
      }
      closestFinder.clear();
      const info = new AnnotationIntersectInfo(annotation, geometry, point);
      info.volume = volume;
      closestFinder.add(point, info);
    }
  }
  return closestFinder;
}

function getIntersectionPoint(
  geometry: AnnotationGeometry,
  globalMatrix: Matrix4,
  ray: Ray
): Vector3 | null {
  if (geometry.box !== undefined) {
    return intersectBoxRegion(geometry.box, globalMatrix, ray);
  }
  if (geometry.cylinder !== undefined) {
    return intersectCylinderRegion(geometry.cylinder, globalMatrix, ray);
  }
  return null;
}

function intersectBoxRegion(box: AnnotationsBox, globalMatrix: Matrix4, ray: Ray): Vector3 | null {
  const matrix = getBoxMatrix(box);
  matrix.premultiply(globalMatrix);
  const orientedBox = createOrientedBox();
  orientedBox.applyMatrix4(matrix);
  return orientedBox.intersectRay(ray, new Vector3());
}

function intersectCylinderRegion(
  cylinder: AnnotationsCylinder,
  globalMatrix: Matrix4,
  ray: Ray
): Vector3 | null {
  const { centerA, centerB } = getCylinderCenters(cylinder, globalMatrix);
  return intersectRayCylinder(ray, centerA, centerB, cylinder.radius);
}

export function intersectRayCylinder(
  ray: Ray,
  centerA: Vector3,
  centerB: Vector3,
  radius: number
): Vector3 | null {
  const rayOrigin = ray.origin;
  const rayDirection = ray.direction;
  const ba = new Vector3().subVectors(centerB, centerA);
  const oc = new Vector3().subVectors(rayOrigin, centerA);
  const baba = ba.dot(ba);
  const bard = ba.dot(rayDirection);
  const baoc = ba.dot(oc);
  const k2 = baba - bard * bard;
  const k1 = baba * oc.dot(rayDirection) - baoc * bard;
  const k0 = baba * oc.dot(oc) - baoc * baoc - radius * radius * baba;
  const discriminant = k1 * k1 - k2 * k0;

  if (discriminant < 0.0) return null;

  const sqrtH = Math.sqrt(discriminant);
  const t = (-k1 - sqrtH) / k2;

  // body
  const y = baoc + t * bard;
  if (y > 0.0 && y < baba) {
    return new Vector3().addVectors(rayOrigin, rayDirection.clone().multiplyScalar(t));
  }

  // caps
  const t2 = ((y < 0.0 ? 0.0 : baba) - baoc) / bard;
  if (Math.abs(k1 + k2 * t2) < sqrtH) {
    return new Vector3().addVectors(rayOrigin, rayDirection.clone().multiplyScalar(t2));
  }
  return null;
}

function isPointInside(
  point: Vector3,
  geometry: AnnotationGeometry,
  globalMatrix: Matrix4
): boolean {
  if (geometry.box !== undefined) {
    return isInsidePointBoxRegion(point, geometry.box, globalMatrix);
  }
  if (geometry.cylinder !== undefined) {
    return isInsideCylinderRegion(point, geometry.cylinder, globalMatrix);
  }
  return false;
}

function isInsideCylinderRegion(
  point: Vector3,
  cylinder: AnnotationsCylinder,
  globalMatrix: Matrix4
): boolean {
  const { centerA, centerB } = getCylinderCenters(cylinder, globalMatrix);
  const center = new Vector3().addVectors(centerA, centerB).divideScalar(2);
  const vector = centerB.sub(centerA);
  const diff = center.sub(point);
  const dot = vector.dot(diff);
  vector.multiplyScalar(dot);
  vector.sub(diff);

  const distanceToAxis = vector.length();
  return distanceToAxis <= cylinder.radius;
}

function isInsidePointBoxRegion(
  point: Vector3,
  box: AnnotationsBox,
  globalMatrix: Matrix4
): boolean {
  const matrix = getBoxMatrix(box);
  matrix.premultiply(globalMatrix);
  const orientedBox = createOrientedBox();
  orientedBox.applyMatrix4(matrix);
  return orientedBox.containsPoint(point);
}

function getVolume(geometry: AnnotationGeometry, globalMatrix: Matrix4): number {
  if (geometry.box !== undefined) {
    return getBoxRegionVolume(geometry.box, globalMatrix);
  }
  if (geometry.cylinder !== undefined) {
    return getCylinderRegionVolume(geometry.cylinder, globalMatrix);
  }
  return 0;
}

function getBoxRegionVolume(box: AnnotationsBox, globalMatrix: Matrix4): number {
  const matrix = getBoxMatrix(box);
  matrix.premultiply(globalMatrix);
  const obb = createOrientedBox();
  obb.applyMatrix4(matrix);
  return 8 * obb.halfSize.x * obb.halfSize.y * obb.halfSize.z;
}

function getCylinderRegionVolume(cylinder: AnnotationsCylinder, globalMatrix: Matrix4): number {
  const { centerA, centerB } = getCylinderCenters(cylinder, globalMatrix);
  const h = centerA.distanceTo(centerB);
  return Math.PI * cylinder.radius * cylinder.radius * h;
}

function getCylinderCenters(
  cylinder: AnnotationsCylinder,
  globalMatrix: Matrix4
): { centerA: Vector3; centerB: Vector3 } {
  const centerA = new Vector3(...cylinder.centerA);
  const centerB = new Vector3(...cylinder.centerB);
  centerA.applyMatrix4(globalMatrix);
  centerB.applyMatrix4(globalMatrix);
  return { centerA, centerB };
}

export class AnnotationIntersectInfo {
  public annotation: PointCloudAnnotation;
  public geometry: AnnotationGeometry;
  public point: Vector3;
  public volume: number | undefined = undefined;

  constructor(annotation: PointCloudAnnotation, geometry: AnnotationGeometry, point: Vector3) {
    this.annotation = annotation;
    this.geometry = geometry;
    this.point = point;
  }
}
