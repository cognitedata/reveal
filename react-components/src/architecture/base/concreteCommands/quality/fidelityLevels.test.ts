import { describe, expect, test } from 'vitest';
import assert from 'assert';
import {
  FIDELITY_LEVELS,
  getClosestFidelity,
  getQualityForFidelityLevel,
  MAX_FIDELITY,
  MIN_FIDELITY
} from './fidelityLevels';
import { type QualitySettings } from '../../utilities/quality/QualitySettings';

describe('fidelityLevels', () => {
  describe(getClosestFidelity.name, () => {
    test('returns the same fidelity level for matching quality', () => {
      FIDELITY_LEVELS.forEach((level) => {
        expect(getClosestFidelity(getQualityForFidelityLevel(level))).toBe(level);
      });
    });

    test('returns highest fidelity for enormously large quality setting', () => {
      const highQualitySetting: QualitySettings = {
        cadBudget: { highDetailProximityThreshold: Infinity, maximumRenderCost: Infinity },
        pointCloudBudget: { numberOfPoints: Infinity },
        resolutionOptions: { maxRenderResolution: Infinity, movingCameraResolutionFactor: Infinity }
      };

      expect(getClosestFidelity(highQualitySetting)).toBe(MAX_FIDELITY);
    });

    test('returns lowest fidelity for extremely small setting', () => {
      const lowQualitySetting: QualitySettings = {
        cadBudget: { highDetailProximityThreshold: 1, maximumRenderCost: 10 },
        pointCloudBudget: { numberOfPoints: 10 },
        resolutionOptions: { maxRenderResolution: 1, movingCameraResolutionFactor: 0.1 }
      };

      expect(getClosestFidelity(lowQualitySetting)).toBe(MIN_FIDELITY);
    });

    test('chooses closest budget when deviations are small', () => {
      FIDELITY_LEVELS.forEach((level) => {
        const quality = getQualityForFidelityLevel(level);

        assert(quality.resolutionOptions.maxRenderResolution !== undefined);
        assert(quality.resolutionOptions.movingCameraResolutionFactor !== undefined);

        quality.cadBudget = {
          ...quality.cadBudget,
          maximumRenderCost: quality.cadBudget.maximumRenderCost - 10_100
        };
        quality.pointCloudBudget = {
          ...quality.pointCloudBudget,
          numberOfPoints: quality.pointCloudBudget.numberOfPoints - 200_000
        };
        quality.resolutionOptions = {
          ...quality.resolutionOptions,
          maxRenderResolution: quality.resolutionOptions.maxRenderResolution - 100_000,
          movingCameraResolutionFactor: quality.resolutionOptions.movingCameraResolutionFactor - 0.1
        };
        expect(getClosestFidelity(quality)).toBe(level);
      });
    });
  });
});
