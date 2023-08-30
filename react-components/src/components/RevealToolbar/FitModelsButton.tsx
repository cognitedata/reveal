/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement, useCallback } from 'react';

import { Button, Tooltip as CogsTooltip } from '@cognite/cogs.js';
import { useCameraNavigation } from '../../hooks/useCameraNavigation';

export const FitModelsButton = (): ReactElement => {
  const cameraNavigation = useCameraNavigation();

  const updateCamera = useCallback(() => {
    cameraNavigation.fitCameraToAllModels();
  }, []);

  return (
    <CogsTooltip content={'Fit view'} placement="right" appendTo={document.body}>
      <Button
        type="ghost"
        icon="ExpandAlternative"
        aria-label="Fit camera to models"
        onClick={updateCamera}
      />
    </CogsTooltip>
  );
};
