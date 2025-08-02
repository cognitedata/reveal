import { effect, type Signal, signal } from '@cognite/signals';
import { type QualitySettings } from '../../base/utilities/quality/QualitySettings';
import { DEFAULT_REVEAL_QUALITY_SETTINGS } from './constants';
import {
  FlexibleControlsType,
  isFlexibleCameraManager,
  type PointShape,
  type Cognite3DViewer,
  type DataSourceType,
  type PointColorType
} from '@cognite/reveal';
import { PointCloudDomainObject } from './pointCloud/PointCloudDomainObject';
import { type DomainObject } from '../../base/domainObjects/DomainObject';
import { clear } from '../../base/utilities/extensions/arrayUtils';

export class RevealSettingsController {
  private readonly _viewer: Cognite3DViewer<DataSourceType>;
  private readonly _root?: DomainObject;
  private readonly _disposables: Array<() => void> = [];

  public get disposableCount(): number {
    // Added for testing purposes
    return this._disposables.length;
  }

  // The settings
  private readonly _renderQuality = signal<QualitySettings>(DEFAULT_REVEAL_QUALITY_SETTINGS);
  private readonly _cameraKeyBoardSpeed = signal<number>(1);
  private readonly _cameraControlsType = signal<FlexibleControlsType>(FlexibleControlsType.Orbit);

  // Settings for the point cloud
  private readonly _pointSize = signal<number>(2);
  private readonly _pointShape = signal<PointShape>(0);
  private readonly _pointColorType = signal<PointColorType>(0);

  private _pointSizeInitialized = false;
  private _pointShapeInitialized = false;
  private _pointColorTypeInitialized = false;

  constructor(viewer: Cognite3DViewer<DataSourceType>, root?: DomainObject) {
    this._viewer = viewer;
    this._root = root;

    this.copyDefaultValuesFromViewer();

    this.addEffect(() => {
      setQualityOnViewer(this.renderQuality(), this._viewer);
    });
    this.addEffect(() => {
      setCameraKeyBoardSpeedOnViewer(this.cameraKeyBoardSpeed(), this._viewer);
    });
    this.addEffect(() => {
      setCameraControlsTypeOnViewer(this.cameraControlsType(), this._viewer);
    });
    this.addEffect(() => {
      setPointSizeOnViewer(this.pointSize(), this._root);
    });
    this.addEffect(() => {
      setPointShapeOnViewer(this.pointShape(), this._root);
    });
    this.addEffect(() => {
      setPointColorTypeOnViewer(this.pointColorType(), this._root);
    });
  }

  public get renderQuality(): Signal<QualitySettings> {
    return this._renderQuality;
  }

  public get cameraKeyBoardSpeed(): Signal<number> {
    return this._cameraKeyBoardSpeed;
  }

  public get cameraControlsType(): Signal<FlexibleControlsType> {
    return this._cameraControlsType;
  }

  public get pointSize(): Signal<number> {
    // Let the first PointCloud decide the default value
    if (!this._pointSizeInitialized) {
      const domainObject = getFirstPointCloud(this._root);
      if (domainObject !== undefined) {
        this._pointSize(domainObject.pointSize());
        this._pointSizeInitialized = true;
      }
    }
    return this._pointSize;
  }

  public get pointShape(): Signal<PointShape> {
    // Let the first PointCloud decide the default value
    if (!this._pointShapeInitialized) {
      const domainObject = getFirstPointCloud(this._root);
      if (domainObject !== undefined) {
        this._pointShape(domainObject.pointShape());
        this._pointShapeInitialized = true;
      }
    }
    return this._pointShape;
  }

  public get pointColorType(): Signal<PointColorType> {
    // Let the first PointCloud decide the default value
    if (!this._pointColorTypeInitialized) {
      const domainObject = getFirstPointCloud(this._root);
      if (domainObject !== undefined) {
        this._pointColorType(domainObject.pointColorType());
        this._pointColorTypeInitialized = true;
      }
    }
    return this._pointColorType;
  }

  public dispose(): void {
    for (const disposable of this._disposables) {
      disposable();
    }
    clear(this._disposables);
  }

  private addDisposable(disposable: () => void): void {
    this._disposables.push(disposable);
  }

  private addEffect(effectFunction: () => void): void {
    this.addDisposable(
      effect(() => {
        effectFunction();
      })
    );
  }

  private copyDefaultValuesFromViewer(): void {
    const cameraManager = this._viewer.cameraManager;
    if (isFlexibleCameraManager(cameraManager)) {
      this._cameraKeyBoardSpeed(cameraManager.options.keyboardSpeed);
      this._cameraControlsType(cameraManager.options.controlsType);

      cameraManager.addControlsTypeChangeListener(this._cameraControlsTypeChangeHandler);
      this._disposables.push(() => {
        cameraManager.removeControlsTypeChangeListener(this._cameraControlsTypeChangeHandler);
      });
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

function setPointSizeOnViewer(value: number, root?: DomainObject): void {
  for (const domainObject of getPointClouds(root)) {
    domainObject.pointSize(value);
  }
}

function setPointShapeOnViewer(value: PointShape, root?: DomainObject): void {
  for (const domainObject of getPointClouds(root)) {
    domainObject.pointShape(value);
  }
}
function setPointColorTypeOnViewer(value: PointColorType, root?: DomainObject): void {
  for (const domainObject of getPointClouds(root)) {
    domainObject.pointColorType(value);
  }
}

function* getPointClouds(root?: DomainObject): Generator<PointCloudDomainObject> {
  if (root === undefined) {
    return;
  }
  yield* root.getDescendantsByType(PointCloudDomainObject);
}

function getFirstPointCloud(root?: DomainObject): PointCloudDomainObject | undefined {
  if (root === undefined) {
    return undefined;
  }
  return root.getDescendantByType(PointCloudDomainObject);
}
