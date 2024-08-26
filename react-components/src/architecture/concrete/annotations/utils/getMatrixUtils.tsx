/*!
 * Copyright 2024 Cognite AS
 */

import * as THREE from 'three';

import { type Cognite3DViewer } from '@cognite/reveal';
import {
  type AnnotationsBox,
  type AnnotationsCylinder,
  type AnnotationsCogniteAnnotationTypesPrimitivesGeometry3DGeometry as AnnotationGeometry
} from '@cognite/sdk';

import { ANNOTATION_CYLINDER_RADIUS_MARGIN } from './constants';
import { getCognitePointCloudModel } from './getCognitePointCloudModel';

export const getGlobalMatrix = (args: {
  modelId: number;
  viewer: Cognite3DViewer;
}): THREE.Matrix4 | null => {
  const pointCloudModel = getCognitePointCloudModel(args);
  if (pointCloudModel === undefined) {
    return null;
  }
  return pointCloudModel.getCdfToDefaultModelTransformation();
};

export function getAnnotationMatrixByGeometry(
  geometry: AnnotationGeometry,
  cylinderMargin = ANNOTATION_CYLINDER_RADIUS_MARGIN
): THREE.Matrix4 | undefined {
  if (geometry.box !== undefined) {
    const box = geometry.box;
    return getBoxMatrix(box);
  } else if (geometry.cylinder !== undefined) {
    const cylinder = geometry.cylinder;
    return getCylinderMatrix(cylinder, cylinderMargin);
  } else {
    return undefined;
  }
}

const UP_AXIS = new THREE.Vector3(0, 1, 0);

function getCylinderMatrix(cylinder: AnnotationsCylinder, margin: number): THREE.Matrix4 {
  // Calculate the center of the cylinder
  const centerA = new THREE.Vector3(...cylinder.centerA);
  const centerB = new THREE.Vector3(...cylinder.centerB);

  const center = centerB.clone();
  center.add(centerA);
  center.multiplyScalar(0.5);

  // Calculate the axis of the cylinder
  const axis = centerB.clone();
  axis.sub(centerA);
  axis.normalize();

  // Calculate the scale of the cylinder
  const radius = cylinder.radius * (1 + margin);
  const height = centerA.distanceTo(centerB);
  const scale = new THREE.Vector3(radius, height, radius);

  // Use quaternion to rotate cylinder from default to target orientation
  const quaternion = new THREE.Quaternion();
  quaternion.setFromUnitVectors(UP_AXIS, axis);

  const matrix = new THREE.Matrix4();
  matrix.compose(center, quaternion, scale);
  return matrix;
}

export function getBoxMatrix(box: AnnotationsBox): THREE.Matrix4 {
  const matrix = new THREE.Matrix4();
  matrix.fromArray(box.matrix);
  matrix.transpose();
  return matrix;
}
