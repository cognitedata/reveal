import { AnnotationModel, AnnotationsBoundingVolume } from '@cognite/sdk';

import {
  createBoxAnnotationAsBox3,
  createCylinderAnnotationAsBox3,
} from './annotationUtils';

const isAnnotationsBoundingVolume = (
  data: AnnotationModel['data']
): data is AnnotationsBoundingVolume => {
  return (
    data !== undefined &&
    'region' in data &&
    data.region !== undefined &&
    Array.isArray(data.region)
  );
};

export const getAnnotationAsBox3 = (
  annotation: AnnotationModel,
  matrix: THREE.Matrix4
): THREE.Box3 | undefined => {
  if (!isAnnotationsBoundingVolume(annotation.data)) return undefined;
  const data = annotation.data;

  // TODO: In the future we could support more than one region.
  const region = data.region[0];

  if (region.box !== undefined) {
    const box = region.box;
    return createBoxAnnotationAsBox3({ box, matrix });
  }

  if (region.cylinder !== undefined) {
    const cylinder = region.cylinder;
    return createCylinderAnnotationAsBox3(cylinder, matrix);
  }

  throw new Error(`Unsupported region type: ${JSON.stringify(region)}`);
};
