/*!
 * Copyright 2024 Cognite AS
 */

import { type LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { Wireframe } from 'three/examples/jsm/lines/Wireframe.js';

import { type AnnotationsCogniteAnnotationTypesPrimitivesGeometry3DGeometry as AnnotationGeometry } from '@cognite/sdk';

import { type PointCloudAnnotation } from '../utils/types';

import { getAnnotationGeometries } from '../utils/annotationGeometryUtils';
import { getAnnotationMatrixByGeometry } from './getMatrixUtils';
import { WireframeUserData } from './WireframeUserData';
import { Matrix4, Vector3 } from 'three';
import { BoxUtils } from '../../../base/utilities/geometry/BoxUtils';
import { CylinderUtils } from '../../../base/utilities/geometry/CylinderUtils';
import { PrimitiveUtils } from '../../../base/utilities/geometry/PrimitiveUtils';
import { type Status } from './Status';

export type CreateWireframeArgs = {
  annotations: PointCloudAnnotation[];
  globalMatrix: Matrix4;
  status: Status;
  selected: boolean;
  startIndex: number;
  groupSize?: number; // If undefined, take all annotations
};

export function createWireframeFromMultipleAnnotations(
  { annotations, globalMatrix, status, selected, startIndex, groupSize }: CreateWireframeArgs,
  material: LineMaterial
): Wireframe | undefined {
  if (annotations.length === 0) {
    return undefined;
  }
  const positions: number[] = [];
  const userData = new WireframeUserData(status, selected);
  const endIndex =
    groupSize === undefined
      ? annotations.length
      : Math.min(startIndex + groupSize, annotations.length);

  // Set the translation of the matrix to (0,0,0) and translate all points accordingly
  // In the end set the translation matrix equal this translation
  const translation = new Vector3();
  let translationMatrix: Matrix4 | undefined;

  for (let i = startIndex; i < endIndex; i++) {
    const annotation = annotations[i];
    for (const geometry of getAnnotationGeometries(annotation)) {
      const matrix = getAnnotationMatrixByGeometry(geometry);
      if (matrix === undefined) {
        continue;
      }
      const objectPositions = getObjectPositions(geometry);
      if (objectPositions === undefined) {
        continue;
      }
      matrix.premultiply(globalMatrix);
      if (translationMatrix === undefined) {
        translation.setFromMatrixPosition(matrix);
        translationMatrix = createTranslationMatrix(translation, -1);
      }
      matrix.premultiply(translationMatrix);
      addPositionsForObject(positions, objectPositions, matrix);
    }
    userData.add(annotation);
    if (groupSize !== undefined && userData.length >= groupSize) {
      break;
    }
  }
  const geometry = PrimitiveUtils.createLineSegmentsGeometryByPosition(positions);
  const wireframe = new Wireframe(geometry, material);
  translationMatrix = createTranslationMatrix(translation);
  wireframe.matrix = translationMatrix;
  wireframe.matrixAutoUpdate = false;
  wireframe.computeLineDistances();
  wireframe.userData = userData;
  return wireframe;
}

const CYLINDER_POSITIONS = CylinderUtils.createPositions();
const BOX_POSITIONS = BoxUtils.createPositions();

function getObjectPositions(geometry: AnnotationGeometry): number[] | undefined {
  if (geometry.box !== undefined) {
    return BOX_POSITIONS;
  } else if (geometry.cylinder !== undefined) {
    return CYLINDER_POSITIONS;
  } else {
    return undefined;
  }
}

function createTranslationMatrix(translation: Vector3, sign = 1): Matrix4 {
  return new Matrix4().makeTranslation(
    sign * translation.x,
    sign * translation.y,
    sign * translation.z
  );
}

function addPositionsForObject(
  positions: number[],
  objectPositions: number[],
  matrix: Matrix4
): void {
  const point = new Vector3();
  const additionalPositions = new Array<number>(objectPositions.length);
  for (let i = 0; i < objectPositions.length; i += 3) {
    const x = objectPositions[i];
    const y = objectPositions[i + 1];
    const z = objectPositions[i + 2];

    point.set(x, y, z);
    point.applyMatrix4(matrix);

    additionalPositions[i] = point.x;
    additionalPositions[i + 1] = point.y;
    additionalPositions[i + 2] = point.z;
  }
  positions.push(...additionalPositions);
}
