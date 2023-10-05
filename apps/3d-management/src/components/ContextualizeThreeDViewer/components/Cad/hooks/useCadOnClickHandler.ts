import { useCallback, useEffect } from 'react';

import {
  CadIntersection,
  Intersection,
  PointerEventData,
} from '@cognite/reveal';

import {
  setSelectedNodeIds,
  useContextualizeThreeDViewerStoreCad,
} from '../../../useContextualizeThreeDViewerStoreCad';
import { getCogniteCadModel } from '../../../utils/getCogniteCadModel';

// TODO: This is something that should be exported from Reveal.
// Add ticket before merging.
const isCadIntersection = (
  intersection: Intersection | undefined | null
): intersection is CadIntersection => {
  return (
    intersection !== undefined &&
    intersection !== null &&
    intersection.type === 'cad'
  );
};

export const useCadOnClickHandler = () => {
  const { modelId, threeDViewer } = useContextualizeThreeDViewerStoreCad(
    (state) => ({
      modelId: state.modelId,
      threeDViewer: state.threeDViewer,
      contextualizedNodes: state.contextualizedNodes,
      selectedAndContextualizedNodesTreeIndex:
        state.selectedAndContextualizedNodesTreeIndex,
      selectedNodeIdsList: state.selectedNodeIds,
      selectedAndContextualizedNodesList:
        state.selectedAndContextualizedNodesList,
    })
  );

  const onClick = useCallback(
    async (event: PointerEventData) => {
      // TODO: Display a user friendly error message if the model is not found
      if (!modelId) return;
      if (!threeDViewer) return;

      const intersection = await threeDViewer.getIntersectionFromPixel(
        event.offsetX,
        event.offsetY
      );
      if (!isCadIntersection(intersection)) return;

      const model = getCogniteCadModel({
        modelId,
        viewer: threeDViewer,
      });
      if (model === undefined) return;

      const nodeId = await model.mapTreeIndexToNodeId(intersection.treeIndex);
      setSelectedNodeIds([nodeId]);
    },
    [modelId, threeDViewer]
  );

  useEffect(() => {
    threeDViewer?.on('click', onClick);
    return () => {
      threeDViewer?.off('click', onClick);
    };
  }, [onClick, threeDViewer]);
};
