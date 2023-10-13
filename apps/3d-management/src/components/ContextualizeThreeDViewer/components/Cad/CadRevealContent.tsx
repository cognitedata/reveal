import { useEffect } from 'react';

import styled from 'styled-components';

import { Color } from 'three';

import { Button, ToolBar } from '@cognite/cogs.js';
import { DefaultCameraManager, CogniteModel } from '@cognite/reveal';
import {
  CadModelContainer,
  useReveal,
  withSuppressRevealEvents,
} from '@cognite/reveal-react-components';

import { FLOATING_ELEMENT_MARGIN } from '../../../../pages/ContextualizeEditor/constants';

import { CadAnnotationsCard } from './CadAnnotationsCard';
import { CadToolBar } from './CadToolBar/CadToolBar';
import {
  onCloseResourceSelector,
  onOpenResourceSelector,
  setModelLoaded,
  setThreeDViewer,
  useCadContextualizeStore,
} from './useCadContextualizeStore';

type RevealContentProps = {
  modelId: number;
  revisionId: number;
};

export const CadRevealContent = ({
  modelId,
  revisionId,
}: RevealContentProps) => {
  const viewer = useReveal();
  const { isResourceSelectorOpen } = useCadContextualizeStore((state) => ({
    isResourceSelectorOpen: state.isResourceSelectorOpen,
  }));

  const handleOnClickResourceSelector = () => {
    if (isResourceSelectorOpen) {
      onCloseResourceSelector();
      return;
    }
    onOpenResourceSelector();
  };

  const handleModelOnLoad = (model: CogniteModel) => {
    setModelLoaded();

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
        styling={{
          defaultStyle: {
            color: new Color('#efefef'),
          },
        }}
        onLoad={handleModelOnLoad}
      />

      <StyledResourceSelectorButtonWrapper>
        <Button
          type="ghost"
          size="small"
          icon={isResourceSelectorOpen ? 'ChevronRight' : 'ChevronLeft'}
          aria-label="Toggle resource selector visibility"
          onClick={handleOnClickResourceSelector}
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