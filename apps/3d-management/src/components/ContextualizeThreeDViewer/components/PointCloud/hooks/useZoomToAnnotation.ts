import { useCallback } from 'react';

import { useReveal } from '@cognite/reveal-react-components';

import { useContextualizeThreeDViewerStore } from '../../../useContextualizeThreeDViewerStore';
import { getAnnotationAsBox3 } from '../../../utils/annotations/getAnnotationAsBox3';
import { getCognitePointCloudModel } from '../../../utils/getCognitePointCloudModel';

const FIT_CAMERA_TO_BOUNDING_BOX_ANIMATION_DURATION_MS = 1000;
const FIT_CAMERA_TO_BOUNDING_BOX_RADIUS_FACTOR = 5;

type UseZoomToAnnotationReturnType = (annotationId: number) => void;

export const useZoomToAnnotation = (): UseZoomToAnnotationReturnType => {
  const viewer = useReveal();

  const { annotations, modelId } = useContextualizeThreeDViewerStore(
    (state) => ({
      annotations: state.annotations,
      modelId: state.modelId,
    })
  );

  const zoomToAnnotation = useCallback(
    (annotationId: number) => {
      if (modelId === null) return;

      const pointCloudModel = getCognitePointCloudModel({
        modelId,
        viewer,
      });
      if (pointCloudModel === undefined) return;

      const annotation = annotations?.find(
        (annotation) => annotation.id === annotationId
      );
      if (annotation === undefined) return;

      const matrix4 = pointCloudModel.getCdfToDefaultModelTransformation();
      const box3 = getAnnotationAsBox3(annotation, matrix4);
      if (box3 === undefined) return;

      viewer.fitCameraToBoundingBox(
        box3,
        FIT_CAMERA_TO_BOUNDING_BOX_ANIMATION_DURATION_MS,
        FIT_CAMERA_TO_BOUNDING_BOX_RADIUS_FACTOR
      );
    },
    [annotations, modelId, viewer]
  );

  return zoomToAnnotation;
};
