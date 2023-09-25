import { useEffect } from 'react';

import styled from 'styled-components';

import { Splitter } from '@data-exploration/components';
import { ResourceSelector } from '@data-exploration/containers';
import { BoxGeometry, Color, Mesh, MeshBasicMaterial } from 'three';

import { RevealContainer } from '@cognite/reveal-react-components';
import { useSDK } from '@cognite/sdk-provider';

import {
  CONTEXTUALIZE_EDITOR_HEADER_HEIGHT,
  defaultRevealColor,
} from '../../pages/ContextualizeEditor/constants';

import { RevealContent } from './components/RevealContent';
import { useSyncStateWithViewer } from './hooks/useSyncStateWithViewer';
import {
  setModelId,
  setPendingAnnotation,
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
      return;
    }

    const pointCloudModel = getCognitePointCloudModel({
      modelId,
      viewer: threeDViewer,
    });
    if (pointCloudModel === undefined) {
      return;
    }

    if (pendingAnnotation === null) {
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
        setPendingAnnotation(null);
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
      <StyledSplitter secondaryInitialSize={700}>
        <ThreeDViewerStyled>
          <RevealContainer sdk={sdk} color={defaultRevealColor}>
            <RevealContent modelId={modelId} revisionId={revisionId} />
          </RevealContainer>
        </ThreeDViewerStyled>

        {isResourceSelectorOpen && (
          <ResourceSelector
            selectionMode="single"
            visibleResourceTabs={['asset']}
            shouldDisableAddButton={pendingAnnotation === null}
            onSelect={(item) => {
              saveAnnotationToCdf(item.id);
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
