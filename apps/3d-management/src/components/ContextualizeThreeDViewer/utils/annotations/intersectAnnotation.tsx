import { Matrix4, Ray, Vector3 } from 'three';
import { OBB } from 'three/examples/jsm/math/OBB';

import {
  AnnotationModel,
  AnnotationsBoundingVolume,
  AnnotationsBox,
  AnnotationsCylinder,
} from '@cognite/sdk';

function isAnnotationBoundingVolume(
  annotation: AnnotationModel
): annotation is AnnotationModel & { data: AnnotationsBoundingVolume } {
  const annotationBoundingVolumeData =
    annotation.data as AnnotationsBoundingVolume;
  return annotationBoundingVolumeData.region !== undefined;
}

export function intersectAnnotation(
  annotation: AnnotationModel,
  transformation: Matrix4,
  ray: Ray
): Vector3[] {
  if (!isAnnotationBoundingVolume(annotation)) return [];

  const annotationBoundingVolumeData = annotation.data;

  const intersections = annotationBoundingVolumeData.region
    .map((region) => {
      if (region.box !== undefined) {
        const box = region.box;
        return intersectBoxRegion(box, transformation, ray);
      }

      if (region.cylinder !== undefined) {
        const cylinder = region.cylinder;
        return intersectCylinderRegion(cylinder, transformation, ray);
      }

      return null;
    })
    .filter(
      (intersectionPoint): intersectionPoint is Vector3 =>
        intersectionPoint !== null
    );

  return intersections;
}

function intersectBoxRegion(
  box: AnnotationsBox,
  matrix: Matrix4,
  ray: Ray
): Vector3 | null {
  const orientedBox = new OBB(new Vector3(), new Vector3(1, 1, 1));
  const boxMatrix = new Matrix4().fromArray(box.matrix).transpose();
  const actualMatrix = matrix.clone().multiply(boxMatrix);
  orientedBox.applyMatrix4(actualMatrix);
  return orientedBox.intersectRay(ray, new Vector3());
}

function intersectCylinderRegion(
  cylinder: AnnotationsCylinder,
  transformation: Matrix4,
  ray: Ray
): Vector3 | null {
  const [xCenterA, yCenterA, zCenterA] = cylinder.centerA;
  const centerA = new Vector3(xCenterA, yCenterA, zCenterA);

  const [xCenterB, yCenterB, zCenterB] = cylinder.centerB;
  const centerB = new Vector3(xCenterB, yCenterB, zCenterB);

  // Apply transformation to the cylinder
  centerA.applyMatrix4(transformation);
  centerB.applyMatrix4(transformation);

  const radius = cylinder.radius;

  const cylinderIntersections = intersectRayCylinder(
    ray.origin,
    ray.direction,
    centerA,
    centerB,
    radius
  );

  return cylinderIntersections;
}

function intersectRayCylinder(
  rayOrigin: Vector3,
  rayDirection: Vector3,
  centerA: Vector3,
  centerB: Vector3,
  radius: number
): Vector3 | null {
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
    return new Vector3().addVectors(
      rayOrigin,
      rayDirection.clone().multiplyScalar(t)
    );
  }

  // caps
  const t2 = ((y < 0.0 ? 0.0 : baba) - baoc) / bard;
  if (Math.abs(k1 + k2 * t2) < sqrtH) {
    return new Vector3().addVectors(
      rayOrigin,
      rayDirection.clone().multiplyScalar(t2)
    );
  }

  return null;
}
