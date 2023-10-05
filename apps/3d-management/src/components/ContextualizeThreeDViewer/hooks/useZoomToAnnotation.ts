import { useCallback } from 'react';

import * as THREE from 'three';

import {
  AnnotationModel,
  AnnotationsBoundingVolume,
} from '@cognite/sdk/dist/src';

import { useContextualizeThreeDViewerStore } from '../useContextualizeThreeDViewerStore';
import {
  createBoxAnnotationAsBox3,
  createCylinderAnnotationAsBox3,
} from '../utils/annotations/annotationUtils';
import { getCognitePointCloudModel } from '../utils/getCognitePointCloudModel';

const FIT_CAMERA_TO_BOUNDING_BOX_ANIMATION_DURATION_MS = 1000;
const FIT_CAMERA_TO_BOUNDING_BOX_RADIUS_FACTOR = 5;

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

const getAnnotationAsBox3 = (
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

type UseZoomToAnnotationReturnType = (annotationId: number) => void;

export const useZoomToAnnotation = (): UseZoomToAnnotationReturnType => {
  const { threeDViewer, annotations, modelId } =
    useContextualizeThreeDViewerStore((state) => ({
      threeDViewer: state.threeDViewer,
      annotations: state.annotations,
      modelId: state.modelId,
    }));

  const zoomToAnnotation = useCallback(
    (annotationId: number) => {
      if (threeDViewer === null) return;
      if (modelId === null) return;

      const pointCloudModel = getCognitePointCloudModel({
        modelId,
        viewer: threeDViewer,
      });
      if (pointCloudModel === undefined) return;

      const annotation = annotations?.find(
        (annotation) => annotation.id === annotationId
      );
      if (annotation === undefined) return;

      const matrix4 = pointCloudModel.getCdfToDefaultModelTransformation();
      const box3 = getAnnotationAsBox3(annotation, matrix4);
      if (box3 === undefined) return;

      threeDViewer.fitCameraToBoundingBox(
        box3,
        FIT_CAMERA_TO_BOUNDING_BOX_ANIMATION_DURATION_MS,
        FIT_CAMERA_TO_BOUNDING_BOX_RADIUS_FACTOR
      );
    },
    [annotations, modelId, threeDViewer]
  );

  return zoomToAnnotation;
};
