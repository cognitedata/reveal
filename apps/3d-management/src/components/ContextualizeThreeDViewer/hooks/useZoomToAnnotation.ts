import { useCallback } from 'react';

import { useContextualizeThreeDViewerStore } from '../useContextualizeThreeDViewerStore';
import { getAnnotationAsBox3 } from '../utils/annotations/getAnnotationAsBox3';
import { getCognitePointCloudModel } from '../utils/getCognitePointCloudModel';

const FIT_CAMERA_TO_BOUNDING_BOX_ANIMATION_DURATION_MS = 1000;
const FIT_CAMERA_TO_BOUNDING_BOX_RADIUS_FACTOR = 5;

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
