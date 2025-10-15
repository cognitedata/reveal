import { useContext, useEffect, useCallback } from 'react';
import { UseQualitySettingsFromSceneContext } from './useQualitySettingsFromScene.context';
import {
  mergePointCloudSettings,
  applyQualitySettingsToRenderTarget
} from '../../../utilities/pointCloudSettings';

type UseQualitySettingsFromSceneResult = {
  onPointCloudSettingsCallback: () => void;
};

export const useQualitySettingsFromScene = (
  sceneExternalId: string,
  sceneSpaceId: string
): UseQualitySettingsFromSceneResult => {
  const { useSceneConfig, useRenderTarget } = useContext(UseQualitySettingsFromSceneContext);
  const scene = useSceneConfig(sceneExternalId, sceneSpaceId);
  const renderTarget = useRenderTarget();

  useEffect(() => {
    const qualitySettings = scene?.sceneConfiguration.qualitySettings;

    if (qualitySettings === undefined) {
      return;
    }

    applyQualitySettingsToRenderTarget(renderTarget, qualitySettings);
  }, [scene?.sceneConfiguration.qualitySettings, renderTarget]);

  const onPointCloudSettingsCallback = useCallback(() => {
    const qualitySettings = scene?.sceneConfiguration.qualitySettings;
    if (qualitySettings !== undefined) {
      mergePointCloudSettings(renderTarget.revealSettingsController, qualitySettings);
    }
  }, [scene?.sceneConfiguration.qualitySettings, renderTarget]);

  return { onPointCloudSettingsCallback };
};
