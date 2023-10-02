import { useEffect, useRef } from 'react';

import styled from 'styled-components';

import ThreeDViewerSidebar from '@3d-management/pages/RevisionDetails/components/ThreeDViewerSidebar';
import { Splitter } from '@data-exploration/components';
import { ResourceSelector } from '@data-exploration/containers';

import {
  CadIntersection,
  CogniteCadModel,
  TreeIndexNodeCollection,
} from '@cognite/reveal';
import { RevealContainer } from '@cognite/reveal-react-components';
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
  onCloseResourceSelector,
  setSelectedAndContextualizedNodesList,
  setSelectedNodes,
  setSelectedAndContextualizedNodes,
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

  // const selectedNodes = new TreeIndexNodeCollection();
  const currentSelectedAndContextualizedNodesList = new Array<SelectedNode>();

  const {
    isResourceSelectorOpen,
    threeDViewer,
    model,
    modelType,
    selectedNodeIdsList,
    selectedNodes,
    selectedAndContextualizedNodes,
  } = useContextualizeThreeDViewerStore.getState();

  const [rightSidePanelWidth, setRightSidePanelWidth] = useLocalStorage(
    'COGNITE_CONTEXTUALIZE_EDITOR_RESOURCE_SELECTOR_WIDTH',
    DEFAULT_RIGHT_SIDE_PANEL_WIDTH
  );

  const handleContextualizedNodesUpdate = (
    newNodes,
    newSelectedNodes: TreeIndexNodeCollection | null,
    nodesToReset
  ) => {
    if (!model || !(model instanceof CogniteCadModel) || modelType !== 'cad')
      return;

    const currentSelectedNodesState =
      useContextualizeThreeDViewerStore.getState().selectedNodes;
    const currentSelectedAndContextualizedNodesState =
      useContextualizeThreeDViewerStore.getState()
        .selectedAndContextualizedNodes;

    const newSelectedNodesUpdated: TreeIndexNodeCollection =
      new TreeIndexNodeCollection();

    if (newSelectedNodes) {
      const indexNewSelectedUpdated = newSelectedNodesUpdated.getIndexSet();
      indexNewSelectedUpdated.unionWith(newSelectedNodes.getIndexSet());
      newSelectedNodesUpdated.updateSet(indexNewSelectedUpdated);
    } else {
      //currentSelectedNodesState.clear();
      const indexCurrentSelectedNodes = currentSelectedNodesState.getIndexSet();
      currentSelectedNodesState.updateSet(indexCurrentSelectedNodes);
    }

    const indexCurrentSelectedAndContetualizedNodes =
      currentSelectedAndContextualizedNodesState.getIndexSet();

    indexCurrentSelectedAndContetualizedNodes.clear();
    setSelectedNodes(currentSelectedNodesState);
    setSelectedAndContextualizedNodes(
      currentSelectedAndContextualizedNodesState
    );

    updateThreeDViewerCadNodes({
      sdk,
      modelId,
      revisionId,
      model,
      nodesToReset: nodesToReset,
      contextualizedNodes: newNodes,
      selectedNodes: newSelectedNodesUpdated,
      selectedAndContextualizedNodes,
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
        selectedNodes: selectedNodes,
        selectedAndContextualizedNodes,
      });

      threeDViewer?.on('click', async (event) => {
        const intersection = (await threeDViewer.getIntersectionFromPixel(
          event.offsetX,
          event.offsetY
        )) as CadIntersection;
        if (intersection) {
          const nodeId = await model.mapTreeIndexToNodeId(
            intersection.treeIndex
          );

          const state = useContextualizeThreeDViewerStore.getState();
          const currentContextualizedNodesState = state.contextualizedNodes;
          const currentSelectedNodesState = state.selectedNodes;

          const indexSelectedNodeSet = currentSelectedNodesState.getIndexSet();
          const indexContextualizedAndSelectedNodeSet =
            selectedAndContextualizedNodes.getIndexSet();

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
            selectedAndContextualizedNodes.updateSet(
              indexContextualizedAndSelectedNodeSet
            );

            currentSelectedAndContextualizedNodesList.push({
              nodeId,
              treeIndex: intersection.treeIndex,
            });
          } else if (selectedAndContextualizedNodeFound) {
            indexContextualizedAndSelectedNodeSet.remove(
              intersection.treeIndex
            );
            selectedAndContextualizedNodes.updateSet(
              indexContextualizedAndSelectedNodeSet
            );
            currentSelectedAndContextualizedNodesList.splice(
              currentSelectedAndContextualizedNodesList.findIndex(
                (nodeItem) => nodeItem.treeIndex === intersection.treeIndex
              ),
              1
            );
          }

          setSelectedAndContextualizedNodesList(
            currentSelectedAndContextualizedNodesList
          );
        }
      });
    })();
  }, [threeDViewer, model, modelType, sdk, modelId, revisionId]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseResourceSelector();
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
    updateThreeDViewerCadNodes({
      sdk,
      modelId,
      revisionId,
      model,
      nodesToReset: null,
      contextualizedNodes: null,
      selectedNodes,
      selectedAndContextualizedNodes,
    });
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
              onContextualizationUpdated={(newNodes, nodesDeleted) =>
                handleContextualizedNodesUpdate(newNodes, null, nodesDeleted)
              }
            />
          </RevealContainer>
        </ThreeDViewerStyled>
        {/* {viewer && model && (
          <ThreeDViewerSidebar
            viewer={viewer}
            model={model}
            nodesClickable={true}
          />
        )} */}
        {isResourceSelectorOpen && (
          <ResourceSelector
            selectionMode="single"
            visibleResourceTabs={['asset']}
            onSelect={(item) => {
              onCloseResourceSelector();
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
