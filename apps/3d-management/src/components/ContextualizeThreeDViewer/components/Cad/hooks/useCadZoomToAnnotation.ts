import { useCallback } from 'react';

import * as THREE from 'three';

import { getCogniteCadModel } from '../../../utils/getCogniteCadModel';
import { useCadContextualizeStore } from '../useCadContextualizeStore';

const FIT_CAMERA_TO_BOUNDING_BOX_ANIMATION_DURATION_MS = 1000;
const FIT_CAMERA_TO_BOUNDING_BOX_RADIUS_FACTOR = 5;

type UseZoomToAnnotationReturnType = (annotationId: number) => void;

export const useCadZoomToAnnotation = (): UseZoomToAnnotationReturnType => {
  const { threeDViewer, modelId, revisionId, contextualizedNodes } =
    useCadContextualizeStore((state) => ({
      threeDViewer: state.threeDViewer,
      contextualizedNodes: state.contextualizedNodes,
      modelId: state.modelId,
      revisionId: state.revisionId,
    }));

  const zoomToAnnotation = useCallback(
    async (annotationByAssetId: number) => {
      if (threeDViewer === null) return;
      if (modelId === null) return;
      if (revisionId === null) return;

      const model = getCogniteCadModel({
        modelId,
        revisionId,
        viewer: threeDViewer,
      });
      if (model === undefined) return;

      const annotationsForAssetId = contextualizedNodes?.filter(
        (annotation) => annotation.assetId === annotationByAssetId
      );
      if (annotationsForAssetId === undefined) return;

      const matrix4 = model.getCdfToDefaultModelTransformation();
      const box3 = new THREE.Box3();
    },
    [contextualizedNodes, modelId, threeDViewer]
  );

  return zoomToAnnotation;
};
