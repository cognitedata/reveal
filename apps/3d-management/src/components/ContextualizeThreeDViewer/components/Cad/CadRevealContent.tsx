import { useEffect } from 'react';

import styled from 'styled-components';

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
  setThreeDViewer,
  useContextualizeThreeDViewerStoreCad,
} from '../../useContextualizeThreeDViewerStoreCad';

import { CadAnnotationsCard } from './CadAnnotationsCard';
import { CadToolBar } from './CadToolBar/CadToolBar';

type RevealContentProps = {
  modelId: number;
  revisionId: number;
};

export const CadRevealContent = ({
  modelId,
  revisionId,
}: RevealContentProps) => {
  const viewer = useReveal();
  const { isResourceSelectorOpen } = useContextualizeThreeDViewerStoreCad(
    (state) => ({
      isResourceSelectorOpen: state.isResourceSelectorOpen,
    })
  );

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
  };

  useEffect(() => {
    setThreeDViewer(viewer);
  }, [viewer]);

  return (
    <>
      <CadToolBar />
      <CadModelContainer
        addModelOptions={{
          modelId: modelId,
          revisionId: revisionId,
        }}
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
      <CadAnnotationsCard />
    </>
  );
};

const StyledResourceSelectorButtonWrapper = styled(
  withSuppressRevealEvents(ToolBar)
)`
  position: absolute;
  right: ${FLOATING_ELEMENT_MARGIN}px;
  /* The 3px is to vertically align it with the splitter handle */
  top: calc(50% + 3px);
`;
