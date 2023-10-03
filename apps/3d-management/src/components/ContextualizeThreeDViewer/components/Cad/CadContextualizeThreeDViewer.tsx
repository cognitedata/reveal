import { useEffect } from 'react';

import styled from 'styled-components';

import { Splitter } from '@data-exploration/components';
import { ResourceSelector } from '@data-exploration/containers';

import { CadIntersection, CogniteCadModel } from '@cognite/reveal';
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
  setModelId,
  useContextualizeThreeDViewerStore,
  setSelectedNodesTreeIndex,
  setSelectedAndContextualizedNodesTreeIndex,
  setContextualizedNodes,
} from '../../useContextualizeThreeDViewerStore';
import { getCdfCadContextualization } from '../../utils/getCdfCadContextualization';
import { saveCdfThreeDCadContextualization } from '../../utils/saveCdfThreeDCadContextualization';
import { updateThreeDViewerCadNodes } from '../../utils/updateThreeDViewerCadNodes';

import { CadRevealContent } from './CadRevealContent';

type ContextualizeThreeDViewerProps = {
  modelId: number;
  revisionId: number;
};
export type SelectedNode = {
  treeIndex: number;
  nodeId: number;
};

export const CadContextualizeThreeDViewer = ({
  modelId,
  revisionId,
}: ContextualizeThreeDViewerProps) => {
  const sdk = useSDK();

  const {
    isResourceSelectorOpen,
    threeDViewer,
    model,
    modelType,
    selectedNodeIdsList,
    contextualizedNodesTreeIndex,
    selectedNodesTreeIndex,
    selectedAndContextualizedNodesTreeIndex,
  } = useContextualizeThreeDViewerStore.getState();

  const [rightSidePanelWidth, setRightSidePanelWidth] = useLocalStorage(
    'COGNITE_CONTEXTUALIZE_EDITOR_RESOURCE_SELECTOR_WIDTH',
    DEFAULT_RIGHT_SIDE_PANEL_WIDTH
  );

  const handleContextualizedNodesUpdate = (
    newContextualizedNodes: ListResponse<AssetMapping3D[]> | null = null,
    nodesToReset = null
  ) => {
    if (!model || !(model instanceof CogniteCadModel) || modelType !== 'cad')
      return;

    // TODO: improve/simplify this logic of processing the different states to a simpler one

    const currentSelectedNodesTreeIndexState =
      useContextualizeThreeDViewerStore.getState().selectedNodesTreeIndex;
    const currentSelectedAndContextualizedNodesTreeIndexState =
      useContextualizeThreeDViewerStore.getState()
        .selectedAndContextualizedNodesTreeIndex;
    const currentContextualizedNodesTreeIndexState =
      useContextualizeThreeDViewerStore.getState().contextualizedNodesTreeIndex;

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

    if (newContextualizedNodes) {
      setContextualizedNodes(newContextualizedNodes);
    }
    setSelectedNodesTreeIndex(currentSelectedNodesTreeIndexState);
    setSelectedAndContextualizedNodesTreeIndex(
      currentSelectedAndContextualizedNodesTreeIndexState
    );

    updateThreeDViewerCadNodes({
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
  };
  // use effects hooks
  useEffect(() => {
    setModelId(modelId);
  }, [modelId]);

  useEffect(() => {
    (async () => {
      if (!model || !(model instanceof CogniteCadModel) || modelType !== 'cad')
        return;

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

      threeDViewer?.on('click', async (event) => {
        const intersection = (await threeDViewer.getIntersectionFromPixel(
          event.offsetX,
          event.offsetY
        )) as CadIntersection;
        if (intersection) {
          const nodeId = await model.mapTreeIndexToNodeId(
            intersection.treeIndex
          );

          // TODO: improve/simplify this logic of processing the different states to a simpler one
          const state = useContextualizeThreeDViewerStore.getState();
          const currentContextualizedNodesState = state.contextualizedNodes;
          const currentSelectedNodesState = state.selectedNodesTreeIndex;
          const currentSelectedAndContextualizedNodesTreeIndex =
            state.selectedAndContextualizedNodesTreeIndex;
          const currentSelectedAndContextualizedNodesListState =
            state.selectedAndContextualizedNodesList;

          const indexSelectedNodeSet = currentSelectedNodesState.getIndexSet();
          const indexContextualizedAndSelectedNodeSet =
            currentSelectedAndContextualizedNodesTreeIndex.getIndexSet();

          const contextualizedNodeFound =
            currentContextualizedNodesState?.items.find(
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
            currentSelectedNodesState.updateSet(indexSelectedNodeSet);
          } else if (selectedNodeFound && !contextualizedNodeFound) {
            indexSelectedNodeSet.remove(intersection.treeIndex);
            currentSelectedNodesState.updateSet(indexSelectedNodeSet);
          } else if (
            !selectedAndContextualizedNodeFound &&
            contextualizedNodeFound
          ) {
            indexContextualizedAndSelectedNodeSet.add(intersection.treeIndex);
            currentSelectedAndContextualizedNodesTreeIndex.updateSet(
              indexContextualizedAndSelectedNodeSet
            );

            currentSelectedAndContextualizedNodesListState.push({
              nodeId,
              treeIndex: intersection.treeIndex,
            });
          } else if (selectedAndContextualizedNodeFound) {
            indexContextualizedAndSelectedNodeSet.remove(
              intersection.treeIndex
            );
            currentSelectedAndContextualizedNodesTreeIndex.updateSet(
              indexContextualizedAndSelectedNodeSet
            );
            currentSelectedAndContextualizedNodesListState.splice(
              currentSelectedAndContextualizedNodesListState.findIndex(
                (nodeItem) => nodeItem.treeIndex === intersection.treeIndex
              ),
              1
            );
          }
        }
      });
    })();
  }, [threeDViewer, model, modelType, sdk, modelId, revisionId]);

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

  const generateContextualization = async (assetId: number) => {
    if (!model || !(model instanceof CogniteCadModel) || modelType !== 'cad')
      return;
    await saveCdfThreeDCadContextualization({
      sdk,
      modelId,
      revisionId,
      nodeIds: selectedNodeIdsList,
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
            <CadRevealContent
              modelId={modelId}
              revisionId={revisionId}
              onContextualizationUpdated={(
                newContextualizedNodes,
                nodesDeleted
              ) =>
                handleContextualizedNodesUpdate(
                  newContextualizedNodes,
                  nodesDeleted
                )
              }
            />
          </RevealContainer>
        </ThreeDViewerStyled>
        {isResourceSelectorOpen && (
          <ResourceSelector
            selectionMode="single"
            visibleResourceTabs={['asset']}
            onSelect={(item) => {
              generateContextualization(item.id);
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
