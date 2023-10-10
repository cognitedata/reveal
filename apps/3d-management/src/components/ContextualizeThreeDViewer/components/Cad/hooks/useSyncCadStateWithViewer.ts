import { useEffect } from 'react';

import { TreeIndexNodeCollection } from '@cognite/reveal';

import { getCogniteCadModel } from '../../../../../components/ContextualizeThreeDViewer/utils/getCogniteCadModel';
import { CAD_STYLE } from '../../../../../pages/ContextualizeEditor/constants';
import { useCadContextualizeStore } from '../useCadContextualizeStore';

export const useSyncCadStateWithViewer = () => {
  const {
    modelId,
    isModelLoaded,
    threeDViewer,
    selectedNodeIds,
    contextualizedNodes,
  } = useCadContextualizeStore((state) => ({
    modelId: state.modelId,
    isModelLoaded: state.isModelLoaded,
    threeDViewer: state.threeDViewer,
    selectedNodeIds: state.selectedNodeIds,
    contextualizedNodes: state.contextualizedNodes,
  }));

  // Update selected nodes in the viewer
  useEffect(() => {
    if (!isModelLoaded) return;

    const updateSelectedNodes = async () => {
      if (modelId === null) return;
      if (threeDViewer === null) return;

      const cadModel = getCogniteCadModel({
        modelId,
        viewer: threeDViewer,
      });
      if (cadModel === undefined) return;

      // Reset all nodes
      cadModel.removeAllStyledNodeCollections();

      const selectedTreeIds = await Promise.all(
        selectedNodeIds.map(async (nodeId) => {
          return cadModel.mapNodeIdToTreeIndex(nodeId);
        })
      );

      // Update selected nodes
      cadModel.assignStyledNodeCollection(
        new TreeIndexNodeCollection(selectedTreeIds),
        CAD_STYLE.SELECTED
      );
    };

    updateSelectedNodes();
  }, [selectedNodeIds, modelId, threeDViewer, isModelLoaded]);

  // Update contextualized nodes in the viewer
  useEffect(() => {
    if (!isModelLoaded) return;

    const updateContextualizedNodes = async () => {
      if (modelId === null) return;
      if (threeDViewer === null) return;

      const cadModel = getCogniteCadModel({
        modelId,
        viewer: threeDViewer,
      });
      if (cadModel === undefined) return;

      // Reset all nodes
      cadModel.removeAllStyledNodeCollections();

      if (contextualizedNodes === null) return;

      const contextualizedTreeIds = contextualizedNodes.map(
        (item) => item.treeIndex
      );

      // Update contextualized nodes
      cadModel.assignStyledNodeCollection(
        new TreeIndexNodeCollection(contextualizedTreeIds),
        { color: CAD_STYLE.CONTEXTUALIZED_COLOR }
      );
    };

    updateContextualizedNodes();
  }, [isModelLoaded, contextualizedNodes, modelId, threeDViewer]);
};
