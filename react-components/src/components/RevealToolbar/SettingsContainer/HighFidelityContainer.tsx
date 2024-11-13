/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement, useState } from 'react';
import { Menu } from '@cognite/cogs-lab';
import { useReveal } from '../../RevealCanvas/ViewerContext';
import { type QualitySettings, type QualityProps } from './types';
import { type DataSourceType, type Cognite3DViewer } from '@cognite/reveal';
import { useTranslation } from '../../i18n/I18n';

const defaultLowFidelitySettings: QualitySettings = {
  cadBudget: {
    maximumRenderCost: 15_000_000,
    highDetailProximityThreshold: 10
  },
  pointCloudBudget: {
    numberOfPoints: 3_000_000
  },
  resolutionOptions: {
    maxRenderResolution: 1.4e6,
    movingCameraResolutionFactor: 1
  }
};

const defaultHighFidelitySettings: QualitySettings = {
  cadBudget: {
    maximumRenderCost: 45_000_000,
    highDetailProximityThreshold: 30
  },
  pointCloudBudget: {
    numberOfPoints: 12_000_000
  },
  resolutionOptions: {
    maxRenderResolution: Infinity,
    movingCameraResolutionFactor: 1
  }
};

export const HighFidelityContainer = ({
  lowQualitySettings,
  highQualitySettings
}: QualityProps): ReactElement => {
  const { t } = useTranslation();
  const viewer = useReveal();
  const [active, setActive] = useState(!isLowFidelity(viewer));

  const lowFidelityOptions: QualitySettings = {
    ...defaultLowFidelitySettings,
    ...lowQualitySettings
  };
  const highFidelityOptions: QualitySettings = {
    ...defaultHighFidelitySettings,
    ...highQualitySettings
  };

  const onClick = (): void => {
    const config = active ? lowFidelityOptions : highFidelityOptions;
    viewer.cadBudget = config.cadBudget;
    viewer.pointCloudBudget = config.pointCloudBudget;
    viewer.setResolutionOptions(config.resolutionOptions);
    setActive((prevState) => !prevState);
  };

  return (
    <Menu.ItemToggled
      toggled={active}
      label={t('HIGH_FIDELITY', 'High Fidelity')}
      onClick={onClick}></Menu.ItemToggled>
  );
};

function isLowFidelity(viewer: Cognite3DViewer<DataSourceType>): boolean {
  return (
    viewer.cadBudget.maximumRenderCost <= defaultLowFidelitySettings.cadBudget.maximumRenderCost &&
    viewer.pointCloudBudget.numberOfPoints <=
      defaultLowFidelitySettings.pointCloudBudget.numberOfPoints
  );
}
