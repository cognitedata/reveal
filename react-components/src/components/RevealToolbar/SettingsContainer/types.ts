/*!
 * Copyright 2023 Cognite AS
 */

import { type Dispatch, type SetStateAction, type ReactElement } from 'react';
import { type DeepPartial } from '../../../utilities/DeepPartial';

export type HighFidelityProps = {
  isHighFidelityMode: boolean;
  setHighFidelityMode: Dispatch<SetStateAction<boolean>>;
  defaultsFidelityConfig: QualityConfig;
  customHighFidelityConfig?: DeepPartial<QualityConfig>;
};

export type SettingsContainerProps = HighFidelityProps & {
  customSettingsContent?: ReactElement;
};

export type QualityConfig = {
  cadBudget: {
    highDetailProximityThreshold: number;
    maximumRenderCost: number;
  };
  pointCloudBudget: {
    numberOfPoints: number;
  };
  resolutionOptions: {
    maxRenderResolution: number;
    movingCameraResolutionFactor: number;
  };
};
