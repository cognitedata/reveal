/*!
 * Copyright 2024 Cognite AS
 */

import {
  type AnnotationsBoundingVolume,
  type AnnotationsCogniteAnnotationTypesPrimitivesGeometry3DGeometry as AnnotationGeometry,
  type AnnotationData
} from '@cognite/sdk';

import { type PointCloudAnnotation } from './types';

// This is a very weak type guard, but it's better than doing an `as` cast
// For mere info: https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards
export const isAnnotationsBoundingVolume = (
  annotationData: AnnotationData
): annotationData is AnnotationsBoundingVolume => {
  return 'region' in annotationData;
};

export function isSingleAnnotationGeometry(annotation: PointCloudAnnotation): boolean {
  return getSingleAnnotationGeometry(annotation) !== undefined;
}

export function hasAnnotationGeometry(annotation: PointCloudAnnotation): boolean {
  const volume = annotation.geometry;
  if (!isAnnotationsBoundingVolume(volume)) {
    return false;
  }
  return volume !== undefined && volume.region.length >= 1;
}

export function getSingleAnnotationGeometry(
  annotation: PointCloudAnnotation
): undefined | AnnotationGeometry {
  const volume = annotation.geometry;
  if (!isAnnotationsBoundingVolume(volume)) {
    return undefined;
  }
  if (volume === undefined || volume.region.length !== 1) return undefined;
  return volume.region[0];
}

export function getFirstAnnotationGeometry(
  annotation: PointCloudAnnotation
): undefined | AnnotationGeometry {
  const volume = annotation.geometry;
  if (!isAnnotationsBoundingVolume(volume)) {
    return undefined;
  }
  if (volume === undefined || volume.region.length === 0) return undefined;
  return volume.region[0];
}

export function* getAnnotationGeometries(
  annotation: PointCloudAnnotation
): Generator<AnnotationGeometry> {
  const volume = annotation.geometry;
  if (!isAnnotationsBoundingVolume(volume)) {
    return undefined;
  }
  if (volume === undefined || volume.region.length === 0) return;
  for (const geometry of volume.region) {
    yield geometry;
  }
}
