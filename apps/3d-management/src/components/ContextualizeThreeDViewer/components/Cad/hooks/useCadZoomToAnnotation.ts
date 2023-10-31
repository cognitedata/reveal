import { useCallback } from 'react';

import * as THREE from 'three';

import { useReveal } from '@cognite/reveal-react-components';

import { getCogniteCadModel } from '../../../utils/getCogniteCadModel';
import { useCadContextualizeStore } from '../useCadContextualizeStore';

const FIT_CAMERA_TO_BOUNDING_BOX_ANIMATION_DURATION_MS = 1000;
const FIT_CAMERA_TO_BOUNDING_BOX_RADIUS_FACTOR = 2;

type UseZoomToAnnotationReturnType = (annotationId: number) => void;

export const useCadZoomToAnnotation = (): UseZoomToAnnotationReturnType => {
  const viewer = useReveal();

  const { modelId, revisionId, contextualizedNodes } = useCadContextualizeStore(
    (state) => ({
      contextualizedNodes: state.contextualizedNodes,
      modelId: state.modelId,
      revisionId: state.revisionId,
    })
  );

  const zoomToAnnotation = useCallback(
    async (annotationByAssetId: number) => {
      if (modelId === null) return;
      if (revisionId === null) return;

      const model = getCogniteCadModel({
        modelId,
        revisionId,
        viewer,
      });
      if (model === undefined) return;

      const annotationsPerAssetId = contextualizedNodes?.filter(
        (annotation) => annotation.assetId === annotationByAssetId
      );
      if (annotationsPerAssetId === undefined) return;

      const matrix4 = model.getCdfToDefaultModelTransformation();
      const globalBox = new THREE.Box3();

      const groupOfNodes = new THREE.Group();

      // get all the nodes and add each to a group in order to generate the global bounding box
      await Promise.all(
        annotationsPerAssetId.map(async (annotation) => {
          const box = await model.getBoundingBoxByNodeId(annotation.nodeId);
          const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(),
            new THREE.MeshBasicMaterial()
          );

          mesh.geometry.boundingBox = box.clone();
          groupOfNodes.add(mesh);
        })
      );
      groupOfNodes.matrixWorld.multiply(matrix4);
      globalBox.setFromObject(groupOfNodes);

      viewer.fitCameraToBoundingBox(
        globalBox,
        FIT_CAMERA_TO_BOUNDING_BOX_ANIMATION_DURATION_MS,
        FIT_CAMERA_TO_BOUNDING_BOX_RADIUS_FACTOR
      );
    },
    [contextualizedNodes, modelId, revisionId, viewer]
  );

  return zoomToAnnotation;
};
