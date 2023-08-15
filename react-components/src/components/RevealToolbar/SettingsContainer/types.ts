/*!
 * Copyright 2023 Cognite AS
 */

import {
  type CadModelBudget,
  type PointCloudBudget,
  type ResolutionOptions
} from '@cognite/reveal';
import { type ReactElement } from 'react';

export type HighFidelityProps = {
  lowQualitySettings?: Partial<QualitySettings>;
  highQualitySettings?: Partial<QualitySettings>;
};

export type SettingsContainerProps = HighFidelityProps & {
  customSettingsContent?: ReactElement;
};

export type QualitySettings = {
  cadBudget: CadModelBudget;
  pointCloudBudget: PointCloudBudget;
  resolutionOptions: ResolutionOptions;
};
