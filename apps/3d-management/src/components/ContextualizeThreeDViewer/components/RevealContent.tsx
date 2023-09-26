import { useEffect, useState } from 'react';

import styled from 'styled-components';

import { Button, ToolBar } from '@cognite/cogs.js';
import {
  DefaultCameraManager,
  CogniteModel,
  CognitePointCloudModel,
  CogniteCadModel,
} from '@cognite/reveal';
import {
  useReveal,
  withSuppressRevealEvents,
} from '@cognite/reveal-react-components';

import { FLOATING_ELEMENT_MARGIN } from '../../../pages/ContextualizeEditor/constants';
import {
  onCloseResourceSelector,
  onOpenResourceSelector,
  setToolbarForCadModelsState,
  setToolbarForPointCloudModelsState,
  useContextualizeThreeDViewerStore,
} from '../useContextualizeThreeDViewerStore';

import { CadToolBar } from './CadToolBar/CadToolBar';
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [model, setModel] = useState<
    CogniteCadModel | CognitePointCloudModel
  >();
  const [error, setError] = useState<Error>();

  const { isToolbarForCadModels, isToolbarForPointCloudModels } =
    useContextualizeThreeDViewerStore((state) => ({
      isToolbarForCadModels: state.isToolbarForCadModels,
      isToolbarForPointCloudModels: state.isToolbarForPointCloudModels,
    }));

  const handleModelOnLoad = (_model: CogniteModel) => {
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
    viewer.models.forEach((_modelItem) => {
      if (!(_modelItem instanceof CognitePointCloudModel)) return;
      _modelItem.pointSize = 1.0;
    });
    viewer.loadCameraFromModel(_model as CogniteModel);

    // force fit camera to the model with also some easing effect
    viewer.fitCameraToModel(_model);

    if (viewer.domElement) {
      setModel(_model);
    }
  };

  // check the model type and load it
  useEffect(() => {
    (async () => {
      if (!viewer) {
        return;
      }
      try {
        const modelType = await viewer.determineModelType(modelId, revisionId);
        switch (modelType) {
          case 'cad': {
            viewer.addModel({ modelId, revisionId }).then(handleModelOnLoad);

            setToolbarForCadModelsState();
            break;
          }
          case 'pointcloud': {
            viewer
              .addPointCloudModel({ modelId, revisionId })
              .then(handleModelOnLoad);

            setToolbarForPointCloudModelsState();
            break;
          }
          default: {
            throw new Error(`Unsupported model type ${modelType}`);
          }
        }
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

  if (error) {
    throw error;
  }

  return (
    <>
      <StyledToolBar>
        {isToolbarForCadModels && !isToolbarForPointCloudModels && viewer && (
          <>
            <CadToolBar />
          </>
        )}
        {!isToolbarForCadModels && isToolbarForPointCloudModels && viewer && (
          <>
            <PointCloudToolBar />
          </>
        )}
      </StyledToolBar>
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

const StyledToolBar = styled(withSuppressRevealEvents(ToolBar))`
  position: absolute;
  left: 30px;
  bottom: 30px;
`;
