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
import { Image360CollectionDomainObject } from './Image360Collection/Image360CollectionDomainObject';

export class RevealSettingsController {
  private readonly _viewer: Cognite3DViewer<DataSourceType>;
  private readonly _root?: DomainObject;
  private readonly _disposables: Array<() => void> = [];

  public get disposableCount(): number {
    return this._disposables.length;
  }

  // The settings
  private readonly _qualitySettings = signal(DEFAULT_REVEAL_QUALITY_SETTINGS);

  // Settings for the camera
  private readonly _cameraKeyBoardSpeed = signal(1);
  private readonly _cameraControlsType = signal(FlexibleControlsType.Orbit);

  // Settings for the point cloud
  private readonly _pointSize = signal<number>(0);
  private readonly _pointShape = signal<PointShape>(0);
  private readonly _pointColorType = signal<PointColorType>(0);

  // Settings for the 360 images
  private readonly _isIconsVisible = signal(false);
  private readonly _isOccludedIconsVisible = signal(false);
  private readonly _iconsOpacity = signal(0);
  private readonly _imagesOpacity = signal(0);

  // If the signal is the set, the signal is initialized with a value from the first domain object of that type.
  private readonly _isInitialized = new Set<Signal<any>>();

  constructor(viewer: Cognite3DViewer<DataSourceType>, root?: DomainObject) {
    this._viewer = viewer;
    this._root = root;

    this.copyDefaultValuesFromViewer();

    this.addEffect(() => {
      setQualityOnViewer(this._qualitySettings(), this._viewer);
    });
    this.addEffect(() => {
      setCameraKeyBoardSpeedOnViewer(this.cameraKeyBoardSpeed(), this._viewer);
    });
    this.addEffect(() => {
      setCameraControlsTypeOnViewer(this.cameraControlsType(), this._viewer);
    });
    this.addEffect(() => {
      const value = this.pointSize();
      this.forEachPointCloud((domainObject) => {
        domainObject.pointSize(value);
      });
    });
    this.addEffect(() => {
      const value = this.pointShape();
      this.forEachPointCloud((domainObject) => {
        domainObject.pointShape(value);
      });
    });
    this.addEffect(() => {
      const value = this.pointColorType();
      this.forEachPointCloud((domainObject) => {
        domainObject.pointColorType(value);
      });
    });
    this.addEffect(() => {
      const value = this.isIconsVisible();
      this.forEachImage360Collection((domainObject) => {
        domainObject.isIconsVisible(value);
      });
    });
    this.addEffect(() => {
      const value = this.isOccludedIconsVisible();
      this.forEachImage360Collection((domainObject) => {
        domainObject.isOccludedIconsVisible(value);
      });
    });
    this.addEffect(() => {
      const value = this.iconsOpacity();
      this.forEachImage360Collection((domainObject) => {
        domainObject.iconsOpacity(value);
      });
    });
    this.addEffect(() => {
      const value = this.imagesOpacity();
      this.forEachImage360Collection((domainObject) => {
        domainObject.imagesOpacity(value);
      });
    });
  }

  public get qualitySettings(): Signal<QualitySettings> {
    return this._qualitySettings;
  }

  public get cameraKeyBoardSpeed(): Signal<number> {
    return this._cameraKeyBoardSpeed;
  }

  public get cameraControlsType(): Signal<FlexibleControlsType> {
    return this._cameraControlsType;
  }

  public get pointSize(): Signal<number> {
    const value = this._pointSize;
    if (!this._isInitialized.has(value)) {
      const domainObject = getFirstPointCloud(this._root);
      if (domainObject !== undefined) {
        value(domainObject.pointSize());
        this._isInitialized.add(value);
      }
    }
    return value;
  }

  public get pointShape(): Signal<PointShape> {
    const value = this._pointShape;
    if (!this._isInitialized.has(value)) {
      const domainObject = getFirstPointCloud(this._root);
      if (domainObject !== undefined) {
        value(domainObject.pointShape());
        this._isInitialized.add(value);
      }
    }
    return value;
  }

  public get pointColorType(): Signal<PointColorType> {
    const value = this._pointColorType;
    if (!this._isInitialized.has(value)) {
      const domainObject = getFirstPointCloud(this._root);
      if (domainObject !== undefined) {
        value(domainObject.pointColorType());
        this._isInitialized.add(value);
      }
    }
    return value;
  }

  public get isIconsVisible(): Signal<boolean> {
    const value = this._isIconsVisible;
    if (!this._isInitialized.has(value)) {
      const domainObject = getFirstImage360Collection(this._root);
      if (domainObject !== undefined) {
        value(domainObject.isIconsVisible());
        this._isInitialized.add(value);
      }
    }
    return value;
  }

  public get isOccludedIconsVisible(): Signal<boolean> {
    const value = this._isOccludedIconsVisible;
    if (!this._isInitialized.has(value)) {
      const domainObject = getFirstImage360Collection(this._root);
      if (domainObject !== undefined) {
        value(domainObject.isOccludedIconsVisible());
        this._isInitialized.add(value);
      }
    }
    return value;
  }

  public get iconsOpacity(): Signal<number> {
    const value = this._iconsOpacity;
    if (!this._isInitialized.has(value)) {
      const domainObject = getFirstImage360Collection(this._root);
      if (domainObject !== undefined) {
        value(domainObject.iconsOpacity());
        this._isInitialized.add(value);
      }
    }
    return value;
  }

  public get imagesOpacity(): Signal<number> {
    const value = this._imagesOpacity;
    if (!this._isInitialized.has(value)) {
      const domainObject = getFirstImage360Collection(this._root);
      if (domainObject !== undefined) {
        value(domainObject.imagesOpacity());
        this._isInitialized.add(value);
      }
    }
    return value;
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

  private forEachPointCloud(func: (arg: PointCloudDomainObject) => void): void {
    if (this._root === undefined) {
      return;
    }
    for (const domainObject of this._root.getDescendantsByType(PointCloudDomainObject)) {
      func(domainObject);
    }
  }

  private forEachImage360Collection(func: (arg: Image360CollectionDomainObject) => void): void {
    if (this._root === undefined) {
      return;
    }
    for (const domainObject of this._root.getDescendantsByType(Image360CollectionDomainObject)) {
      func(domainObject);
    }
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

function getFirstPointCloud(root?: DomainObject): PointCloudDomainObject | undefined {
  return root !== undefined ? root.getDescendantByType(PointCloudDomainObject) : undefined;
}

function getFirstImage360Collection(
  root?: DomainObject
): Image360CollectionDomainObject | undefined {
  return root !== undefined ? root.getDescendantByType(Image360CollectionDomainObject) : undefined;
}
