/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement, useCallback } from 'react';

import { Button, Tooltip as CogsTooltip } from '@cognite/cogs.js';
import { useTranslation } from '../i18n/I18n';
import { useCameraFromScene } from '../../hooks/useCameraFromScene';

type ResetCameraButtonProps = {
  sceneExternalId: string;
  sceneSpaceId: string;
};

export const ResetCameraButton = ({
  sceneExternalId,
  sceneSpaceId
}: ResetCameraButtonProps): ReactElement => {
  const { t } = useTranslation();

  const resetCameraToHomePosition = useCallback(() => {
    useCameraFromScene(sceneExternalId, sceneSpaceId);
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
