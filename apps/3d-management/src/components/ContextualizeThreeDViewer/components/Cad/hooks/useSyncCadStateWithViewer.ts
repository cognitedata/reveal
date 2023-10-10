import { useEffect } from 'react';

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
    selectedNodeIdsStyleIndex,
    contextualizedNodesStyleIndex,
  } = useCadContextualizeStore((state) => ({
    modelId: state.modelId,
    isModelLoaded: state.isModelLoaded,
    threeDViewer: state.threeDViewer,
    selectedNodeIds: state.selectedNodeIds,
    selectedNodeIdsStyleIndex: state.selectedNodeIdsStyleIndex,
    contextualizedNodes: state.contextualizedNodes,
    contextualizedNodesStyleIndex: state.contextualizedNodesStyleIndex,
  }));

  // Update selected nodes in the viewer
  useEffect(() => {
    if (!isModelLoaded) return;
    if (modelId === null) return;
    if (threeDViewer === null) return;
    const cadModel = getCogniteCadModel({
      modelId,
      viewer: threeDViewer,
    });
    if (cadModel === undefined) return;

    // Reset all nodes
    cadModel.removeAllStyledNodeCollections();
  }, [modelId, threeDViewer, isModelLoaded]);

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

      const selectedTreeIds = await Promise.all(
        selectedNodeIds.map(async (nodeId) => {
          return cadModel.mapNodeIdToTreeIndex(nodeId);
        })
      );

      // Refresh the treenodecollections for selected and contextualized in order to update the styles for all related nodes
      const contextualizedIndex = contextualizedNodesStyleIndex.getIndexSet();
      const selectedIndex = selectedNodeIdsStyleIndex.getIndexSet();
      selectedIndex.clear();
      selectedTreeIds.forEach((treeId) => {
        selectedIndex.add(treeId);
        contextualizedIndex.remove(treeId);
      });
      selectedNodeIdsStyleIndex.updateSet(selectedIndex);
      contextualizedNodesStyleIndex.updateSet(contextualizedIndex);
    };

    updateSelectedNodes();
  }, [
    selectedNodeIds,
    modelId,
    threeDViewer,
    isModelLoaded,
    contextualizedNodesStyleIndex,
    selectedNodeIdsStyleIndex,
  ]);

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

      if (contextualizedNodes === null) return;

      const contextualizedTreeIds = contextualizedNodes.map(
        (item) => item.treeIndex
      );

      // Refresh the treenodecollection for updating the styles of the contextualized nodes
      const contextualizedIndex = contextualizedNodesStyleIndex.getIndexSet();
      contextualizedIndex.clear();
      contextualizedTreeIds.forEach((treeId) => {
        contextualizedIndex.add(treeId);
      });
      contextualizedNodesStyleIndex.updateSet(contextualizedIndex);
    };

    updateContextualizedNodes();
  }, [
    isModelLoaded,
    contextualizedNodes,
    modelId,
    threeDViewer,
    contextualizedNodesStyleIndex,
  ]);

  useEffect(() => {
    if (!isModelLoaded) return;
    if (modelId === null) return;
    if (threeDViewer === null) return;

    const cadModel = getCogniteCadModel({
      modelId,
      viewer: threeDViewer,
    });
    if (cadModel === undefined) return;

    cadModel.assignStyledNodeCollection(
      selectedNodeIdsStyleIndex,
      CAD_STYLE.SELECTED
    );

    cadModel.assignStyledNodeCollection(contextualizedNodesStyleIndex, {
      color: CAD_STYLE.CONTEXTUALIZED_COLOR,
    });
  }, [modelId, threeDViewer, isModelLoaded]);
};
