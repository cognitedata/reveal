import { useEffect, useState } from 'react';

import styled from 'styled-components';

import { Button, ToolBar } from '@cognite/cogs.js';
import { DefaultCameraManager, CogniteModel } from '@cognite/reveal';
import {
  PointCloudContainer,
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
  useContextualizeThreeDViewerStorePointCloud,
} from '../../useContextualizeThreeDViewerStorePointCloud';
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

  const [error, setError] = useState<Error>();

  const { isResourceSelectorOpen, annotations } =
    useContextualizeThreeDViewerStorePointCloud((state) => ({
      isResourceSelectorOpen: state.isResourceSelectorOpen,
      annotations: state.annotations,
    }));

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

    if (viewer.domElement) {
      setModel(model);
    }
  };

  const handleLoadError = (e: Error) => {
    if (e instanceof Error && viewer.domElement) {
      throw error;
    }
  };

  useEffect(() => {
    if (viewer) {
      setThreeDViewer(viewer);
    }
  }, [viewer]);

  return (
    <>
      <PointCloudToolBar onDeleteAnnotation={onDeleteAnnotation} />
      <PointCloudContainer
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
  right: ${FLOATING_ELEMENT_MARGIN}px;
  /* The 3px is to vertically align it with the splitter handle */
  top: calc(50% + 3px);
`;
