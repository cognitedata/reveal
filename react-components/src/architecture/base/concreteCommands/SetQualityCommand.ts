/*!
 * Copyright 2024 Cognite AS
 */

import { type TranslateKey } from '../utilities/TranslateKey';
import { type QualitySettings } from '../../../components/RevealToolbar/SettingsContainer/types';
import { type DataSourceType, type Cognite3DViewer } from '@cognite/reveal';
import { RenderTargetCommand } from '../commands/RenderTargetCommand';

export class SetQualityCommand extends RenderTargetCommand {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _highQualityFactor: number;
  private _lowQualitySettings: QualitySettings | undefined;
  private _highQualitySettings: QualitySettings | undefined;

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  private get lowQualitySettings(): QualitySettings {
    if (this._lowQualitySettings === undefined) {
      this._lowQualitySettings = getDefaultSettings(this.renderTarget.viewer);
    }
    return this._lowQualitySettings;
  }

  private get highQualitySettings(): QualitySettings {
    if (this._highQualitySettings === undefined) {
      const settings = this.lowQualitySettings;
      this._highQualitySettings = {
        cadBudget: {
          maximumRenderCost: this._highQualityFactor * settings.cadBudget.maximumRenderCost,
          highDetailProximityThreshold: settings.cadBudget.highDetailProximityThreshold
        },
        pointCloudBudget: {
          numberOfPoints: this._highQualityFactor * settings.pointCloudBudget.numberOfPoints
        },
        resolutionOptions: {
          maxRenderResolution: Infinity,
          movingCameraResolutionFactor: 1
        }
      };
    }
    return this._highQualitySettings;
  }

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(highQualityFactor = 3) {
    super();
    this._highQualityFactor = highQualityFactor;
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { key: 'HIGH_FIDELITY', fallback: 'High Fidelity' };
  }

  public override get isToggle(): boolean {
    return true;
  }

  public override get isChecked(): boolean {
    return !this.isLowQuality(this.renderTarget.viewer);
  }

  protected override invokeCore(): boolean {
    const { viewer } = this.renderTarget;
    const settings = this.isLowQuality(viewer) ? this.highQualitySettings : this.lowQualitySettings;
    viewer.cadBudget = settings.cadBudget;
    viewer.pointCloudBudget = settings.pointCloudBudget;
    viewer.setResolutionOptions(settings.resolutionOptions);
    return true;
  }

  private isLowQuality(viewer: Cognite3DViewer<DataSourceType>): boolean {
    const settings = this.lowQualitySettings;
    return (
      viewer.cadBudget.maximumRenderCost <= settings.cadBudget.maximumRenderCost &&
      viewer.pointCloudBudget.numberOfPoints <= settings.pointCloudBudget.numberOfPoints
    );
  }
}

function getDefaultSettings(viewer: Cognite3DViewer<DataSourceType>): QualitySettings {
  const settings: QualitySettings = {
    cadBudget: { ...viewer.cadBudget },
    pointCloudBudget: { ...viewer.pointCloudBudget },
    // This should be fetched from the viewer, but cannot for some unknown reason
    resolutionOptions: {
      maxRenderResolution: 1.4e6,
      movingCameraResolutionFactor: 1
    }
  };
  return settings;
}
