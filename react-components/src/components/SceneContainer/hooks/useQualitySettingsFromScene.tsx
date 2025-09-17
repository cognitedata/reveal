import { useContext, useEffect, useCallback } from 'react';
import { UseQualitySettingsFromSceneContext } from './useQualitySettingsFromScene.context';
import { type SceneQualitySettings } from '../sceneTypes';
import { type RevealRenderTarget } from '../../../architecture/base/renderTarget/RevealRenderTarget';
import { type QualitySettings } from '../../../architecture/base/utilities/quality/QualitySettings';
import { type RevealSettingsController } from '../../../architecture/concrete/reveal/RevealSettingsController';
import { PointColorType, PointShape } from '@cognite/reveal';

type UseQualitySettingsFromSceneResult = {
  onPointCloudSettingsCallback: () => void;
};

export const useQualitySettingsFromScene = (
  sceneExternalId: string,
  sceneSpaceId: string
): UseQualitySettingsFromSceneResult => {
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

  const onPointCloudSettingsCallback = useCallback(() => {
    const qualitySettings = scene?.sceneConfiguration.qualitySettings;
    if (qualitySettings !== undefined) {
      mergePointCloudSettings(renderTarget.revealSettingsController, qualitySettings);
    }
  }, [scene?.sceneConfiguration.qualitySettings, renderTarget]);

  return { onPointCloudSettingsCallback };
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

function mergePointCloudSettings(
  currentSettings: RevealSettingsController,
  incomingSettings: SceneQualitySettings
): void {
  if (incomingSettings.pointCloudPointSize !== undefined) {
    currentSettings.pointSize(incomingSettings.pointCloudPointSize);
  }
  if (incomingSettings.pointCloudPointShape !== undefined) {
    let pointShape: PointShape = PointShape.Circle;
    switch (incomingSettings.pointCloudPointShape) {
      case 'Circle':
        pointShape = PointShape.Circle;
        break;
      case 'Square':
        pointShape = PointShape.Square;
        break;
      case 'Paraboloid':
        pointShape = PointShape.Paraboloid;
        break;
      default:
        pointShape = PointShape.Circle;
    }
    currentSettings.pointShape(pointShape);
  }
  if (incomingSettings.pointCloudColor !== undefined) {
    let pointColor: PointColorType = PointColorType.Rgb;
    switch (incomingSettings.pointCloudColor) {
      case 'Rgb':
        pointColor = PointColorType.Rgb;
        break;
      case 'Depth':
        pointColor = PointColorType.Depth;
        break;
      case 'Height':
        pointColor = PointColorType.Height;
        break;
      case 'Intensity':
        pointColor = PointColorType.Intensity;
        break;
      case 'Lod':
        pointColor = PointColorType.Lod;
        break;
      case 'PointIndex':
        pointColor = PointColorType.PointIndex;
        break;
      case 'Classification':
        pointColor = PointColorType.Classification;
        break;
      default:
        pointColor = PointColorType.Rgb;
    }
    currentSettings.pointColorType(pointColor);
  }
}
