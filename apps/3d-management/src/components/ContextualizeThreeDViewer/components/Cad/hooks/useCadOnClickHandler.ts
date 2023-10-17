import { useCallback, useEffect } from 'react';

import {
  CadIntersection,
  Intersection,
  PointerEventData,
} from '@cognite/reveal';

import { assignStylesToCadModel } from '../../../utils/assignStylesToCadModel';
import { refreshCadContextualizedStyledIndices } from '../../../utils/refreshCadContextualizedStyledIndices';
import {
  setSelectedNodeIds,
  useCadContextualizeStore,
} from '../useCadContextualizeStore';

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
  const {
    modelId,
    revisionId,
    threeDViewer,
    selectedNodeIdsList,
    contextualizedNodes,
    contextualizedNodesStyleIndex,
    selectedNodeIdsStyleIndex,
    highlightedNodeIdsStyleIndex,
  } = useCadContextualizeStore((state) => ({
    modelId: state.modelId,
    revisionId: state.revisionId,
    threeDViewer: state.threeDViewer,
    selectedNodeIdsList: state.selectedNodeIds,
    contextualizedNodes: state.contextualizedNodes,
    contextualizedNodesStyleIndex: state.contextualizedNodesStyleIndex,
    selectedNodeIdsStyleIndex: state.selectedNodeIdsStyleIndex,
    highlightedNodeIdsStyleIndex: state.highlightedNodeIdsStyleIndex,
  }));

  const onClick = useCallback(
    async (event: PointerEventData) => {
      // TODO: Display a user friendly error message if the model is not found
      if (!modelId) return;
      if (!revisionId) return;
      if (!threeDViewer) return;

      const intersection = await threeDViewer.getIntersectionFromPixel(
        event.offsetX,
        event.offsetY
      );
      if (!isCadIntersection(intersection)) return;

      const model = intersection.model;

      if (model === undefined) return;

      // if there is no styled assigned to the model, then assign it first
      if (model.styledNodeCollections.length === 0) {
        assignStylesToCadModel({
          model,
          selectedNodeIdsStyleIndex,
          contextualizedNodesStyleIndex,
          highlightedNodeIdsStyleIndex,
        });
      }
      const nodeId = await model.mapTreeIndexToNodeId(intersection.treeIndex);

      if (contextualizedNodes) {
        refreshCadContextualizedStyledIndices({
          contextualizedNodesStyleIndex,
          contextualizedNodes,
        });
      }

      if (selectedNodeIdsList.includes(nodeId)) {
        setSelectedNodeIds(selectedNodeIdsList.filter((id) => id !== nodeId));
        return;
      }

      setSelectedNodeIds([...selectedNodeIdsList, nodeId]);
    },
    [
      modelId,
      revisionId,
      threeDViewer,
      contextualizedNodes,
      selectedNodeIdsList,
      selectedNodeIdsStyleIndex,
      contextualizedNodesStyleIndex,
      highlightedNodeIdsStyleIndex,
    ]
  );

  useEffect(() => {
    threeDViewer?.on('click', onClick);
    return () => {
      threeDViewer?.off('click', onClick);
    };
  }, [onClick, threeDViewer]);
};
