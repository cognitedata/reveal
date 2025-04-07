import { describe, expect, test, vi } from 'vitest';
import { RevealSettingsController } from './RevealSettingsController';
import {
  viewerMock,
  viewerSetCadModelBudgetMock,
  viewerSetPointCloudModelBudgetMock,
  viewerSetResolutionOptionsMock
} from '#test-utils/fixtures/viewer';

describe(RevealSettingsController.name, () => {
  test("it updates reveal's quality settings when changed", () => {
    const settingsController = new RevealSettingsController(viewerMock);

    const testQualitySettings = {
      cadBudget: { maximumRenderCost: 1231232, highDetailProximityThreshold: 0 },
      pointCloudBudget: { numberOfPoints: 123121212 },
      resolutionOptions: { maxRenderResolution: 1.3e4, movingCameraResolutionFactor: 0.3 }
    };

    settingsController.renderQuality(testQualitySettings);

    expect(viewerSetCadModelBudgetMock).toHaveBeenCalledWith(testQualitySettings.cadBudget);
    expect(viewerSetPointCloudModelBudgetMock).toHaveBeenCalledWith(
      testQualitySettings.pointCloudBudget
    );
    expect(viewerSetResolutionOptionsMock).toHaveBeenCalledWith(
      testQualitySettings.resolutionOptions
    );
  });
});
