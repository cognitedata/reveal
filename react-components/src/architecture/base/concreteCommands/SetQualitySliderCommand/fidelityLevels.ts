import { assertNever } from '../../../../utilities/assertNever';

import { clamp, maxBy } from 'lodash';
import { type QualitySettings } from '../../utilities/quality/QualitySettings';
import assert from 'assert';

export const FIDELITY_LEVELS = [1, 2, 3, 4, 5] as const;

export type FidelityLevel = (typeof FIDELITY_LEVELS)[number];

export const MAX_FIDELITY: FidelityLevel = 5;
export const MIN_FIDELITY: FidelityLevel = 1;

export function getQualityForFidelityLevel(fidelityLevel: FidelityLevel) {
  switch (fidelityLevel) {
    case 1:
      return {
        cadBudget: {
          maximumRenderCost: 8_000_000,
          highDetailProximityThreshold: 0
        },
        pointCloudBudget: {
          numberOfPoints: 1_500_000
        },
        resolutionOptions: {
          maxRenderResolution: 0.7e6,
          movingCameraResolutionFactor: 0.1
        }
      };

    case 2:
      return {
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

    case 3:
      return {
        cadBudget: {
          maximumRenderCost: 35_000_000,
          highDetailProximityThreshold: 0
        },
        pointCloudBudget: {
          numberOfPoints: 7_000_000
        },
        resolutionOptions: {
          maxRenderResolution: 6e6,
          movingCameraResolutionFactor: 1
        }
      };
    case 4:
      return {
        cadBudget: {
          maximumRenderCost: 80_000_000,
          highDetailProximityThreshold: 0
        },
        pointCloudBudget: {
          numberOfPoints: 20_000_000
        },
        resolutionOptions: {
          maxRenderResolution: Infinity,
          movingCameraResolutionFactor: 1
        }
      };
    case 5:
      return {
        cadBudget: {
          maximumRenderCost: 130_000_000,
          highDetailProximityThreshold: 0
        },
        pointCloudBudget: {
          numberOfPoints: 35_000_000
        },
        resolutionOptions: {
          maxRenderResolution: Infinity,
          movingCameraResolutionFactor: 1
        }
      };
    default:
      assertNever(fidelityLevel);
  }
}

export function getClosestFidelity(quality: QualitySettings): FidelityLevel {
  const similaritiesWithLevel = FIDELITY_LEVELS.map((level) => ({
    level,
    similarity: getQualitySimilarityHeuristic(quality, getQualityForFidelityLevel(level))
  }));
  const closestMatch = maxBy(similaritiesWithLevel, ({ similarity }) => similarity)?.level;

  assert(closestMatch !== undefined);

  return closestMatch;
}

function getQualitySimilarityHeuristic(q0: QualitySettings, q1: QualitySettings) {
  const cadRenderCostRatio = getSmallestRatio(
    q0.cadBudget.maximumRenderCost,
    q1.cadBudget.maximumRenderCost
  );
  const pointCloudPointRatio = getSmallestRatio(
    q0.pointCloudBudget.numberOfPoints,
    q1.pointCloudBudget.numberOfPoints
  );
  const maxResolutionRatio = getSmallestRatio(
    q0.resolutionOptions.maxRenderResolution,
    q1.resolutionOptions.maxRenderResolution
  );
  const cameraMovementRatio = getSmallestRatio(
    q0.resolutionOptions.movingCameraResolutionFactor,
    q1.resolutionOptions.movingCameraResolutionFactor
  );

  return cadRenderCostRatio + pointCloudPointRatio + maxResolutionRatio + cameraMovementRatio;
}

function getSmallestRatio(f0: number | undefined, f1: number | undefined) {
  if (f0 === undefined || f1 === undefined) {
    return 0;
  }

  const clampedF0 = clamp(f0, 0.001, 1e9);
  const clampedF1 = clamp(f1, 0.001, 1e9);
  return Math.min(clampedF0 / clampedF1, clampedF1 / clampedF0);
}
