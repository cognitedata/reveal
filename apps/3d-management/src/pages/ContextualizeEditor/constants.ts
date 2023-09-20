import { Color } from 'three';

import { QualitySettings } from '@cognite/reveal-react-components';

export const CONTEXTUALIZE_EDITOR_HEADER_HEIGHT = 40;

export const defaultRevealColor = new Color(0x000000);

export const DEFAULT_POINT_BUDGET = 3_000_000;
export const DEFAULT_CAD_BUDGET = 10_000_000;

export const DEFAULT_POINT_SIZE = 2;
export const MIN_POINT_SIZE = 0.0;
export const MAX_POINT_SIZE = 4; // Default seems be be 2, but the user probably wants lower values
export const STEP_POINT_SIZE = 0.1;

export const LowQualitySettings: QualitySettings = {
  cadBudget: {
    maximumRenderCost: DEFAULT_CAD_BUDGET,
    highDetailProximityThreshold: 100,
  },
  pointCloudBudget: {
    numberOfPoints: DEFAULT_POINT_BUDGET,
  },
  resolutionOptions: {
    maxRenderResolution: 1.4e6,
    movingCameraResolutionFactor: 1,
  },
};

export const HighQualitySettings: QualitySettings = {
  cadBudget: {
    maximumRenderCost: 2 * DEFAULT_CAD_BUDGET,
    highDetailProximityThreshold: 100,
  },
  pointCloudBudget: {
    numberOfPoints: 3 * DEFAULT_POINT_BUDGET,
  },
  resolutionOptions: {
    maxRenderResolution: Infinity,
  },
};
