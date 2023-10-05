import { useEffect } from 'react';
import { useContextualizeThreeDViewerStoreCad } from '../../../useContextualizeThreeDViewerStoreCad';
import { getCogniteCadModel } from '@3d-management/components/ContextualizeThreeDViewer/utils/getCogniteCadModel';
import {
  DefaultNodeAppearance,
  TreeIndexNodeCollection,
} from '@cognite/reveal';
import { cadNodeStyles } from '@3d-management/pages/ContextualizeEditor/constants';

export const useSyncCadStateWithViewer = () => {
  const { modelId, threeDViewer, selectedNodeIds, contextualizedNodes } =
    useContextualizeThreeDViewerStoreCad((state) => ({
      modelId: state.modelId,
      threeDViewer: state.threeDViewer,
      selectedNodeIds: state.selectedNodeIds,
      contextualizedNodes: state.contextualizedNodes,
    }));

  // Update selected nodes in the viewer
  useEffect(() => {
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
        DefaultNodeAppearance.Highlighted
      );
    };

    updateSelectedNodes();
  }, [selectedNodeIds, modelId, threeDViewer]);

  // Update contextualized nodes in the viewer
  useEffect(() => {
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
        { color: cadNodeStyles[1] }
      );
    };

    updateContextualizedNodes();
  });
};
