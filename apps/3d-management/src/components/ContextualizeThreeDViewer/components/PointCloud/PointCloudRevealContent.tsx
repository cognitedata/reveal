import { FC, useCallback, useEffect } from 'react';

import styled from 'styled-components';

import { Button, ToolBar } from '@cognite/cogs.js';
import {
  DefaultCameraManager,
  CogniteModel,
  Cognite3DViewer,
} from '@cognite/reveal';
import {
  useReveal,
  PointCloudContainer,
  withSuppressRevealEvents,
} from '@cognite/reveal-react-components';

import { FLOATING_ELEMENT_MARGIN } from '../../../../pages/ContextualizeEditor/constants';
import {
  onCloseResourceSelector,
  onOpenResourceSelector,
  setModelLoaded,
  setSelectedAnnotationId,
  setTool,
  ToolType,
  useContextualizeThreeDViewerStore,
} from '../../useContextualizeThreeDViewerStore';
import { AnnotationsCard } from '../AnnotationsCard';
import { SelectedAnnotationBoxToolbar } from '../SelectedAnnotationToolbar';

import { Annotations } from './Annotations';
import { useSyncStateWithViewerPointCloud } from './hooks/useSyncStateWithViewerPointCloud';
import { useZoomToAnnotation } from './hooks/useZoomToAnnotation';
import { PointCloudToolBar } from './PointCloudToolBar/PointCloudToolBar';

type SelectedAnnotationToolbarProps = {
  onDeleteAnnotation: (annotationId: number) => void;
  onUpdateCdfThreeDAnnotation: () => void;
};

const SelectedAnnotationToolbar: FC<SelectedAnnotationToolbarProps> = ({
  onDeleteAnnotation,
  onUpdateCdfThreeDAnnotation,
}: SelectedAnnotationToolbarProps) => {
  const { tool, selectedAnnotationId, transformMode } =
    useContextualizeThreeDViewerStore((state) => ({
      tool: state.tool,
      selectedAnnotationId: state.selectedAnnotationId,
      transformMode: state.transformMode,
    }));

  const handleDeleteClicked = useCallback(() => {
    if (selectedAnnotationId === null) {
      return;
    }
    setSelectedAnnotationId(null);
    onDeleteAnnotation(selectedAnnotationId);
  }, [selectedAnnotationId, onDeleteAnnotation]);

  if (tool !== ToolType.SELECT_TOOL || selectedAnnotationId === null) {
    return <></>;
  }

  return (
    <SelectedAnnotationBoxToolbar
      transformMode={transformMode}
      onUpdateCdfThreeDAnnotation={onUpdateCdfThreeDAnnotation}
      onDeleteClicked={handleDeleteClicked}
    />
  );
};

type RevealContentProps = {
  modelId: number;
  onDeleteAnnotation: (annotationId: number) => void;
  onSetViewerRef: (viewer: Cognite3DViewer) => void;
  onUpdateCdfThreeDAnnotation: () => void;
  revisionId: number;
};

export const PointCloudRevealContent = ({
  modelId,
  onDeleteAnnotation,
  onSetViewerRef,
  onUpdateCdfThreeDAnnotation,
  revisionId,
}: RevealContentProps) => {
  const viewer = useReveal();
  const { isResourceSelectorOpen, annotations } =
    useContextualizeThreeDViewerStore((state) => ({
      isResourceSelectorOpen: state.isResourceSelectorOpen,
      annotations: state.annotations,
      tool: state.tool,
    }));

  useEffect(() => {
    onSetViewerRef(viewer);
  }, [viewer, onSetViewerRef]);

  useSyncStateWithViewerPointCloud();

  const onZoomToAnnotation = useZoomToAnnotation();
  const onSelectAnnotation = (annotationId: number) => {
    setTool(ToolType.SELECT_TOOL);
    setSelectedAnnotationId(annotationId);
    onZoomToAnnotation(annotationId);
  };

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
        key={revisionId}
        addModelOptions={{
          modelId: modelId,
          revisionId: revisionId,
        }}
        onLoad={handleModelOnLoad}
      />

      <Annotations />

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
      <SelectedAnnotationToolbar
        onUpdateCdfThreeDAnnotation={onUpdateCdfThreeDAnnotation}
        onDeleteAnnotation={onDeleteAnnotation}
      />
      <AnnotationsCard
        annotations={annotations}
        onDeleteAnnotation={(annotation) => {
          onDeleteAnnotation(annotation.id);
        }}
        onSelectAnnotation={onSelectAnnotation}
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
