/*!
 * Copyright 2024 Cognite AS
 */

import { type Matrix4, type Ray, Vector3 } from 'three';
import { ClosestGeometryFinder } from '../../../base/utilities/geometry/ClosestGeometryFinder';
import { BoxUtils } from '../../../base/utilities/primitives/BoxUtils';
import { type Annotation } from './Annotation';
import { Box } from '../../../base/utilities/primitives/Box';
import { Cylinder } from '../../../base/utilities/primitives/Cylinder';
import { type Primitive } from '../../../base/utilities/primitives/Primitive';

export function getClosestAnnotation(
  annotations: Generator<Annotation>,
  globalMatrix: Matrix4,
  ray: Ray
): ClosestGeometryFinder<AnnotationIntersectInfo> {
  const closestFinder = new ClosestGeometryFinder<AnnotationIntersectInfo>(ray.origin);

  for (const annotation of annotations) {
    for (const primitive of annotation.primitives) {
      const point = getIntersectionPoint(primitive, globalMatrix, ray);
      if (point === null) {
        continue;
      }
      const closest = closestFinder.getClosestGeometry();

      const isOverlappingWithClosestGeometry = (): boolean => {
        if (closest === undefined) {
          return false;
        }
        return (
          isPointInside(point, closest.primitive, globalMatrix) ||
          isPointInside(closest.point, primitive, globalMatrix)
        );
      };
      if (closest === undefined || !isOverlappingWithClosestGeometry()) {
        closestFinder.addLazy(
          point,
          () => new AnnotationIntersectInfo(annotation, primitive, point)
        );
        continue;
      }
      if (closest.volume === undefined) {
        closest.volume = closest.primitive.volume; // Optimization, lazy calculation
      }
      const volume = primitive.volume;
      if (volume > closest.volume) {
        continue; // Select the one with the smallest volume
      }
      closestFinder.clear();
      const info = new AnnotationIntersectInfo(annotation, primitive, point);
      info.volume = volume;
      closestFinder.add(point, info);
    }
  }
  return closestFinder;
}

function getIntersectionPoint(
  primitive: Primitive,
  globalMatrix: Matrix4,
  ray: Ray
): Vector3 | null {
  if (primitive instanceof Box) {
    return intersectBox(primitive, globalMatrix, ray);
  }
  if (primitive instanceof Cylinder) {
    return intersectCylinder(primitive, globalMatrix, ray);
  }
  return null;
}

function intersectBox(box: Box, globalMatrix: Matrix4, ray: Ray): Vector3 | null {
  const matrix = box.getMatrix();
  matrix.premultiply(globalMatrix);
  const orientedBox = BoxUtils.createOrientedBox(matrix);
  return orientedBox.intersectRay(ray, new Vector3());
}

function intersectCylinder(cylinder: Cylinder, globalMatrix: Matrix4, ray: Ray): Vector3 | null {
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

function isPointInside(point: Vector3, primitive: Primitive, globalMatrix: Matrix4): boolean {
  if (primitive instanceof Box) {
    return isInsideBox(point, primitive, globalMatrix);
  }
  if (primitive instanceof Cylinder) {
    return isInsideCylinder(point, primitive, globalMatrix);
  }
  return false;
}

function isInsideCylinder(point: Vector3, cylinder: Cylinder, globalMatrix: Matrix4): boolean {
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

function isInsideBox(point: Vector3, box: Box, globalMatrix: Matrix4): boolean {
  const matrix = box.getMatrix();
  matrix.premultiply(globalMatrix);
  const orientedBox = BoxUtils.createOrientedBox(matrix);
  return orientedBox.containsPoint(point);
}

function getCylinderCenters(
  cylinder: Cylinder,
  globalMatrix: Matrix4
): { centerA: Vector3; centerB: Vector3 } {
  const centerA = cylinder.centerA.clone();
  const centerB = cylinder.centerB.clone();
  centerA.applyMatrix4(globalMatrix);
  centerB.applyMatrix4(globalMatrix);
  return { centerA, centerB };
}

export class AnnotationIntersectInfo {
  public annotation: Annotation;
  public primitive: Primitive;
  public point: Vector3;
  public volume: number | undefined = undefined;

  constructor(annotation: Annotation, primitive: Primitive, point: Vector3) {
    this.annotation = annotation;
    this.primitive = primitive;
    this.point = point;
  }
}
