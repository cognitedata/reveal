import { useEffect } from 'react';

import styled from 'styled-components';

import { Splitter } from '@data-exploration/components';
import { ResourceSelector } from '@data-exploration/containers';
import { BoxGeometry, Color, Mesh, MeshBasicMaterial } from 'three';

import { ToolBar } from '@cognite/cogs.js';
import {
  RevealContainer,
  PointCloudContainer,
  RevealToolbar,
} from '@cognite/reveal-react-components';
import { useSDK } from '@cognite/sdk-provider';

import { CONTEXTUALIZE_EDITOR_HEADER_HEIGHT } from '../../pages/ContextualizeEditor/constants';

import { ContextualizeThreeDViewerToolbar } from './ContextualizeThreeDViewerToolbar';
import { useSyncStateWithViewer } from './hooks/useSyncStateWithViewer';
import {
  onCloseResourceSelector,
  setModelId,
  useContextualizeThreeDViewerStore,
} from './useContextualizeThreeDViewerStore';
import { createCdfThreeDAnnotation } from './utils/createCdfThreeDAnnotation';
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

  const { isResourceSelectorOpen, pendingAnnotation, threeDViewer } =
    useContextualizeThreeDViewerStore((state) => ({
      isResourceSelectorOpen: state.isResourceSelectorOpen,
      pendingAnnotation: state.pendingAnnotation,
      threeDViewer: state.threeDViewer,
    }));

  useEffect(() => {
    setModelId(modelId);
  }, [modelId]);

  useSyncStateWithViewer();

  const saveAnnotationToCdf = (assetId: number) => {
    // TODO: All of these console.warn should be presented nicely to the user.
    // Tracked by: https://cognitedata.atlassian.net/browse/BND3D-2168
    if (threeDViewer === null) {
      console.warn('Unable to save annotation to CDF. Viewer not loaded.');
      return;
    }

    const pointCloudModel = getCognitePointCloudModel({
      modelId,
      viewer: threeDViewer,
    });
    if (pointCloudModel === undefined) {
      console.warn(
        'Unable to save annotation to CDF. Point cloud model not loaded.'
      );
      return;
    }

    if (pendingAnnotation === null) {
      console.warn('Unable to save annotation to CDF. No annotation pending.');
      return;
    }

    createCdfThreeDAnnotation({
      sdk,
      modelId,
      assetRefId: assetId,
      pointCloudModel,
      position: pendingAnnotation.position,
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
    threeDViewer.addObject3D(newSavedAnnotation);
  };

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

  return (
    <>
      <StyledSplitter>
        <ThreeDViewerStyled>
          <RevealContainer color={new Color(0x4a4a4a)} sdk={sdk}>
            <PointCloudContainer
              addModelOptions={{
                modelId: modelId,
                revisionId: revisionId,
              }}
            />

            {/* TODO: There is a bug in the event listening with the toolbar. When you click on the toolbar, Reveal also listen to the click.
                      This causes for instance a annotation to be created if the toolbar is clicked when the cursor is over the model.
                      Tracked by: https://cognitedata.atlassian.net/browse/BND3D-2156
            */}
            <StyledToolBar>
              <RevealToolbar.FitModelsButton />
              <ContextualizeThreeDViewerToolbar modelId={modelId} />
            </StyledToolBar>
          </RevealContainer>
        </ThreeDViewerStyled>

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

const StyledToolBar = styled(ToolBar)`
  position: absolute;
  left: 30px;
  bottom: 30px;
`;

const StyledSplitter = styled(Splitter)`
  height: calc(
    100vh - var(--cdf-ui-navigation-height) -
      ${CONTEXTUALIZE_EDITOR_HEADER_HEIGHT}px
  );
`;
