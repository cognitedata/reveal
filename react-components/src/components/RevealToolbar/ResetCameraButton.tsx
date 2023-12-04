/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement, useCallback } from 'react';

import { Button, Tooltip as CogsTooltip } from '@cognite/cogs.js';
import { useCameraNavigation } from '../../hooks/useCameraNavigation';
import { useTranslation } from '../i18n/I18n';

export const ResetCameraButton = (): ReactElement => {
  const cameraNavigation = useCameraNavigation();
  const { t } = useTranslation();

  const resetCameraToHomePosition = useCallback(() => {
    // TODO: Replace this with scene config default camera position
    cameraNavigation.fitCameraToAllModels();
  }, []);

  return (
    <CogsTooltip
      content={t('RESET_CAMERA_TO_HOME', 'Reset camera to home')}
      placement="right"
      appendTo={document.body}>
      <Button
        type="ghost"
        icon="Restore"
        aria-label="Reset camera to home"
        onClick={resetCameraToHomePosition}
      />
    </CogsTooltip>
  );
};
