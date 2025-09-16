import { useContext, useEffect } from 'react';
import { UseQualitySettingsFromSceneContext } from './useQualitySettingsFromScene.context';
import { type SceneQualitySettings } from '../sceneTypes';
import { type RevealRenderTarget } from '../../../architecture/base/renderTarget/RevealRenderTarget';
import { type QualitySettings } from '../../../architecture/base/utilities/quality/QualitySettings';

export const useQualitySettingsFromScene = (
  sceneExternalId: string,
  sceneSpaceId: string
): void => {
  const { useSceneConfig, useRenderTarget } = useContext(UseQualitySettingsFromSceneContext);
  const { data: scene } = useSceneConfig(sceneExternalId, sceneSpaceId);
  const renderTarget = useRenderTarget();

  useEffect(() => {
    const qualitySettings = scene?.sceneConfiguration.qualitySettings;

    if (qualitySettings === undefined) {
      return;
    }

    applyQualitySettingsToRenderTarget(renderTarget, qualitySettings);
  }, [scene?.sceneConfiguration.qualitySettings, renderTarget]);
};

function applyQualitySettingsToRenderTarget(
  renderTarget: RevealRenderTarget,
  qualitySettings: SceneQualitySettings
): void {
  const settingsController = renderTarget.revealSettingsController;
  const currentSettings = settingsController.qualitySettings.peek();

  const newSettings = mergeQualitySettings(currentSettings, qualitySettings);
  settingsController.qualitySettings(newSettings);
}

function mergeQualitySettings(
  current: QualitySettings,
  incoming: SceneQualitySettings
): QualitySettings {
  return {
    cadBudget: {
      maximumRenderCost: incoming.cadBudget ?? current.cadBudget.maximumRenderCost,
      highDetailProximityThreshold: current.cadBudget.highDetailProximityThreshold
    },
    pointCloudBudget: {
      numberOfPoints: incoming.pointCloudBudget ?? current.pointCloudBudget.numberOfPoints
    },
    resolutionOptions: {
      maxRenderResolution:
        incoming.maxRenderResolution ?? current.resolutionOptions.maxRenderResolution,
      movingCameraResolutionFactor:
        incoming.movingCameraResolutionFactor ??
        current.resolutionOptions.movingCameraResolutionFactor
    }
  };
}
