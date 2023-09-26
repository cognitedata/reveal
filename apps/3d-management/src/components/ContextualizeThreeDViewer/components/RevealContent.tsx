import { useCallback, useEffect, useState } from 'react';

import styled from 'styled-components';

import { Button, ToolBar } from '@cognite/cogs.js';
import { DefaultCameraManager, CogniteModel } from '@cognite/reveal';
import {
  DefaultCameraManager,
  CogniteModel,
  PointColorType,
  CognitePointCloudModel,
  CogniteCadModel,
} from '@cognite/reveal';
import {
  useReveal,
  RevealToolbar,
  withSuppressRevealEvents,
} from '@cognite/reveal-react-components';

import { FLOATING_ELEMENT_MARGIN } from '../../../pages/ContextualizeEditor/constants';
import {
  HighQualitySettings,
  LowQualitySettings,
} from '../../../pages/ContextualizeEditor/constants';
import {
  onCloseResourceSelector,
  onOpenResourceSelector,
  useContextualizeThreeDViewerStore,
  setToolbarForCadModelsState,
  setToolbarForPointCloudModelsState,
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

  const handleOnLoad = (_model: CogniteModel) => {
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

  const handleColorChange = useCallback(
    (colorType: PointColorType) => {
      viewer.models.forEach((_model) => {
        if (!(_model instanceof CognitePointCloudModel)) return;
        _model.pointColorType = colorType;
      });
    },
    [viewer]
  );

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
            viewer.addModel({ modelId, revisionId }).then(handleOnLoad);

            setToolbarForCadModelsState();
            break;
          }
          case 'pointcloud': {
            viewer
              .addPointCloudModel({ modelId, revisionId })
              .then(handleOnLoad);

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
            <RevealToolbar.FitModelsButton />
          </>
        )}
        {!isToolbarForCadModels && isToolbarForPointCloudModels && viewer && (
          <>
            <RevealToolbar.FitModelsButton />
            <ContextualizeThreeDViewerToolbar modelId={modelId} />
            <RevealToolbar.SettingsButton
              customSettingsContent={
                <>
                  <ColorTypeSelector
                    onChange={handleColorChange}
                  ></ColorTypeSelector>
                  <PointSizeSlider viewer={viewer}></PointSizeSlider>
                </>
              }
              lowQualitySettings={LowQualitySettings}
              highQualitySettings={HighQualitySettings}
            />
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
