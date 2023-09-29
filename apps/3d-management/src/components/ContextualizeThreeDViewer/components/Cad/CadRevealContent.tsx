import { useEffect, useState } from 'react';

import styled from 'styled-components';

import { Button, ToolBar } from '@cognite/cogs.js';
import { DefaultCameraManager, CogniteModel } from '@cognite/reveal';
import {
  useReveal,
  withSuppressRevealEvents,
} from '@cognite/reveal-react-components';

import { FLOATING_ELEMENT_MARGIN } from '../../../../pages/ContextualizeEditor/constants';
import {
  onCloseResourceSelector,
  onOpenResourceSelector,
  setModel,
  setThreeDViewer,
  setToolbarForCadModelsState,
  useContextualizeThreeDViewerStore,
} from '../../useContextualizeThreeDViewerStore';

import { CadContextualizedFloatingToolBar } from './CadToolBar/CadContextualizedFloatingToolBar';
import { CadToolBar } from './CadToolBar/CadToolBar';

interface RevealContentProps {
  modelId: number;
  revisionId: number;
}

export const CadRevealContent = ({
  modelId,
  revisionId,
}: RevealContentProps) => {
  const viewer = useReveal();
  const { isResourceSelectorOpen, modelType } =
    useContextualizeThreeDViewerStore((state) => ({
      isResourceSelectorOpen: state.isResourceSelectorOpen,
      modelType: state.modelType,
    }));

  const [error, setError] = useState<Error>();

  const handleModelOnLoad = (_model: CogniteModel) => {
    if (!(viewer?.cameraManager instanceof DefaultCameraManager)) {
      console.warn(
        'Camera manager is not DefaultCameraManager, so click to change camera target will not work.'
      );
      return;
    }

    viewer.cameraManager.setCameraControlsOptions({
      changeCameraTargetOnClick: true,
      mouseWheelAction: 'zoomToCursor',
    });
    viewer.loadCameraFromModel(_model as CogniteModel);

    // force fit camera to the model with also some easing effect
    viewer.fitCameraToModel(_model);

    if (viewer.domElement) {
      setModel(_model);
    }
  };

  // Load the cad model to the viewer
  useEffect(() => {
    (async () => {
      if (!viewer) return;
      if (modelType !== 'cad') return;

      try {
        viewer.addModel({ modelId, revisionId }).then(handleModelOnLoad);

        setToolbarForCadModelsState();
      } catch (e) {
        if (e instanceof Error && viewer.domElement) {
          setError(e);
        }
        return;
      }
    })();
    // props.camera updates is not something that should trigger that hook
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewer, modelId, revisionId]);

  useEffect(() => {
    if (viewer) {
      setThreeDViewer(viewer);
    }
  }, [viewer]);

  if (error) {
    throw error;
  }

  return (
    <>
      <CadToolBar />
      <CadContextualizedFloatingToolBar
        modelId={modelId}
        revisionId={revisionId}
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
