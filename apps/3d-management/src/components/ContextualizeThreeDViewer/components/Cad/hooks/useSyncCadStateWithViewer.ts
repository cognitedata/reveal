import { useEffect } from 'react';

import { useReveal } from '@cognite/reveal-react-components';

import { getCogniteCadModel } from '../../../../../components/ContextualizeThreeDViewer/utils/getCogniteCadModel';
import { refreshCadContextualizedStyledIndices } from '../../../utils/refreshCadContextualizedStyledIndices';
import {
  useCadContextualizeStore,
  resetCadContextualizeThreeDViewerStore,
} from '../useCadContextualizeStore';

export const useSyncCadStateWithViewer = () => {
  const viewer = useReveal();

  const {
    modelId,
    revisionId,
    isModelLoaded,
    selectedNodeIds,
    contextualizedNodes,
    selectedNodeIdsStyleIndex,
    contextualizedNodesStyleIndex,
    highlightedNodeIdsStyleIndex,
    hoveredAnnotationByAssetId,
  } = useCadContextualizeStore((state) => ({
    modelId: state.modelId,
    revisionId: state.revisionId,
    isModelLoaded: state.isModelLoaded,
    selectedNodeIds: state.selectedNodeIds,
    selectedNodeIdsStyleIndex: state.selectedNodeIdsStyleIndex,
    contextualizedNodes: state.contextualizedNodes,
    contextualizedNodesStyleIndex: state.contextualizedNodesStyleIndex,
    highlightedNodeIdsStyleIndex: state.highlightedNodeIdsStyleIndex,
    hoveredAnnotationByAssetId: state.hoveredAnnotationByAssetId,
  }));

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resetCadContextualizeThreeDViewerStore();
    };
  }, []);

  // Update selected nodes in the viewer
  useEffect(() => {
    if (!isModelLoaded) return;
    if (modelId === null) return;
    if (revisionId === null) return;

    const cadModel = getCogniteCadModel({
      modelId,
      revisionId,
      viewer,
    });
    if (cadModel === undefined) return;

    // Reset all nodes
    cadModel.removeAllStyledNodeCollections();
  }, [modelId, revisionId, viewer, isModelLoaded]);

  // Update selected nodes in the viewer
  useEffect(() => {
    if (!isModelLoaded) return;

    const updateSelectedNodes = async () => {
      if (modelId === null) return;
      if (revisionId === null) return;

      const cadModel = getCogniteCadModel({
        modelId,
        revisionId,
        viewer,
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
    revisionId,
    viewer,
    isModelLoaded,
    contextualizedNodesStyleIndex,
    selectedNodeIdsStyleIndex,
  ]);

  // Update contextualized nodes in the viewer
  useEffect(() => {
    if (!isModelLoaded) return;

    const updateContextualizedNodes = async () => {
      if (modelId === null) return;
      if (revisionId === null) return;
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
    revisionId,
    contextualizedNodesStyleIndex,
  ]);

  // Sync hovered annotation with viewer.
  useEffect(() => {
    if (modelId === null) return;

    if (contextualizedNodes) {
      refreshCadContextualizedStyledIndices({
        contextualizedNodesStyleIndex,
        contextualizedNodes,
      });
    }

    // Add new hovered annotation(s) to the viewer.
    const annotationsPerAssetId = contextualizedNodes?.filter(
      (annotation) => annotation.assetId === hoveredAnnotationByAssetId
    );
    if (annotationsPerAssetId === undefined) return;

    // Refresh the treenodecollections for selected and contextualized in order to update the styles for all related nodes
    const highlightedIndex = highlightedNodeIdsStyleIndex.getIndexSet();
    const contextualizedIndex = contextualizedNodesStyleIndex.getIndexSet();
    // const selectedIndex = selectedNodeIdsStyleIndex.getIndexSet();
    highlightedIndex.clear();
    annotationsPerAssetId.forEach((annotation) => {
      // selectedIndex.add(treeId);
      highlightedIndex.add(annotation.treeIndex);
      contextualizedIndex.remove(annotation.treeIndex);
    });
    // selectedNodeIdsStyleIndex.updateSet(selectedIndex);
    contextualizedNodesStyleIndex.updateSet(contextualizedIndex);
  }, [
    contextualizedNodes,
    modelId,
    highlightedNodeIdsStyleIndex,
    hoveredAnnotationByAssetId,
    contextualizedNodesStyleIndex,
  ]);
};
