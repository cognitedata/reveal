import { PointColorType, PointShape } from '@cognite/reveal';
import { type RevealSettingsController } from '../architecture/concrete/reveal/RevealSettingsController';
import { type RevealRenderTarget } from '../architecture/base/renderTarget/RevealRenderTarget';
import { type QualitySettings } from '../architecture/base/utilities/quality/QualitySettings';
import { type SceneQualitySettings } from '../components/SceneContainer/sceneTypes';
import { DEFAULT_REVEAL_QUALITY_SETTINGS } from '../architecture/concrete/reveal/constants';

export function mergePointCloudSettings(
  settingsController: RevealSettingsController,
  qualitySettings: SceneQualitySettings
): void {
  if (qualitySettings.pointCloudPointSize !== undefined) {
    settingsController.pointSize(qualitySettings.pointCloudPointSize);
  } else {
    settingsController.pointSize(2);
  }

  if (qualitySettings.pointCloudPointShape !== undefined) {
    const pointShape = mapPointShape(qualitySettings.pointCloudPointShape);
    settingsController.pointShape(pointShape);
  }

  if (qualitySettings.pointCloudColor !== undefined) {
    const pointColor = mapPointColorType(qualitySettings.pointCloudColor);
    settingsController.pointColorType(pointColor);
  }
}

export function mapPointShape(shapeString: string): PointShape {
  switch (shapeString) {
    case 'Circle':
      return PointShape.Circle;
    case 'Square':
      return PointShape.Square;
    case 'Paraboloid':
      return PointShape.Paraboloid;
    default:
      return PointShape.Circle;
  }
}

export function mapPointColorType(colorString: string): PointColorType {
  switch (colorString) {
    case 'Rgb':
      return PointColorType.Rgb;
    case 'Depth':
      return PointColorType.Depth;
    case 'Height':
      return PointColorType.Height;
    case 'Intensity':
      return PointColorType.Intensity;
    case 'Lod':
      return PointColorType.Lod;
    case 'PointIndex':
      return PointColorType.PointIndex;
    case 'Classification':
      return PointColorType.Classification;
    default:
      return PointColorType.Rgb;
  }
}

export function applyQualitySettingsToRenderTarget(
  renderTarget: RevealRenderTarget,
  qualitySettings: SceneQualitySettings
): void {
  const settingsController = renderTarget.revealSettingsController;
  const defaultSettings: QualitySettings = DEFAULT_REVEAL_QUALITY_SETTINGS;

  const newSettings = mergeQualitySettings(defaultSettings, qualitySettings);
  settingsController.qualitySettings(newSettings);
}

export function mergeQualitySettings(
  defaultSettings: QualitySettings,
  incoming: SceneQualitySettings
): QualitySettings {
  return {
    cadBudget: {
      maximumRenderCost: incoming.cadBudget ?? defaultSettings.cadBudget.maximumRenderCost,
      highDetailProximityThreshold: defaultSettings.cadBudget.highDetailProximityThreshold
    },
    pointCloudBudget: {
      numberOfPoints: incoming.pointCloudBudget ?? defaultSettings.pointCloudBudget.numberOfPoints
    },
    resolutionOptions: {
      maxRenderResolution:
        incoming.maxRenderResolution ?? defaultSettings.resolutionOptions.maxRenderResolution,
      movingCameraResolutionFactor:
        incoming.movingCameraResolutionFactor ??
        defaultSettings.resolutionOptions.movingCameraResolutionFactor
    }
  };
}
