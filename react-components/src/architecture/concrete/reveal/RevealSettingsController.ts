import { effect, type Signal, signal } from '@cognite/signals';
import { type QualitySettings } from '../../base/utilities/quality/QualitySettings';
import { DEFAULT_REVEAL_QUALITY_SETTINGS } from './constants';
import {
  FlexibleControlsType,
  isFlexibleCameraManager,
  type Cognite3DViewer,
  type DataSourceType
} from '@cognite/reveal';

export class RevealSettingsController {
  private readonly _viewer: Cognite3DViewer<DataSourceType>;
  private readonly _disposables: Array<() => void> = [];

  // The settings
  private readonly _renderQualitySignal = signal<QualitySettings>(DEFAULT_REVEAL_QUALITY_SETTINGS);
  private readonly _cameraKeyBoardSpeed = signal<number>(1);
  private readonly _cameraControlsType = signal<FlexibleControlsType>(FlexibleControlsType.Orbit);

  constructor(viewer: Cognite3DViewer<DataSourceType>) {
    this._viewer = viewer;

    this.copyDefaultValuesFromViewer();

    this.addEffect(() => {
      setQualityOnViewer(this._renderQualitySignal(), this._viewer);
    });
    this.addEffect(() => {
      setCameraKeyBoardSpeedOnViewer(this._cameraKeyBoardSpeed(), this._viewer);
    });
    this.addEffect(() => {
      setCameraControlsTypeOnViewer(this._cameraControlsType(), this._viewer);
    });
  }

  public get renderQuality(): Signal<QualitySettings> {
    return this._renderQualitySignal;
  }

  public get cameraKeyBoardSpeed(): Signal<number> {
    return this._cameraKeyBoardSpeed;
  }

  public get cameraControlsType(): Signal<FlexibleControlsType> {
    return this._cameraControlsType;
  }

  public dispose(): void {
    for (const disposable of this._disposables) {
      disposable();
    }
    const cameraManager = this._viewer.cameraManager;
    if (isFlexibleCameraManager(cameraManager)) {
      cameraManager.removeControlsTypeChangeListener(this._cameraControlsTypeChangeHandler);
    }
  }

  private addEffect(effectFunction: () => void): void {
    this._disposables.push(
      effect(() => {
        effectFunction();
      })
    );
  }

  private copyDefaultValuesFromViewer(): void {
    // Set default camera speed
    const cameraManager = this._viewer.cameraManager;
    if (isFlexibleCameraManager(cameraManager)) {
      this._cameraKeyBoardSpeed(cameraManager.options.keyboardSpeed);
      this._cameraControlsType(cameraManager.options.controlsType);
      cameraManager.addControlsTypeChangeListener(this._cameraControlsTypeChangeHandler);
    }
  }

  private readonly _cameraControlsTypeChangeHandler = (
    _newControlsType: FlexibleControlsType
  ): void => {
    const cameraManager = this._viewer.cameraManager;
    if (isFlexibleCameraManager(cameraManager)) {
      this._cameraControlsType(cameraManager.options.controlsType);
    }
  };
}

function setQualityOnViewer<T extends DataSourceType>(
  value: QualitySettings,
  viewer: Cognite3DViewer<T>
): void {
  viewer.setResolutionOptions(value.resolutionOptions);
  viewer.cadBudget = value.cadBudget;
  viewer.pointCloudBudget = value.pointCloudBudget;
}

function setCameraKeyBoardSpeedOnViewer<T extends DataSourceType>(
  value: number,
  viewer: Cognite3DViewer<T>
): void {
  const cameraManager = viewer.cameraManager;
  if (isFlexibleCameraManager(cameraManager)) {
    cameraManager.options.keyboardSpeed = value;
  }
}

function setCameraControlsTypeOnViewer<T extends DataSourceType>(
  value: FlexibleControlsType,
  viewer: Cognite3DViewer<T>
): void {
  const cameraManager = viewer.cameraManager;
  if (isFlexibleCameraManager(cameraManager)) {
    cameraManager.options.controlsType = value;
  }
}
