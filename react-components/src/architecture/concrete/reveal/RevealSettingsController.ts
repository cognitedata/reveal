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
  private readonly _qualitySettings = signal<QualitySettings>(DEFAULT_REVEAL_QUALITY_SETTINGS);

  // Settings for the camera
  private readonly _cameraKeyBoardSpeed = signal<number>(1);
  private readonly _cameraControlsType = signal<FlexibleControlsType>(FlexibleControlsType.Orbit);

  // Settings for the point cloud
  private readonly _pointSize = signal<number>(2);
  private readonly _pointShape = signal<PointShape>(0);
  private readonly _pointColorType = signal<PointColorType>(0);

  private _pointSizeInitialized = false;
  private _pointShapeInitialized = false;
  private _pointColorTypeInitialized = false;

  // Settings for the 360 images
  private readonly _isIconsVisible = signal(false);
  private readonly _isOccludedIconsVisible = signal(false);
  private readonly _iconsOpacity = signal(0);
  private readonly _imagesOpacity = signal(0);

  private _isIconsVisibleInitialized = false;
  private _isOccludedIconsVisibleInitialized = false;
  private _iconsOpacityInitialized = false;
  private _imagesOpacityInitialized = false;

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
      const value = this._pointSize();
      this.forEachPointCloud((domainObject) => {
        domainObject.pointSize(value);
      });
    });
    this.addEffect(() => {
      const value = this._pointShape();
      this.forEachPointCloud((domainObject) => {
        domainObject.pointShape(value);
      });
    });
    this.addEffect(() => {
      const value = this._pointColorType();
      this.forEachPointCloud((domainObject) => {
        domainObject.pointColorType(value);
      });
    });
    this.addEffect(() => {
      const value = this._isIconsVisible();
      this.forEachImage360Collection((domainObject) => {
        domainObject.isIconsVisible(value);
      });
    });
    this.addEffect(() => {
      const value = this._isOccludedIconsVisible();
      this.forEachImage360Collection((domainObject) => {
        domainObject.isOccludedIconsVisible(value);
      });
    });
    this.addEffect(() => {
      const value = this._iconsOpacity();
      this.forEachImage360Collection((domainObject) => {
        domainObject.iconsOpacity(value);
      });
    });
    this.addEffect(() => {
      const value = this._imagesOpacity();
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

  public get isIconsVisible(): Signal<boolean> {
    // Let the first PointCloud decide the default value
    if (!this._isIconsVisibleInitialized) {
      const domainObject = getFirstImage360Collection(this._root);
      if (domainObject !== undefined) {
        this._isIconsVisible(domainObject.isIconsVisible());
        this._isIconsVisibleInitialized = true;
      }
    }
    return this._isIconsVisible;
  }

  public get isOccludedIconsVisible(): Signal<boolean> {
    // Let the first PointCloud decide the default value
    if (!this._isOccludedIconsVisibleInitialized) {
      const domainObject = getFirstImage360Collection(this._root);
      if (domainObject !== undefined) {
        this._isOccludedIconsVisible(domainObject.isOccludedIconsVisible());
        this._isOccludedIconsVisibleInitialized = true;
      }
    }
    return this._isOccludedIconsVisible;
  }

  public get iconsOpacity(): Signal<number> {
    // Let the first PointCloud decide the default value
    if (!this._iconsOpacityInitialized) {
      const domainObject = getFirstImage360Collection(this._root);
      if (domainObject !== undefined) {
        this._iconsOpacity(domainObject.iconsOpacity());
        this._iconsOpacityInitialized = true;
      }
    }
    return this._iconsOpacity;
  }

  public get imagesOpacity(): Signal<number> {
    // Let the first 360 image decide the default value
    if (!this._imagesOpacityInitialized) {
      const domainObject = getFirstImage360Collection(this._root);
      if (domainObject !== undefined) {
        this._imagesOpacity(domainObject.imagesOpacity());
        this._imagesOpacityInitialized = true;
      }
    }
    return this._imagesOpacity;
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
  if (root === undefined) {
    return undefined;
  }
  return root.getDescendantByType(PointCloudDomainObject);
}

function getFirstImage360Collection(
  root?: DomainObject
): Image360CollectionDomainObject | undefined {
  if (root === undefined) {
    return undefined;
  }
  return root.getDescendantByType(Image360CollectionDomainObject);
}
