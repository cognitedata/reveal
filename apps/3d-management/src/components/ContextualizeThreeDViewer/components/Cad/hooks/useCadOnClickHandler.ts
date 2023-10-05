import { useCallback, useEffect } from 'react';

import { CadIntersection, Intersection } from '@cognite/reveal';

import { useContextualizeThreeDViewerStoreCad } from '../../../useContextualizeThreeDViewerStoreCad';
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
  const {
    modelId,
    threeDViewer,
    contextualizedNodes,
    // TODO: It looks very fishy to have all of these variables. I assume some can be removed
    selectedNodesTreeIndex,
    selectedAndContextualizedNodesTreeIndex,
    selectedNodeIdsList,
    selectedAndContextualizedNodesList,
  } = useContextualizeThreeDViewerStoreCad((state) => ({
    modelId: state.modelId,
    threeDViewer: state.threeDViewer,
    contextualizedNodes: state.contextualizedNodes,
    selectedNodesTreeIndex: state.selectedNodesTreeIndex,
    selectedAndContextualizedNodesTreeIndex:
      state.selectedAndContextualizedNodesTreeIndex,
    selectedNodeIdsList: state.selectedNodeIdsList,
    selectedAndContextualizedNodesList:
      state.selectedAndContextualizedNodesList,
  }));

  const onClick = useCallback(
    async (event) => {
      // TODO: Display a user friendly error message if the model is not found
      if (!modelId) return;
      if (!threeDViewer) return;

      const intersection = await threeDViewer?.getIntersectionFromPixel(
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

      // TODO: improve/simplify this logic of processing the different states to a simpler one
      const indexSelectedNodeSet = selectedNodesTreeIndex.getIndexSet();
      const indexContextualizedAndSelectedNodeSet =
        selectedAndContextualizedNodesTreeIndex.getIndexSet();

      const contextualizedNodeFound = contextualizedNodes?.items.find(
        (nodeItem) => nodeItem.nodeId === nodeId
      );
      const selectedNodeFound = indexSelectedNodeSet.contains(
        intersection.treeIndex
      );
      const selectedAndContextualizedNodeFound =
        indexContextualizedAndSelectedNodeSet.contains(intersection.treeIndex);

      // toggle the selection of nodes

      if (
        !selectedNodeFound &&
        !selectedNodeIdsList.find((nodeItem) => nodeItem === nodeId)
      ) {
        selectedNodeIdsList.push(nodeId);
      } else {
        selectedNodeIdsList.splice(selectedNodeIdsList.indexOf(nodeId), 1);
      }

      if (!selectedNodeFound && !contextualizedNodeFound) {
        indexSelectedNodeSet.add(intersection.treeIndex);
        selectedNodesTreeIndex.updateSet(indexSelectedNodeSet);
      } else if (selectedNodeFound && !contextualizedNodeFound) {
        indexSelectedNodeSet.remove(intersection.treeIndex);
        selectedNodesTreeIndex.updateSet(indexSelectedNodeSet);
      } else if (
        !selectedAndContextualizedNodeFound &&
        contextualizedNodeFound
      ) {
        indexContextualizedAndSelectedNodeSet.add(intersection.treeIndex);
        selectedAndContextualizedNodesTreeIndex.updateSet(
          indexContextualizedAndSelectedNodeSet
        );

        selectedAndContextualizedNodesList.push({
          nodeId,
          treeIndex: intersection.treeIndex,
        });
      } else if (selectedAndContextualizedNodeFound) {
        indexContextualizedAndSelectedNodeSet.remove(intersection.treeIndex);
        selectedAndContextualizedNodesTreeIndex.updateSet(
          indexContextualizedAndSelectedNodeSet
        );
        selectedAndContextualizedNodesList.splice(
          selectedAndContextualizedNodesList.findIndex(
            (nodeItem) => nodeItem.treeIndex === intersection.treeIndex
          ),
          1
        );
      }
    },
    [
      contextualizedNodes?.items,
      modelId,
      selectedAndContextualizedNodesList,
      selectedAndContextualizedNodesTreeIndex,
      selectedNodeIdsList,
      selectedNodesTreeIndex,
      threeDViewer,
    ]
  );

  useEffect(() => {
    threeDViewer?.on('click', onClick);
    return () => {
      threeDViewer?.off('click', onClick);
    };
  }, [onClick, threeDViewer]);
};
