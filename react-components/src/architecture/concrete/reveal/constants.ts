import { QualitySettings } from '../../base/utilities/quality/QualitySettings';

export const DEFAULT_REVEAL_QUALITY_SETTINGS: QualitySettings = {
  cadBudget: {
    maximumRenderCost: 15_000_000,
    highDetailProximityThreshold: 0
  },
  pointCloudBudget: {
    numberOfPoints: 3_000_000
  },
  resolutionOptions: {
    maxRenderResolution: 1.4e6,
    movingCameraResolutionFactor: 0.5
  }
};
