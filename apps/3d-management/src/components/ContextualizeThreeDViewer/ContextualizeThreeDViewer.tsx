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
  useContextualizeThreeDViewerStore,
} from './useContextualizeThreeDViewerStore';
import { createCdfThreeDAnnotation } from './utils/createCdfThreeDAnnotation';
import { getCogniteCadModel } from './utils/getCogniteCadModel';
import { getCognitePointCloudModel } from './utils/getCognitePointCloudModel';

type ContextualizeThreeDViewerProps = {
  modelId: number;
  revisionId: number;
};

export const ContextualizeThreeDViewer = ({
  modelId,
  revisionId,
}: ContextualizeThreeDViewerProps) => {
  const sdk = useSDK();

  // let model: CogniteCadModel | CognitePointCloudModel | undefined;
  const model = useRef<CogniteCadModel | CognitePointCloudModel | undefined>();

  const { isResourceSelectorOpen, pendingAnnotation, viewer } =
    useContextualizeThreeDViewerStore((state) => ({
      isResourceSelectorOpen: state.isResourceSelectorOpen,
      pendingAnnotation: state.pendingAnnotation,
      viewer: state.threeDViewer,
    }));

  // use effects
  useEffect(() => {
    setModelId(modelId);
  }, [modelId]);

  useEffect(() => {
    (async () => {
      if (viewer === null || model.current == null) {
        return;
      }

      const modelType = await viewer.determineModelType(modelId, revisionId);
      switch (modelType) {
        case 'cad': {
          model.current = getCogniteCadModel({
            modelId,
            viewer: viewer,
          });
          const cadModel = model.current as CogniteCadModel;

          const selectedNodes = new TreeIndexNodeCollection();
          cadModel.assignStyledNodeCollection(
            selectedNodes,
            DefaultNodeAppearance.Highlighted
          );

          viewer.on('click', async (event) => {
            const intersection = (await viewer.getIntersectionFromPixel(
              event.offsetX,
              event.offsetY
            )) as CadIntersection;
            if (intersection) {
              const nodeId = await cadModel.mapTreeIndexToNodeId(
                intersection.treeIndex
              );
              const toPresent = {
                treeIndex: intersection.treeIndex,
                nodeId,
                point: intersection.point,
              };
              selectedNodes.updateSet(new IndexSet([intersection.treeIndex]));
            }
          });
          break;
        }
        case 'pointcloud': {
          model.current = getCognitePointCloudModel({
            modelId,
            viewer: viewer,
          });
          break;
        }
        default: {
          throw new Error(`Unsupported model type ${modelType}`);
        }
      }
    })();
  }, [modelId, revisionId, viewer]);

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
      model.current == null ||
      !(model.current instanceof CognitePointCloudModel) ||
      pendingAnnotation == null
    ) {
      return;
    }
    const pointCloudModel = model.current;

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

  return (
    <>
      <StyledSplitter>
        <ThreeDViewerStyled>
          <RevealContainer sdk={sdk} color={defaultRevealColor}>
            <RevealContent modelId={modelId} revisionId={revisionId} />
          </RevealContainer>
        </ThreeDViewerStyled>
        {viewer && model.current && (
          <ThreeDViewerSidebar
            viewer={viewer}
            model={model.current}
            nodesClickable={true}
          />
        )}
        {isResourceSelectorOpen && (
          <ResourceSelector
            selectionMode="single"
            visibleResourceTabs={['asset']}
            onSelect={(item) => {
              onCloseResourceSelector();
              saveAnnotationToCdf(item.id);
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
