import { useEffect, useState } from 'react';

import styled from 'styled-components';

import { Button, ToolBar } from '@cognite/cogs.js';
import {
  DefaultCameraManager,
  CogniteModel,
  CognitePointCloudModel,
} from '@cognite/reveal';
import {
  useReveal,
  withSuppressRevealEvents,
} from '@cognite/reveal-react-components';

import { FLOATING_ELEMENT_MARGIN } from '../../../../pages/ContextualizeEditor/constants';
import {
  onCloseResourceSelector,
  onOpenResourceSelector,
  setModel,
  setModelLoaded,
  setThreeDViewer,
  setToolbarForPointCloudModelsState,
  useContextualizeThreeDViewerStore,
} from '../../useContextualizeThreeDViewerStore';
import { AnnotationsCard } from '../AnnotationsCard';

import { PointCloudToolBar } from './PointCloudToolBar/PointCloudToolBar';

interface RevealContentProps {
  modelId: number;
  revisionId: number;
  onDeleteAnnotation: (annotationId: number) => void;
}

export const PointCloudRevealContent = ({
  modelId,
  revisionId,
  onDeleteAnnotation,
}: RevealContentProps) => {
  const viewer = useReveal();
  const { isResourceSelectorOpen, annotations, modelType } =
    useContextualizeThreeDViewerStore((state) => ({
      isResourceSelectorOpen: state.isResourceSelectorOpen,
      annotations: state.annotations,
      modelType: state.modelType,
    }));

  const [error, setError] = useState<Error>();

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

  // Load the PC model to the viewer
  useEffect(() => {
    (async () => {
      if (!viewer) return;
      if (modelType !== 'pointcloud') return;

      try {
        viewer
          .addPointCloudModel({ modelId, revisionId })
          .then(handleModelOnLoad);

        setToolbarForPointCloudModelsState();
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
      <AnnotationsCard
        annotations={annotations}
        onAnnotationDelete={(annotation) => {
          onDeleteAnnotation(annotation.id);
        }}
      />
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
