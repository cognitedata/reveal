import { useCallback, useEffect, useState } from 'react';

import styled from 'styled-components';

import { ToolBar } from '@cognite/cogs.js';
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

import {
  HighQualitySettings,
  LowQualitySettings,
} from '../../../pages/ContextualizeEditor/constants';
import { ContextualizeThreeDViewerToolbar } from '../ContextualizeThreeDViewerToolbar';
import { ColorTypeSelector } from '../utils/PointCloudColorPicker';

interface RevealContentProps {
  modelId: number;
  revisionId: number;
}

export const RevealContent = ({ modelId, revisionId }: RevealContentProps) => {
  const viewer = useReveal();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [model, setModel] = useState<
    CogniteCadModel | CognitePointCloudModel
  >();
  const [error, setError] = useState<Error>();

  const handleOnLoad = (_model: CogniteModel) => {
    if (!(viewer.cameraManager instanceof DefaultCameraManager)) {
      console.warn(
        'Camera manager is not DefaultCameraManager, so click to change camera target will not work.'
      );
      return;
    }

    (viewer.cameraManager as DefaultCameraManager).setCameraControlsOptions({
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
            break;
          }
          case 'pointcloud': {
            viewer
              .addPointCloudModel({ modelId, revisionId })
              .then(handleOnLoad);
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
        <RevealToolbar.FitModelsButton />
        <ContextualizeThreeDViewerToolbar modelId={modelId} />
        <RevealToolbar.SettingsButton
          customSettingsContent={ColorTypeSelector({
            onChange: handleColorChange,
          })}
          lowQualitySettings={LowQualitySettings}
          highQualitySettings={HighQualitySettings}
        />
      </StyledToolBar>
    </>
  );
};

const StyledToolBar = styled(withSuppressRevealEvents(ToolBar))`
  position: absolute;
  left: 30px;
  bottom: 30px;
`;
