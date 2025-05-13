import { effect, type Signal, signal } from '@cognite/signals';
import { type QualitySettings } from '../../base/utilities/quality/QualitySettings';
import { DEFAULT_REVEAL_QUALITY_SETTINGS } from './constants';
import {
  isFlexibleCameraManager,
  type Cognite3DViewer,
  type DataSourceType
} from '@cognite/reveal';

export class RevealSettingsController {
  private readonly _viewer: Cognite3DViewer<DataSourceType>;
  private readonly _renderQualitySignal = signal<QualitySettings>(DEFAULT_REVEAL_QUALITY_SETTINGS);
  private readonly _keyBoardSpeed = signal<number>(1);

  constructor(viewer: Cognite3DViewer<DataSourceType>) {
    this._viewer = viewer;

    // Set default camera speed
    const cameraManager = viewer.cameraManager;
    if (isFlexibleCameraManager(cameraManager)) {
      this._keyBoardSpeed(cameraManager.options.keyboardSpeed);
    }

    effect(() => {
      setQualityOnViewer(this._renderQualitySignal(), this._viewer);
    });
    effect(() => {
      setKeyBoardSpeedOnViewer(this._keyBoardSpeed(), this._viewer);
    });
  }

  public get renderQuality(): Signal<QualitySettings> {
    return this._renderQualitySignal;
  }

  public get keyBoardSpeed(): Signal<number> {
    return this._keyBoardSpeed;
  }
}

function setQualityOnViewer<T extends DataSourceType>(
  value: QualitySettings,
  viewer: Cognite3DViewer<T>
): void {
  viewer.setResolutionOptions(value.resolutionOptions);
  viewer.cadBudget = value.cadBudget;
  viewer.pointCloudBudget = value.pointCloudBudget;
}

function setKeyBoardSpeedOnViewer<T extends DataSourceType>(
  value: number,
  viewer: Cognite3DViewer<T>
): void {
  const cameraManager = viewer.cameraManager;
  if (isFlexibleCameraManager(cameraManager)) {
    cameraManager.options.keyboardSpeed = value;
  }
}
