import { FC } from 'react';

import styled from 'styled-components';

import { head } from 'lodash';

import { Button, ToolBar } from '@cognite/cogs.js';
import { DefaultCameraManager, CogniteModel } from '@cognite/reveal';
import {
  useReveal,
  PointCloudContainer,
  withSuppressRevealEvents,
} from '@cognite/reveal-react-components';

import { FLOATING_ELEMENT_MARGIN } from '../../../../pages/ContextualizeEditor/constants';
import { useIntersectAnnotationVolumesOnClick } from '../../hooks/useIntersectAnnotationBoundsOnClick';
import {
  onCloseResourceSelector,
  onOpenResourceSelector,
  setModelLoaded,
  ToolType,
  useContextualizeThreeDViewerStore,
  setSelectedAnnotationId,
} from '../../useContextualizeThreeDViewerStore';
import { AnnotationsCard } from '../AnnotationsCard';
import { SelectedAnnotationBoxToolbar } from '../SelectedAnnotationToolbar';

import { PointCloudToolBar } from './PointCloudToolBar/PointCloudToolBar';

interface RevealContentProps {
  modelId: number;
  revisionId: number;
  onDeleteAnnotation: (annotationId: number) => void;
  onZoomToAnnotation: (annotationId: number) => void;
  onUpdateCdfThreeDAnnotation: () => void;
}

interface SelectedAnnotationToolbarProps {
  onUpdateCdfThreeDAnnotation: () => void;
}

const SelectedAnnotationToolbar: FC<SelectedAnnotationToolbarProps> = ({
  onUpdateCdfThreeDAnnotation,
}) => {
  const { tool, selectedAnnotationId, transformMode } =
    useContextualizeThreeDViewerStore((state) => ({
      tool: state.tool,
      selectedAnnotationId: state.selectedAnnotationId,
      transformMode: state.transformMode,
    }));

  if (tool !== ToolType.SELECT_TOOL || selectedAnnotationId === null) {
    return <></>;
  }

  return (
    <SelectedAnnotationBoxToolbar
      transformMode={transformMode}
      onUpdateCdfThreeDAnnotation={onUpdateCdfThreeDAnnotation}
    />
  );
};

export const PointCloudRevealContent = ({
  modelId,
  revisionId,
  onDeleteAnnotation,
  onZoomToAnnotation,
  onUpdateCdfThreeDAnnotation,
}: RevealContentProps) => {
  const viewer = useReveal();
  const { isResourceSelectorOpen, annotations, tool } =
    useContextualizeThreeDViewerStore((state) => ({
      isResourceSelectorOpen: state.isResourceSelectorOpen,
      annotations: state.annotations,
      tool: state.tool,
    }));

  useIntersectAnnotationVolumesOnClick(
    (intersectedAnnotationData) =>
      setSelectedAnnotationId(
        head(intersectedAnnotationData)?.annotationId ?? null
      ),
    { enabled: tool === ToolType.SELECT_TOOL }
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

      <PointCloudToolBar onDeleteAnnotation={onDeleteAnnotation} />

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
      <SelectedAnnotationToolbar
        onUpdateCdfThreeDAnnotation={onUpdateCdfThreeDAnnotation}
      />
      <AnnotationsCard
        annotations={annotations}
        onDeleteAnnotation={(annotation) => {
          onDeleteAnnotation(annotation.id);
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

  /* The 3px is to vertically align it with the splitter handle */
  top: calc(50% + 3px);
`;
