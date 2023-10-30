import { useEffect } from 'react';

import styled from 'styled-components';

import { Color } from 'three';

import { Button, ToolBar } from '@cognite/cogs.js';
import { DefaultCameraManager, CogniteCadModel } from '@cognite/reveal';
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
  setModel,
  setModelLoaded,
  setThreeDViewer,
  useCadContextualizeStore,
} from './useCadContextualizeStore';

type RevealContentProps = {
  modelId: number;
  revisionId: number;
  onDeleteAnnotation: (annotationByAssetId: number) => void;
  onZoomToAnnotation: (annotationByAssetId: number) => void;
};

export const CadRevealContent = ({
  modelId,
  revisionId,
  onDeleteAnnotation,
  onZoomToAnnotation,
}: RevealContentProps) => {
  const viewer = useReveal();
  const { isResourceSelectorOpen, contextualizedNodes } =
    useCadContextualizeStore((state) => ({
      isResourceSelectorOpen: state.isResourceSelectorOpen,
      contextualizedNodes: state.contextualizedNodes,
    }));

  const handleOnClickResourceSelector = () => {
    if (isResourceSelectorOpen) {
      onCloseResourceSelector();
      return;
    }
    onOpenResourceSelector();
  };

  const handleModelOnLoad = (modelLoaded: CogniteCadModel) => {
    setModelLoaded();
    setModel(modelLoaded);
    if (!(viewer?.cameraManager instanceof DefaultCameraManager)) {
      console.warn(
        'Camera manager is not DefaultCameraManager, so click to change camera target will not work.'
      );
      return;
    }
    viewer.loadCameraFromModel(modelLoaded);
    viewer.fitCameraToModel(modelLoaded);
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
      <CadAnnotationsCard
        annotations={contextualizedNodes}
        onDeleteAnnotation={(annotationByAssetId) => {
          onDeleteAnnotation(annotationByAssetId);
        }}
        onZoomToAnnotation={onZoomToAnnotation}
      />
    </>
  );
};

const StyledResourceSelectorButtonWrapper = styled(
  withSuppressRevealEvents(ToolBar)
)`
  position: absolute;
  right: ${FLOATING_ELEMENT_MARGIN}px;
  /* The 2px is to vertically align it with the splitter handle */
  top: calc(50% - 2px);
`;
