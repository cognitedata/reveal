import { useCallback } from 'react';

import styled from 'styled-components';

import { ToolBar } from '@cognite/cogs.js';
import {
  DefaultCameraManager,
  CogniteModel,
  PointColorType,
  CognitePointCloudModel,
} from '@cognite/reveal';
import {
  useReveal,
  PointCloudContainer,
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

  const handleOnLoad = (model: CogniteModel) => {
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

  const handleColorChange = useCallback(
    (colorType: PointColorType) => {
      viewer.models.forEach((model) => {
        if (!(model instanceof CognitePointCloudModel)) return;
        model.pointColorType = colorType;
      });
    },
    [viewer]
  );

  return (
    <>
      <PointCloudContainer
        addModelOptions={{
          modelId: modelId,
          revisionId: revisionId,
        }}
        onLoad={handleOnLoad}
      />
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
