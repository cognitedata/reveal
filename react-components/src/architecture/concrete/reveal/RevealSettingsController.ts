import { effect, Signal, signal } from '@cognite/signals';
import { QualitySettings } from '../../base/utilities/quality/QualitySettings';
import { DEFAULT_REVEAL_QUALITY_SETTINGS } from './constants';
import { Cognite3DViewer, DataSourceType } from '@cognite/reveal';

export class RevealSettingsController {
  private _viewer: Cognite3DViewer<DataSourceType>;
  private _renderQualitySignal = signal<QualitySettings>(DEFAULT_REVEAL_QUALITY_SETTINGS);

  constructor(viewer: Cognite3DViewer<DataSourceType>) {
    this._viewer = viewer;

    effect(() => {
      setQualityOnViewer(this._renderQualitySignal(), this._viewer);
    });
  }

  public get renderQuality(): Signal<QualitySettings> {
    return this._renderQualitySignal;
  }
}

function setQualityOnViewer<T extends DataSourceType>(
  quality: QualitySettings,
  viewer: Cognite3DViewer<T>
): void {
  viewer.setResolutionOptions(quality.resolutionOptions);
  viewer.cadBudget = quality.cadBudget;
  viewer.pointCloudBudget = quality.pointCloudBudget;
}
