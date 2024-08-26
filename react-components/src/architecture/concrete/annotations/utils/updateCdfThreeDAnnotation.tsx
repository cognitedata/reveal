/*!
 * Copyright 2024 Cognite AS
 */

import * as THREE from 'three';

import { type CognitePointCloudModel } from '@cognite/reveal';
import {
  type CogniteClient,
  type AnnotationData,
  type AnnotationsCogniteAnnotationTypesImagesAssetLink
} from '@cognite/sdk';

import { type AssetPointCloudAnnotation, type PointCloudAnnotation } from './types';
import { type PendingAnnotation } from './PendingAnnotation';

export const updateCdfThreeDAnnotation = async ({
  annotation,
  pendingAnnotation,
  sdk,
  pointCloudModel
}: {
  annotation: PointCloudAnnotation;
  pendingAnnotation: PendingAnnotation;
  sdk: CogniteClient;
  pointCloudModel: CognitePointCloudModel;
}): Promise<AssetPointCloudAnnotation | undefined> => {
  if (annotation.source !== 'asset-centric') {
    return;
  }
  const globalMatrix = pointCloudModel.getCdfToDefaultModelTransformation().invert();

  const assetLink = annotation.geometry as AnnotationsCogniteAnnotationTypesImagesAssetLink;

  const data = getAnnotationData(pendingAnnotation, globalMatrix, assetLink);
  const hasAssetRef = assetLink?.assetRef !== undefined;
  const changes = [
    {
      id: annotation.id,
      update: {
        status: {
          set: hasAssetRef ? 'approved' : annotation.status
        },
        data: {
          set: data
        }
      }
    }
  ];

  const updatedAnnotation = (await sdk.annotations.update(changes))[0];
  return {
    ...annotation,
    status: hasAssetRef ? 'approved' : annotation.status,
    geometry: updatedAnnotation.data
  };
};

const getAnnotationData = (
  pendingAnnotation: PendingAnnotation,
  globalMatrix: THREE.Matrix4,
  assetLink: AnnotationsCogniteAnnotationTypesImagesAssetLink | undefined
): AnnotationData => {
  if (pendingAnnotation.isCylinder) {
    const matrix = pendingAnnotation.matrix.clone();
    matrix.premultiply(globalMatrix);
    return getCylinderData(matrix, assetLink);
  } else {
    const matrix = pendingAnnotation.getCdfMatrix(globalMatrix);
    return getBoxData(matrix, assetLink);
  }
};

const getCylinderData = (
  matrix: THREE.Matrix4,
  assetLink: AnnotationsCogniteAnnotationTypesImagesAssetLink | undefined
): AnnotationData => {
  // This seems strange, but Reveal swaps Y and Z axis.
  const centerA = new THREE.Vector3(0, 0.5, 0).applyMatrix4(matrix);
  const centerB = new THREE.Vector3(0, -0.5, 0).applyMatrix4(matrix);
  const scale = new THREE.Vector3();
  matrix.decompose(new THREE.Vector3(), new THREE.Quaternion(), scale);

  const radius = (scale.x + scale.z) / 2;

  return {
    region: [
      {
        cylinder: {
          centerA: centerA.toArray(),
          centerB: centerB.toArray(),
          radius
        }
      }
    ],
    assetRef: assetLink?.assetRef
  };
};

const getBoxData = (
  matrix: THREE.Matrix4,
  assetLink: AnnotationsCogniteAnnotationTypesImagesAssetLink | undefined
): AnnotationData => {
  return {
    region: [
      {
        box: {
          matrix: matrix.elements
        }
      }
    ],
    assetRef: assetLink?.assetRef
  };
};
