import { useEffect, useRef } from 'react';

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
  IndexSet,
  TreeIndexNodeCollection,
} from '@cognite/reveal';
import { RevealContainer } from '@cognite/reveal-react-components';
import { useSDK } from '@cognite/sdk-provider';

import {
  CONTEXTUALIZE_EDITOR_HEADER_HEIGHT,
  defaultRevealColor,
} from '../../pages/ContextualizeEditor/constants';

import { RevealContent } from './components/RevealContent';
import { useSyncStateWithViewer } from './hooks/useSyncStateWithViewer';
import {
  onCloseResourceSelector,
  setModelId,
  setSelectedNodes,
  useContextualizeThreeDViewerStore,
} from './useContextualizeThreeDViewerStore';
import { createCdfThreeDAnnotation } from './utils/createCdfThreeDAnnotation';
import { createCdfThreeDAssetMapping } from './utils/createCdfThreeDAssetMapping';

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
    selectedNodeIds,
  } = useContextualizeThreeDViewerStore((state) => ({
    isResourceSelectorOpen: state.isResourceSelectorOpen,
    pendingAnnotation: state.pendingAnnotation,
    viewer: state.threeDViewer,
    model: state.model,
    modelType: state.modelType,
    selectedNodeIds: state.selectedNodes,
  }));

  // use effects
  useEffect(() => {
    setModelId(modelId);
  }, [modelId]);

  useEffect(() => {
    (async () => {
      if (!model || !(model instanceof CogniteCadModel)) return;

      const selectedNodes = new TreeIndexNodeCollection();
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
          const toPresent = {
            treeIndex: intersection.treeIndex,
            nodeId,
            point: intersection.point,
          };
          selectedNodes.updateSet(new IndexSet([intersection.treeIndex]));

          setSelectedNodes([nodeId]);
        }
      });
    })();
  }, [viewer, model]);

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
      saveAssetMapping(selectedNodeIds, assetId);
    } else if (modelType === 'pointcloud') {
      saveAnnotationToCdf(assetId);
    }
  };
  return (
    <>
      <StyledSplitter>
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
            onSelect={(item) => {
              onCloseResourceSelector();
              createContextualization(item.id);
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
