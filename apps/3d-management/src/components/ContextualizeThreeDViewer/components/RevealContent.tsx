import styled from 'styled-components';

import { Button, ToolBar } from '@cognite/cogs.js';
import { DefaultCameraManager, CogniteModel } from '@cognite/reveal';
import {
  useReveal,
  PointCloudContainer,
  withSuppressRevealEvents,
} from '@cognite/reveal-react-components';

import { FLOATING_ELEMENT_MARGIN } from '../../../pages/ContextualizeEditor/constants';
import {
  onCloseResourceSelector,
  onOpenResourceSelector,
  setModelLoaded,
  useContextualizeThreeDViewerStore,
} from '../useContextualizeThreeDViewerStore';

import { PointCloudToolBar } from './PointCloudToolBar/PointCloudToolBar';

interface RevealContentProps {
  modelId: number;
  revisionId: number;
}

export const RevealContent = ({ modelId, revisionId }: RevealContentProps) => {
  const viewer = useReveal();
  const { isResourceSelectorOpen } = useContextualizeThreeDViewerStore(
    (state) => ({
      isResourceSelectorOpen: state.isResourceSelectorOpen,
    })
  );

  const handleModelOnLoad = (model: CogniteModel) => {
    setModelLoaded();
    viewer.fitCameraToModel(model);
    if (!(viewer.cameraManager instanceof DefaultCameraManager)) {
      console.warn(
        'Camera manager is not DefaultCameraManager, so click to change camera target will not work.'
      );
      return;
    }

    viewer.cameraManager.setCameraControlsOptions({
      changeCameraTargetOnClick: true,
      mouseWheelAction: 'zoomToCursor',
    });
  };

  return (
    <>
      <PointCloudContainer
        addModelOptions={{
          modelId: modelId,
          revisionId: revisionId,
        }}
        onLoad={handleModelOnLoad}
      />

      <PointCloudToolBar />

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
