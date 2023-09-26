import { useEffect } from 'react';

import styled from 'styled-components';

import ThreeDViewerSidebar from '@3d-management/pages/RevisionDetails/components/ThreeDViewerSidebar';
import { Splitter } from '@data-exploration/components';
import { ResourceSelector } from '@data-exploration/containers';
import { BoxGeometry, Color, Mesh, MeshBasicMaterial } from 'three';

import {
  CadIntersection,
  CogniteCadModel,
  CognitePointCloudModel,
  DefaultNodeAppearance,
  TreeIndexNodeCollection,
} from '@cognite/reveal';
import { RevealContainer } from '@cognite/reveal-react-components';
import { useSDK } from '@cognite/sdk-provider';

import {
  CONTEXTUALIZE_EDITOR_HEADER_HEIGHT,
  DEFAULT_RIGHT_SIDE_PANEL_WIDTH,
  defaultRevealColor,
} from '../../pages/ContextualizeEditor/constants';
import { useLocalStorage } from '../../utils/useLocalStorage';

import { RevealContent } from './components/RevealContent';
import { useSyncStateWithViewer } from './hooks/useSyncStateWithViewer';
import {
  setModelId,
  setSelectedNodeIdsList,
  setPendingAnnotation,
  useContextualizeThreeDViewerStore,
  setAnnotations,
  onCloseResourceSelector,
} from './useContextualizeThreeDViewerStore';
import { getCdfAnnotations } from './utils/annotations/annotationUtils';
import { createCdfThreeDAnnotation } from './utils/createCdfThreeDAnnotation';
import { createCdfThreeDAssetMapping } from './utils/createCdfThreeDAssetMapping';
import { updateStyleForContextualizedCadNodes } from './utils/updateStyleForContextualizedCadNodes';

type ContextualizeThreeDViewerProps = {
  modelId: number;
  revisionId: number;
};

export const ContextualizeThreeDViewer = ({
  modelId,
  revisionId,
}: ContextualizeThreeDViewerProps) => {
  const sdk = useSDK();

  const {
    isResourceSelectorOpen,
    pendingAnnotation,
    viewer,
    model,
    modelType,
    selectedNodeIdsList,
  } = useContextualizeThreeDViewerStore((state) => ({
    isResourceSelectorOpen: state.isResourceSelectorOpen,
    pendingAnnotation: state.pendingAnnotation,
    viewer: state.threeDViewer,
    model: state.model,
    modelType: state.modelType,
    selectedNodeIdsList: state.selectedNodeIdsList,
  }));

  const [rightSidePanelWidth, setRightSidePanelWidth] = useLocalStorage(
    'COGNITE_CONTEXTUALIZE_EDITOR_RESOURCE_SELECTOR_WIDTH',
    DEFAULT_RIGHT_SIDE_PANEL_WIDTH
  );

  // use effects
  useEffect(() => {
    setModelId(modelId);
  }, [modelId]);

  useEffect(() => {
    const loadAnnotations = async () => {
      const annotations = await getCdfAnnotations(sdk, modelId);
      setAnnotations(annotations);
    };
    loadAnnotations();
  }, [sdk, modelId]);

  useEffect(() => {
    (async () => {
      if (!model || !(model instanceof CogniteCadModel)) return;

      if (modelType === 'cad') {
        // get the contextualized 3d nodes and update the style of each node
        updateStyleForContextualizedCadNodes({
          sdk,
          model,
          modelId,
          revisionId,
        });

        const selectedNodes = new TreeIndexNodeCollection();
        //const selectedNodeIds: Array<number> = [];
        model.assignStyledNodeCollection(
          selectedNodes,
          DefaultNodeAppearance.Highlighted
        );
        viewer?.on('click', async (event) => {
          const intersection = (await viewer.getIntersectionFromPixel(
            event.offsetX,
            event.offsetY
          )) as CadIntersection;
          if (intersection) {
            const nodeId = await model.mapTreeIndexToNodeId(
              intersection.treeIndex
            );

            const indexSet = selectedNodes.getIndexSet();
            const selectedNodesList: Array<number> = [];
            // toggle the selection of nodes
            if (!indexSet.contains(intersection.treeIndex)) {
              selectedNodesList.push(nodeId);
              indexSet.add(intersection.treeIndex);
              selectedNodes.updateSet(indexSet);
            } else {
              indexSet.remove(intersection.treeIndex);
              selectedNodes.updateSet(indexSet);
            }

            setSelectedNodeIdsList(selectedNodesList);
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

  useSyncStateWithViewer();

  const saveAnnotationToCdf = (assetId: number) => {
    // TODO: All of these console.warn should be presented nicely to the user.
    // Tracked by: https://cognitedata.atlassian.net/browse/BND3D-2168
    if (
      viewer == null ||
      model == null ||
      !(model instanceof CognitePointCloudModel) ||
      pendingAnnotation == null
    ) {
      return;
    }
    const pointCloudModel = model;

    createCdfThreeDAnnotation({
      position: pendingAnnotation.position,
      sdk,
      modelId,
      assetRefId: assetId,
      pointCloudModel,
    });

    // TODO: This is just a temporary place to add the visualized saved annotations.
    //       We want to store the saved annotation in the same way we store the pending annotation in the useContextualizeThreeDViewerStore.
    //       In that way, it would be much easier to show all of the annotations in the viewer, not only the one created in the current session.
    // Tracked by: https://cognitedata.atlassian.net/browse/BND3D-2169
    const newSavedAnnotation = new Mesh(
      new BoxGeometry(2, 2, 2),
      new MeshBasicMaterial({
        color: new Color(0, 1, 0),
        transparent: true,
        opacity: 0.5,
      })
    );
    newSavedAnnotation.position.set(
      pendingAnnotation.position.x,
      pendingAnnotation.position.y,
      pendingAnnotation.position.z
    );
    viewer.addObject3D(newSavedAnnotation);
  };

  const saveAssetMapping = (nodeIds: Array<number>, assetId: number) => {
    nodeIds.forEach((nodeId: number) => {
      createCdfThreeDAssetMapping({
        sdk: sdk,
        modelId: modelId,
        revisionId: revisionId,
        assetRefId: assetId,
        nodeId: nodeId,
      });
    });
  };
  const createContextualization = (assetId: number) => {
    if (modelType === 'cad') {
      saveAssetMapping(selectedNodeIdsList, assetId);
    } else if (modelType === 'pointcloud') {
      saveAnnotationToCdf(assetId);
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
            <RevealContent modelId={modelId} revisionId={revisionId} />
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
            shouldDisableAddButton={pendingAnnotation === null}
            onSelect={(item) => {
              onCloseResourceSelector();
              createContextualization(item.id);
              setPendingAnnotation(null);
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
