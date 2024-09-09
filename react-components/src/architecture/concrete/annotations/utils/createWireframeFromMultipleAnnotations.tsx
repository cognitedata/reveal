/*!
 * Copyright 2024 Cognite AS
 */

import { type LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { Wireframe } from 'three/examples/jsm/lines/Wireframe.js';

import { type AnnotationsCogniteAnnotationTypesPrimitivesGeometry3DGeometry as AnnotationGeometry } from '@cognite/sdk';

import { type PointCloudAnnotation } from './types';

import { getAnnotationGeometries } from './annotationGeometryUtils';
import { type Status } from '../AnnotationsView';
import { getAnnotationMatrixByGeometry } from '../helpers/getMatrixUtils';
import { WireframeUserData } from '../helpers/WireframeUserData';
import { Matrix4, Vector3 } from 'three';
import { BoxUtils } from '../../../base/utilities/box/BoxUtils';
import { CylinderUtils } from '../../../base/utilities/box/CylinderUtils';
import { PrimitiveUtils } from '../../../base/utilities/box/PrimitiveUtils';

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
  const vertices: number[] = [];
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
      const objectVertices = getObjectVertices(geometry);
      if (objectVertices === undefined) {
        continue;
      }
      matrix.premultiply(globalMatrix);
      if (translationMatrix === undefined) {
        translation.setFromMatrixPosition(matrix);
        translationMatrix = createTranslationMatrix(translation, -1);
      }
      matrix.premultiply(translationMatrix);
      addVerticesForObject(vertices, objectVertices, matrix);
    }
    userData.add(annotation);
    if (groupSize !== undefined && userData.length >= groupSize) {
      break;
    }
  }
  const lineSegmentsGeometry = PrimitiveUtils.createLineSegmentsGeometry(vertices);
  const wireframe = new Wireframe(lineSegmentsGeometry, material);
  translationMatrix = createTranslationMatrix(translation);
  wireframe.matrix = translationMatrix;
  wireframe.matrixAutoUpdate = false;
  wireframe.computeLineDistances();
  wireframe.userData = userData;
  return wireframe;
}

const CYLINDER_VERTICES = CylinderUtils.createVertices();
const BOX_VERTICES = BoxUtils.createVertices();

function getObjectVertices(geometry: AnnotationGeometry): number[] | undefined {
  if (geometry.box !== undefined) {
    return BOX_VERTICES;
  } else if (geometry.cylinder !== undefined) {
    return CYLINDER_VERTICES;
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

function addVerticesForObject(vertices: number[], objectVertices: number[], matrix: Matrix4): void {
  const point = new Vector3();
  const additionalVertices = new Array<number>(objectVertices.length);
  for (let i = 0; i < objectVertices.length; i += 3) {
    const x = objectVertices[i];
    const y = objectVertices[i + 1];
    const z = objectVertices[i + 2];

    point.set(x, y, z);
    point.applyMatrix4(matrix);

    additionalVertices[i] = point.x;
    additionalVertices[i + 1] = point.y;
    additionalVertices[i + 2] = point.z;
  }
  vertices.push(...additionalVertices);
}