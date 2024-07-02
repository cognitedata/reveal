/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement, useCallback } from 'react';
import { Button, Tooltip as CogsTooltip, HomeIcon } from '@cognite/cogs.js';
import { useTranslation } from '../i18n/I18n';
import { useCameraNavigation } from '../../hooks/useCameraNavigation';
import { useSceneDefaultCamera } from '../../hooks/useSceneDefaultCamera';

type ResetCameraButtonProps = {
  sceneExternalId?: string;
  sceneSpaceId?: string;
};

export const ResetCameraButton = ({
  sceneExternalId,
  sceneSpaceId
}: ResetCameraButtonProps): ReactElement => {
  const { t } = useTranslation();
  const cameraNavigation = useCameraNavigation();
  const resetToDefaultSceneCamera = useSceneDefaultCamera(sceneExternalId, sceneSpaceId);

  const resetCameraToHomePosition = useCallback(() => {
    if (sceneExternalId !== undefined && sceneSpaceId !== undefined) {
      resetToDefaultSceneCamera.fitCameraToSceneDefault();
      return;
    }
    cameraNavigation.fitCameraToAllModels();
  }, [sceneExternalId, sceneSpaceId, cameraNavigation, resetToDefaultSceneCamera]);

  return (
    <CogsTooltip
      content={t('RESET_CAMERA_TO_HOME', 'Reset camera to home')}
      placement="right"
      appendTo={document.body}>
      <Button
        type="ghost"
        icon=<HomeIcon />
        aria-label="Reset camera to home"
        onClick={resetCameraToHomePosition}
      />
    </CogsTooltip>
  );
};
