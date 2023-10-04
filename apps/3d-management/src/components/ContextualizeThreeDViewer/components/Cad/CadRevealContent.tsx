import { useEffect, useState } from 'react';

import styled from 'styled-components';

import { noop } from 'lodash';

import { Button, ToolBar } from '@cognite/cogs.js';
import { DefaultCameraManager, CogniteModel } from '@cognite/reveal';
import {
  CadModelContainer,
  useReveal,
  withSuppressRevealEvents,
} from '@cognite/reveal-react-components';

import { FLOATING_ELEMENT_MARGIN } from '../../../../pages/ContextualizeEditor/constants';
import {
  onCloseResourceSelector,
  onOpenResourceSelector,
  setModel,
  setThreeDViewer,
  useContextualizeThreeDViewerStoreCad,
} from '../../useContextualizeThreeDViewerStoreCad';

import { CadToolBar } from './CadToolBar/CadToolBar';

interface RevealContentProps {
  modelId: number;
  revisionId: number;
  onContextualizationDeletionRequest: typeof noop;
}

export const CadRevealContent = ({
  modelId,
  revisionId,
  onContextualizationDeletionRequest,
}: RevealContentProps) => {
  const viewer = useReveal();
  const { isResourceSelectorOpen } = useContextualizeThreeDViewerStoreCad(
    (state) => ({
      isResourceSelectorOpen: state.isResourceSelectorOpen,
    })
  );

  const [error, setError] = useState<Error>();

  const handleModelOnLoad = (model: CogniteModel) => {
    if (!(viewer?.cameraManager instanceof DefaultCameraManager)) {
      console.warn(
        'Camera manager is not DefaultCameraManager, so click to change camera target will not work.'
      );
      return;
    }
    viewer.loadCameraFromModel(model);
    viewer.fitCameraToModel(model);
    viewer.cameraManager.setCameraControlsOptions({
      changeCameraTargetOnClick: true,
      mouseWheelAction: 'zoomToCursor',
    });

    // setToolbarForCadModelsState();

    if (viewer.domElement) {
      setModel(model);
    }
  };

  useEffect(() => {
    if (viewer) {
      setThreeDViewer(viewer);
    }
  }, [viewer]);

  const handleLoadError = (e: Error) => {
    if (e instanceof Error && viewer.domElement) {
      throw error;
    }
  };

  return (
    <>
      <CadToolBar
        modelId={modelId}
        revisionId={revisionId}
        onContextualizationDeletionRequest={() => {
          onContextualizationDeletionRequest();
        }}
      />
      <CadModelContainer
        addModelOptions={{
          modelId: modelId,
          revisionId: revisionId,
        }}
        onLoadError={(options, e) => handleLoadError(e)}
        onLoad={handleModelOnLoad}
      />

      <StyledResourceSelectorButtonWrapper>
        <Button
          type="ghost"
          size="small"
          icon={isResourceSelectorOpen ? 'ChevronRight' : 'ChevronLeft'}
          aria-label="Toggle resource selector visibility"
          onClick={() => {
            if (isResourceSelectorOpen) {
              onCloseResourceSelector();
              return;
            }
            onOpenResourceSelector();
          }}
        />
      </StyledResourceSelectorButtonWrapper>
    </>
  );
};

const StyledResourceSelectorButtonWrapper = styled(
  withSuppressRevealEvents(ToolBar)
)`
  position: absolute;
  top: ${FLOATING_ELEMENT_MARGIN}px;
  right: ${FLOATING_ELEMENT_MARGIN}px;
`;
