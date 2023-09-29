import { useEffect } from 'react';

import styled from 'styled-components';

import ThreeDViewerSidebar from '@3d-management/pages/RevisionDetails/components/ThreeDViewerSidebar';
import { Splitter } from '@data-exploration/components';
import { ResourceSelector } from '@data-exploration/containers';
import { Color } from 'three';

import {
  CadIntersection,
  CogniteCadModel,
  DefaultNodeAppearance,
  NodeAppearance,
  NodeOutlineColor,
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
} from '../../useContextualizeThreeDViewerStore';
import { getCdfCadContextualization } from '../../utils/getCdfCadContextualization';
import { saveCdfThreeDCadContextualization } from '../../utils/saveCdfThreeDCadContextualization';
import { updateStyleForContextualizedCadNodes } from '../../utils/updateStyleForContextualizedCadNodes';

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

  const nodeStyles = [
    DefaultNodeAppearance.Default,
    DefaultNodeAppearance.Highlighted,
    new Color(0.6, 0.2, 0.78),
    new Color(0.38, 0.27, 0.72),
  ];

  const selectedNodes = new TreeIndexNodeCollection();
  const selectedAndContextualizedNodes = new TreeIndexNodeCollection();

  const {
    isResourceSelectorOpen,
    viewer,
    model,
    modelType,
    selectedNodeIdsList,
    selectedAndContextualizedNodesList,
  } = useContextualizeThreeDViewerStore((state) => ({
    isResourceSelectorOpen: state.isResourceSelectorOpen,
    viewer: state.threeDViewer,
    model: state.model,
    modelType: state.modelType,
    selectedNodeIdsList: state.selectedNodeIdsList,
    selectedAndContextualizedNodesList:
      state.selectedAndContextualizedNodesList,
  }));

  const [rightSidePanelWidth, setRightSidePanelWidth] = useLocalStorage(
    'COGNITE_CONTEXTUALIZE_EDITOR_RESOURCE_SELECTOR_WIDTH',
    DEFAULT_RIGHT_SIDE_PANEL_WIDTH
  );

  // use effects hooks
  useEffect(() => {
    setModelId(modelId);
  }, [modelId]);

  useEffect(() => {
    (async () => {
      if (model && model instanceof CogniteCadModel && modelType === 'cad') {
        // get the contextualized 3d nodes and update the style of each node
        // TODO: get the mapped cad nodes with the cursor
        const mappedCadNodes = await getCdfCadContextualization({
          sdk: sdk,
          modelId: modelId,
          revisionId: revisionId,
          nodeId: undefined,
        });

        // const colorMappedAndSelected = new Color(0.1, 0.7, 0.78);

        updateStyleForContextualizedCadNodes({
          model,
          cadMapping: mappedCadNodes,
          color: nodeStyles[2] as Color,
          outlineColor: NodeOutlineColor.NoOutline,
        });

        model.assignStyledNodeCollection(
          selectedNodes,
          nodeStyles[1] as NodeAppearance
        );

        model.assignStyledNodeCollection(selectedAndContextualizedNodes, {
          color: nodeStyles[3] as Color,
          outlineColor: NodeOutlineColor.White,
        });

        viewer?.on('click', async (event) => {
          const intersection = (await viewer.getIntersectionFromPixel(
            event.offsetX,
            event.offsetY
          )) as CadIntersection;
          if (intersection) {
            const nodeId = await model.mapTreeIndexToNodeId(
              intersection.treeIndex
            );

            const indexSelectedNodeSet = selectedNodes.getIndexSet();
            const indexContextualizedAndSelectedNodeSet =
              selectedAndContextualizedNodes.getIndexSet();

            const contextualizedNodeFound = mappedCadNodes.items.find(
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
              selectedNodeIdsList.splice(
                selectedNodeIdsList.indexOf(nodeId),
                1
              );
            }

            if (!selectedNodeFound && !contextualizedNodeFound) {
              indexSelectedNodeSet.add(intersection.treeIndex);
              selectedNodes.updateSet(indexSelectedNodeSet);
            } else if (selectedNodeFound && !contextualizedNodeFound) {
              indexSelectedNodeSet.remove(intersection.treeIndex);
              selectedNodes.updateSet(indexSelectedNodeSet);
            } else if (
              !selectedAndContextualizedNodeFound &&
              contextualizedNodeFound
            ) {
              indexContextualizedAndSelectedNodeSet.add(intersection.treeIndex);
              selectedAndContextualizedNodes.updateSet(
                indexContextualizedAndSelectedNodeSet
              );

              selectedAndContextualizedNodesList.push(nodeId);
            } else if (selectedAndContextualizedNodeFound) {
              indexContextualizedAndSelectedNodeSet.remove(
                intersection.treeIndex
              );
              selectedAndContextualizedNodes.updateSet(
                indexContextualizedAndSelectedNodeSet
              );
              selectedAndContextualizedNodesList.splice(
                selectedAndContextualizedNodesList.indexOf(nodeId),
                1
              );
            }
          }
        });
      }
    })();
  }, [viewer, model, modelType, sdk, modelId, revisionId]);

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

  const generateContextualization = (assetId: number) => {
    if (modelType === 'cad') {
      saveCdfThreeDCadContextualization({
        sdk,
        modelId,
        revisionId,
        nodeIds: selectedNodeIdsList,
        assetId,
      });
    }
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
