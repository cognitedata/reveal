/*!
 * Copyright 2022 Cognite AS
 */

import { BeforeSceneRenderedDelegate, EventTrigger } from '@reveal/utilities';
import * as THREE from 'three';
import { PerspectiveCamera, Ray, Sphere, Vector3, WebGLRenderer } from 'three';
import { clamp } from 'three/src/math/MathUtils';

export type IconParameters = {
  position: THREE.Vector3,
  minPixelSize: number,
  maxPixelSize: number,
  iconRadius: number,
  hoverSprite?: THREE.Sprite
};

export type SetAdaptiveScaleDelegate = (args: { camera: THREE.Camera, renderSize: THREE.Vector2, domElement: HTMLElement }) => void;

export class Overlay3DIcon <MetadataType = {[key: string]: any}> {
  private readonly _position: THREE.Vector3;
  private readonly _minPixelSize: number;
  private readonly _maxPixelSize: number;
  private readonly _setAdaptiveScale: SetAdaptiveScaleDelegate;
  private readonly _iconRadius: number;
  private readonly _hoverSprite?: THREE.Sprite;
  private readonly _iconMetadata?: MetadataType;

  private _adaptiveScale = 1;
  private _visible = true;
  private _culled = false;
  private _selected = false;
  private _ndcPosition = new THREE.Vector4();

  private readonly _events = {
    selected: new EventTrigger<(value: boolean) => void>(),
  }

  constructor (
    iconParameters: IconParameters,
    iconMetadata?: MetadataType
  ) {
    const { position, minPixelSize, maxPixelSize, iconRadius, hoverSprite } = iconParameters;

    this._minPixelSize = minPixelSize;
    this._maxPixelSize = maxPixelSize;
    this._iconRadius = iconRadius;
    this._hoverSprite = hoverSprite;
    this._iconMetadata = iconMetadata;

    this._setAdaptiveScale = this.setupAdaptiveScaling(position);
   
    this._position = position;
  }

  on(_: 'selected', callback: (value: boolean) => void): void {
    this._events.selected.subscribe(callback);
  }

  off(_: 'selected', callback: (value: boolean) => void): void {
    this._events.selected.unsubscribe(callback);
  }

  set selected(newValue: boolean) {
    if (this._selected !== newValue) {
      this._events.selected.fire(newValue);
      this._selected = newValue;
    }

    if (this._hoverSprite && this._selected) {
      this._hoverSprite.position.copy(this._position);
      this._hoverSprite.scale.set(this._adaptiveScale * 2, this._adaptiveScale* 2, 1);
    }
  }

  get selected(): boolean {
    return this._selected;
  }

  updateHoverSpriteScale(): void {
    if (this._hoverSprite) {
      this._hoverSprite.scale.set(this._adaptiveScale * 2, this._adaptiveScale* 2, 1);
    }
  }

  updateAdaptiveScale(delegateArguments: { renderSize: THREE.Vector2, camera: PerspectiveCamera, domElement: HTMLElement}): void {
    this._setAdaptiveScale(delegateArguments);

    if (this._hoverSprite && this._selected) {
      this._hoverSprite.scale.set(this._adaptiveScale * 2, this._adaptiveScale* 2, 1);
    }
  }
  
  get iconMetadata(): MetadataType | undefined {
    return this._iconMetadata;
  }

  get adaptiveScale(): number {
    return this._adaptiveScale;
  }

  set culled(culled: boolean) {
    this._culled = culled;
  }

  get culled(): boolean {
    return this._culled;
  }

  set visible(visible: boolean) {
    this._visible = visible;
  }

  get visible(): boolean {
    return this._visible && !this._culled;
  }

  get position(): Vector3 {
    return this._position;
  }

  public intersect(ray: Ray): Vector3 | null {
    const sphere = new Sphere(this._position, this._adaptiveScale);
    return ray.intersectSphere(sphere, new Vector3());
  }

  public dispose(): void {
  }

  private setupAdaptiveScaling(position: THREE.Vector3): SetAdaptiveScaleDelegate {
    return ({camera, renderSize, domElement}) => {
      if (!this.visible) {
        return;
      }
      this._adaptiveScale = this.computeAdaptiveScaling(position, renderSize, domElement, camera, this._maxPixelSize, this._minPixelSize, this._iconRadius);
    };

  }

  private computeAdaptiveScaling(
    position: THREE.Vector3,
    renderSize: THREE.Vector2,
    domElement: HTMLElement,
    camera: THREE.Camera,
    maxHeight: number,
    minHeight: number,
    iconRadius: number
  ) {
    const { _ndcPosition } = this;
    _ndcPosition.set(position.x, position.y, position.z, 1);
    _ndcPosition.applyMatrix4(camera.matrixWorldInverse).applyMatrix4(camera.projectionMatrix);
    if (Math.abs(_ndcPosition.w) < 0.00001) {
      return 1.0;
    }
    const pointSize = renderSize.y * camera.projectionMatrix.elements[5] * (iconRadius / _ndcPosition.w);
    const resolutionDownSampleFactor = renderSize.x / domElement.clientWidth;
    const clampedSize = clamp(
      pointSize,
      minHeight * resolutionDownSampleFactor,
      maxHeight * resolutionDownSampleFactor
    );
    return (clampedSize / pointSize) * iconRadius;
  }
}
