/*!
 * Copyright 2024 Cognite AS
 */

import { CognitePointCloudModel, type Cognite3DViewer } from '@cognite/reveal';
import {
  type AnnotationsBox,
  type AnnotationsCylinder,
  type AnnotationsCogniteAnnotationTypesPrimitivesGeometry3DGeometry as AnnotationGeometry
} from '@cognite/sdk';

import { CYLINDER_RADIUS_MARGIN } from '../utils/constants';
import { Matrix4, Quaternion, Vector3 } from 'three';

export const getGlobalMatrix = (args: {
  modelId: number;
  viewer: Cognite3DViewer;
}): Matrix4 | null => {
  const pointCloudModel = getCognitePointCloudModel(args.modelId, args.viewer);
  if (pointCloudModel === undefined) {
    return null;
  }
  return pointCloudModel.getCdfToDefaultModelTransformation();
};

function getCognitePointCloudModel(
  modelId: number,
  viewer: Cognite3DViewer
): CognitePointCloudModel | undefined {
  return viewer.models
    .filter((model) => model instanceof CognitePointCloudModel)
    .find((model) => model instanceof CognitePointCloudModel && model.modelId === modelId);
}

export function getAnnotationMatrixByGeometry(
  geometry: AnnotationGeometry,
  cylinderMargin = CYLINDER_RADIUS_MARGIN
): Matrix4 | undefined {
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

const UP_AXIS = new Vector3(0, 0, 1);

function getCylinderMatrix(cylinder: AnnotationsCylinder, margin: number): Matrix4 {
  // Calculate the center of the cylinder
  const centerA = new Vector3(...cylinder.centerA);
  const centerB = new Vector3(...cylinder.centerB);

  // Calculate the scale of the cylinder
  const radius = cylinder.radius * (1 + margin);
  const height = centerA.distanceTo(centerB);
  const scale = new Vector3(radius * 2, radius * 2, height);

  const center = new Vector3().addVectors(centerB, centerA).divideScalar(2);
  const axis = new Vector3().subVectors(centerB, centerA).normalize();

  // Use quaternion to rotate cylinder from default to target orientation
  const quaternion = new Quaternion();
  quaternion.setFromUnitVectors(UP_AXIS, axis);

  const matrix = new Matrix4();
  matrix.compose(center, quaternion, scale);
  return matrix;
}

export function getBoxMatrix(box: AnnotationsBox): Matrix4 {
  const matrix = new Matrix4();
  matrix.fromArray(box.matrix);
  matrix.transpose();
  return matrix;
}
