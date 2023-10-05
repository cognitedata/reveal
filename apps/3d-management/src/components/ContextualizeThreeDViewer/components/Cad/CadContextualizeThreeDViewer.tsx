import { useCallback, useEffect } from 'react';

import styled from 'styled-components';

import { Splitter } from '@data-exploration/components';
import { ResourceSelector } from '@data-exploration/containers';

import { CadIntersection } from '@cognite/reveal';
import { RevealContainer } from '@cognite/reveal-react-components';
import { AssetMapping3D, ListResponse } from '@cognite/sdk/dist/src';
import { useSDK } from '@cognite/sdk-provider';

import {
  CONTEXTUALIZE_EDITOR_HEADER_HEIGHT,
  DEFAULT_RIGHT_SIDE_PANEL_WIDTH,
  defaultRevealColor,
} from '../../../../pages/ContextualizeEditor/constants';
import { useLocalStorage } from '../../../../utils/useLocalStorage';
import {
  useContextualizeThreeDViewerStoreCad,
  setContextualizedNodes,
  setSelectedNodeIdsList,
} from '../../useContextualizeThreeDViewerStoreCad';
import { deleteCdfThreeDCadContextualization } from '../../utils/deleteCdfThreeDCadContextualization';
import { getCdfCadContextualization } from '../../utils/getCdfCadContextualization';
import { getCogniteCadModel } from '../../utils/getCogniteCadModel';
import { saveCdfThreeDCadContextualization } from '../../utils/saveCdfThreeDCadContextualization';
import { updateThreeDViewerCadNodes } from '../../utils/updateThreeDViewerCadNodes';

import { CadRevealContent } from './CadRevealContent';

type ContextualizeThreeDViewerProps = {
  modelId: number;
  revisionId: number;
};

export const CadContextualizeThreeDViewer = ({
  modelId,
  revisionId,
}: ContextualizeThreeDViewerProps) => {
  const sdk = useSDK();

  const {
    isResourceSelectorOpen,
    threeDViewer,
    selectedNodeIdsList,
    contextualizedNodesTreeIndex,
    selectedNodesTreeIndex,
    selectedAndContextualizedNodesTreeIndex,
    contextualizedNodes,
    selectedAndContextualizedNodesList,
  } = useContextualizeThreeDViewerStoreCad((state) => ({
    isResourceSelectorOpen: state.isResourceSelectorOpen,
    threeDViewer: state.threeDViewer,
    contextualizedNodesTreeIndex: state.contextualizedNodesTreeIndex,
    selectedNodeIdsList: state.selectedNodeIdsList,
    selectedNodesTreeIndex: state.selectedNodesTreeIndex,
    selectedAndContextualizedNodesTreeIndex:
      state.selectedAndContextualizedNodesTreeIndex,
    contextualizedNodes: state.contextualizedNodes,
    selectedAndContextualizedNodesList:
      state.selectedAndContextualizedNodesList,
  }));

  const [rightSidePanelWidth, setRightSidePanelWidth] = useLocalStorage(
    'COGNITE_CONTEXTUALIZE_EDITOR_RESOURCE_SELECTOR_WIDTH',
    DEFAULT_RIGHT_SIDE_PANEL_WIDTH
  );

  const handleContextualizedNodesUpdate = useCallback(
    async (
      newContextualizedNodes: ListResponse<AssetMapping3D[]> | null = null,
      nodesToReset = null
    ) => {
      // TODO: Display a user friendly error message if the model is not found
      if (threeDViewer === null) return;
      if (modelId === undefined) return;

      const model = getCogniteCadModel({
        modelId,
        viewer: threeDViewer,
      });
      if (model === undefined) return;

      // TODO: improve/simplify this logic of processing the different states to a simpler one
      const currentSelectedNodesTreeIndexState = selectedNodesTreeIndex;
      const currentSelectedAndContextualizedNodesTreeIndexState =
        selectedAndContextualizedNodesTreeIndex;
      const currentContextualizedNodesTreeIndexState =
        contextualizedNodesTreeIndex;

      const indexCurrentContextualizedNodesState =
        currentContextualizedNodesTreeIndexState.getIndexSet();

      indexCurrentContextualizedNodesState.clear();

      newContextualizedNodes?.items.forEach((item) => {
        indexCurrentContextualizedNodesState.add(item.treeIndex);
      });

      currentContextualizedNodesTreeIndexState.updateSet(
        indexCurrentContextualizedNodesState
      );

      const indexCurrentSelectedNodes =
        currentSelectedNodesTreeIndexState.getIndexSet();
      indexCurrentSelectedNodes.clear();
      currentSelectedNodesTreeIndexState.updateSet(indexCurrentSelectedNodes);
      //}

      const indexCurrentSelectedAndContetualizedNodes =
        currentSelectedAndContextualizedNodesTreeIndexState.getIndexSet();

      indexCurrentSelectedAndContetualizedNodes.clear();
      currentSelectedAndContextualizedNodesTreeIndexState.clear();
      currentSelectedAndContextualizedNodesTreeIndexState.updateSet(
        indexCurrentSelectedAndContetualizedNodes
      );

      await updateThreeDViewerCadNodes({
        sdk,
        modelId,
        revisionId,
        model,
        nodesToReset: nodesToReset,
        contextualizedNodes: newContextualizedNodes,
        contextualizedNodesTreeIndex: currentContextualizedNodesTreeIndexState,
        selectedNodesTreeIndex: currentSelectedNodesTreeIndexState,
        selectedAndContextualizedNodesTreeIndex:
          currentSelectedAndContextualizedNodesTreeIndexState,
      });

      if (newContextualizedNodes) {
        setContextualizedNodes(newContextualizedNodes);
      }

      selectedNodeIdsList.length = 0;
      setSelectedNodeIdsList(selectedNodeIdsList);
    },
    [
      contextualizedNodesTreeIndex,
      modelId,
      revisionId,
      sdk,
      selectedAndContextualizedNodesTreeIndex,
      selectedNodeIdsList,
      selectedNodesTreeIndex,
      threeDViewer,
    ]
  );

  // use effects hooks
  useEffect(() => {
    const updateSelectedCadNodes = async () => {
      // TODO: Display a user friendly error message if the model is not found
      if (threeDViewer === null) return;

      const model = getCogniteCadModel({
        modelId,
        viewer: threeDViewer,
      });
      if (model === undefined) return;

      const currentContextualizedNodes = await getCdfCadContextualization({
        sdk: sdk,
        modelId: modelId,
        revisionId: revisionId,
        nodeId: undefined,
      });

      updateThreeDViewerCadNodes({
        sdk,
        modelId,
        revisionId,
        model,
        nodesToReset: null,
        contextualizedNodes: currentContextualizedNodes,
        contextualizedNodesTreeIndex,
        selectedNodesTreeIndex,
        selectedAndContextualizedNodesTreeIndex,
      });

      setContextualizedNodes(currentContextualizedNodes);
    };

    updateSelectedCadNodes();
  }, [
    contextualizedNodesTreeIndex,
    modelId,
    revisionId,
    sdk,
    selectedAndContextualizedNodesTreeIndex,
    selectedNodesTreeIndex,
    threeDViewer,
  ]);

  const onClick = useCallback(
    async (event) => {
      const intersection = (await threeDViewer?.getIntersectionFromPixel(
        event.offsetX,
        event.offsetY
      )) as CadIntersection;
      if (intersection) {
        // TODO: Display a user friendly error message if the model is not found
        if (!modelId) return;
        if (!threeDViewer) return;

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
          indexContextualizedAndSelectedNodeSet.contains(
            intersection.treeIndex
          );

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
      }
    },
    [
      threeDViewer,
      modelId,
      contextualizedNodes,
      selectedNodesTreeIndex,
      selectedAndContextualizedNodesTreeIndex,
      selectedAndContextualizedNodesList,
      selectedNodeIdsList,
    ]
  );

  useEffect(() => {
    (async () => {
      if (!modelId || !revisionId || !contextualizedNodes) return;

      threeDViewer?.on('click', onClick);
      return () => {
        threeDViewer?.off('click', onClick);
      };
    })();
  }, [threeDViewer, modelId, revisionId, contextualizedNodes, onClick]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });

  const handleContextualizationDeletionRequest = useCallback(async () => {
    if (!contextualizedNodes) return;
    const nodeIds = selectedAndContextualizedNodesList.map(
      (item) => item.nodeId
    );
    const mappedNodesDeleted = await deleteCdfThreeDCadContextualization({
      sdk,
      modelId,
      revisionId,
      nodeIds: nodeIds,
    });

    contextualizedNodes?.items.forEach((item, index) => {
      if (
        mappedNodesDeleted.items.find((node) => item.nodeId === node.nodeId)
      ) {
        contextualizedNodes?.items.splice(index, 1);
      }
    });
    handleContextualizedNodesUpdate(contextualizedNodes);
  }, [
    contextualizedNodes,
    selectedAndContextualizedNodesList,
    sdk,
    modelId,
    revisionId,
    handleContextualizedNodesUpdate,
  ]);

  const handleContextualizationCreationRequest = async (
    assetId: number,
    nodeIds: number[]
  ) => {
    await saveCdfThreeDCadContextualization({
      sdk,
      modelId,
      revisionId,
      nodeIds: nodeIds,
      assetId,
    });

    handleContextualizedNodesUpdate();
  };

  return (
    <>
      <StyledSplitter
        secondaryInitialSize={rightSidePanelWidth}
        onSecondaryPaneSizeChange={setRightSidePanelWidth}
      >
        <ThreeDViewerStyled>
          <RevealContainer sdk={sdk} color={defaultRevealColor}>
            <CadRevealContent modelId={modelId} revisionId={revisionId} />
          </RevealContainer>
        </ThreeDViewerStyled>
        {isResourceSelectorOpen && (
          <ResourceSelector
            selectionMode="single"
            visibleResourceTabs={['asset']}
            onSelect={(item) => {
              handleContextualizationCreationRequest(
                item.id,
                selectedNodeIdsList
              );
            }}
          />
        )}
      </StyledSplitter>
    </>
  );
};

const ThreeDViewerStyled = styled.div`
  position: relative;
  display: flex;
  height: calc(
    100vh - var(--cdf-ui-navigation-height) -
      ${CONTEXTUALIZE_EDITOR_HEADER_HEIGHT}px
  ); /* sidebar height and top-bot paddings subtracted */
`;

const StyledSplitter = styled(Splitter)`
  height: calc(
    100vh - var(--cdf-ui-navigation-height) -
      ${CONTEXTUALIZE_EDITOR_HEADER_HEIGHT}px
  );
`;
