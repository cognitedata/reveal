import React, { useEffect } from 'react';

import { Cognite3DViewer, DefaultCameraManager } from '@cognite/reveal';

type MouseWheelActionProps = {
  isAssetSelected?: boolean;
  viewer: Cognite3DViewer;
};

const MouseWheelAction = ({
  isAssetSelected,
  viewer,
}: MouseWheelActionProps): JSX.Element => {
  useEffect(() => {
    const cameraManager = viewer.cameraManager as DefaultCameraManager;
    cameraManager.setCameraControlsOptions({
      mouseWheelAction: 'zoomToCursor',
    });
  }, [isAssetSelected, viewer]);

  return <></>;
};

export default MouseWheelAction;
