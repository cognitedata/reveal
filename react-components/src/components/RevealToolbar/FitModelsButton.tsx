/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement, useCallback } from 'react';

import { Button, Tooltip as CogsTooltip, ExpandAlternativeIcon } from '@cognite/cogs.js';
import { useCameraNavigation } from '../../hooks/useCameraNavigation';
import { useTranslation } from '../i18n/I18n';

export const FitModelsButton = (): ReactElement => {
  const cameraNavigation = useCameraNavigation();
  const { t } = useTranslation();

  const updateCamera = useCallback(() => {
    cameraNavigation.fitCameraToAllModels();
  }, []);

  return (
    <CogsTooltip
      content={t('FIT_VIEW_TOOLTIP', 'Fit view')}
      placement="right"
      appendTo={document.body}>
      <Button
        type="ghost"
        icon=<ExpandAlternativeIcon />
        aria-label="Fit camera to models"
        onClick={updateCamera}
      />
    </CogsTooltip>
  );
};
