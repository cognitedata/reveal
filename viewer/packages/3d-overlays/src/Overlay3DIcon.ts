/*!
 * Copyright 2022 Cognite AS
 */

import { assertNever, EventTrigger } from '@reveal/utilities';
import {
  PerspectiveCamera,
  Ray,
  Sphere,
  Vector3,
  Vector4,
  MathUtils,
  Color,
  Matrix4,
  Sprite,
  Camera,
  Vector2
} from 'three';
import { Overlay3D } from './Overlay3D';
import { DefaultOverlay3DContentType } from './OverlayCollection';

export type IconParameters = {
  position: Vector3;
  color?: Color;
  minPixelSize: number;
  maxPixelSize: number;
  iconRadius: number;
  hoverSprite?: Sprite;
};

export type SetAdaptiveScaleDelegate = (args: { camera: Camera; renderSize: Vector2; domElement: HTMLElement }) => void;

export type ParametersChangeDelegate = (event: { color: Color; visible: boolean }) => void;
export type SelectedDelegate = (event: { selected: boolean }) => void;

export type IconEvent = 'selected' | 'parametersChange';

export class Overlay3DIcon<ContentType = DefaultOverlay3DContentType> implements Overlay3D<ContentType> {
  private readonly _position: Vector3;
  private readonly _minPixelSize: number;
  private readonly _maxPixelSize: number;
  private readonly _setAdaptiveScale: SetAdaptiveScaleDelegate;
  private readonly _iconRadius: number;
  private readonly _hoverSprite?: Sprite;
  private readonly _content: ContentType;
  private readonly _raycastBoundingSphere = new Sphere();
  private readonly _defaultColor: Color;

  private _adaptiveScale = 1;
  private _visible = true;
  private _culled = false;
  private _selected = false;
  private _color = new Color('white');
  private readonly _worldTransform: Matrix4;
  private readonly _ndcPosition = new Vector4();

  private readonly _events = {
    selected: new EventTrigger<SelectedDelegate>(),
    parametersChange: new EventTrigger<ParametersChangeDelegate>()
  };

  constructor(iconParameters: IconParameters, content: ContentType) {
    const { position, minPixelSize, maxPixelSize, iconRadius, hoverSprite, color } = iconParameters;

    this._worldTransform = new Matrix4();
    this._minPixelSize = minPixelSize;
    this._maxPixelSize = maxPixelSize;
    this._iconRadius = iconRadius;
    this._hoverSprite = hoverSprite;
    this._content = content;
    this._color = color ?? this._color;
    this._defaultColor = this._color;

    this._setAdaptiveScale = this.setupAdaptiveScaling(position);

    this._position = position;
  }
  on(event: 'selected', callback: SelectedDelegate): void;
  on(event: 'parametersChange', callback: ParametersChangeDelegate): void;
  on(event: IconEvent, callback: SelectedDelegate | ParametersChangeDelegate): void {
    switch (event) {
      case 'selected':
        this._events.selected.subscribe(callback as SelectedDelegate);
        break;
      case 'parametersChange':
        this._events.parametersChange.subscribe(callback as ParametersChangeDelegate);
        break;
      default:
        assertNever(event);
    }
  }

  off(event: 'selected', callback: SelectedDelegate): void;
  off(event: 'parametersChange', callback: ParametersChangeDelegate): void;
  off(event: IconEvent, callback: SelectedDelegate | ParametersChangeDelegate): void {
    switch (event) {
      case 'selected':
        this._events.selected.unsubscribe(callback as SelectedDelegate);
        break;
      case 'parametersChange':
        this._events.parametersChange.unsubscribe(callback as ParametersChangeDelegate);
        break;
      default:
        assertNever(event);
    }
  }

  set selected(newValue: boolean) {
    if (this._selected !== newValue) {
      this._events.selected.fire({ selected: newValue });
      this._selected = newValue;
    }

    if (this._hoverSprite && this._selected) {
      this._hoverSprite.position.copy(this._position);
      this._hoverSprite.scale.set(this._adaptiveScale * 2, this._adaptiveScale * 2, 1);
    }
  }

  get selected(): boolean {
    return this._selected;
  }

  updateHoverSpriteScale(): void {
    if (!this._hoverSprite) {
      return;
    }
    this._hoverSprite.scale.set(this._adaptiveScale * 2, this._adaptiveScale * 2, 1);
  }

  updateAdaptiveScale(delegateArguments: {
    renderSize: Vector2;
    camera: PerspectiveCamera;
    domElement: HTMLElement;
  }): void {
    this._setAdaptiveScale(delegateArguments);

    if (this._hoverSprite && this._selected) {
      this._hoverSprite.scale.set(this._adaptiveScale * 2, this._adaptiveScale * 2, 1);
    }
  }

  setColor(color: Color | 'default'): void {
    if (color === 'default') {
      this._color = this._defaultColor;
    } else {
      this._color = color;
    }
    this._events.parametersChange.fire({ color: this._color, visible: this.getVisible() });
  }

  getColor(): Color {
    return this._color;
  }

  getContent(): ContentType {
    return this._content;
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

  public setVisible(visible: boolean): void {
    this._visible = visible;
    this._events.parametersChange.fire({ color: this._color, visible: visible });
  }

  public getVisible(): boolean {
    return this._visible && !this._culled;
  }

  public getPosition(): Vector3 {
    return this._position;
  }

  public setWorldTransform(matrix: Matrix4): void {
    this._worldTransform.copy(matrix);
  }

  public intersect(ray: Ray): Vector3 | null {
    this._raycastBoundingSphere.set(this._position, this._adaptiveScale);

    return ray.intersectSphere(this._raycastBoundingSphere, new Vector3());
  }

  public dispose(): void {
    this._events.selected.unsubscribeAll();
    this._events.parametersChange.unsubscribeAll();
  }

  private setupAdaptiveScaling(position: Vector3): SetAdaptiveScaleDelegate {
    return ({ camera, renderSize, domElement }) => {
      if (!this.getVisible()) {
        return;
      }
      this._adaptiveScale = this.computeAdaptiveScaling(
        position,
        renderSize,
        domElement,
        camera,
        this._maxPixelSize,
        this._minPixelSize,
        this._iconRadius
      );
    };
  }

  private computeAdaptiveScaling(
    position: Vector3,
    renderSize: Vector2,
    domElement: HTMLElement,
    camera: Camera,
    maxHeight: number,
    minHeight: number,
    iconRadius: number
  ) {
    const { _ndcPosition } = this;
    _ndcPosition.set(position.x, position.y, position.z, 1);
    _ndcPosition
      .applyMatrix4(this._worldTransform)
      .applyMatrix4(camera.matrixWorldInverse)
      .applyMatrix4(camera.projectionMatrix);
    if (Math.abs(_ndcPosition.w) < 0.00001) {
      return 1.0;
    }
    const pointSize = renderSize.y * camera.projectionMatrix.elements[5] * (iconRadius / _ndcPosition.w);
    const resolutionDownSampleFactor = renderSize.x / domElement.clientWidth;
    const clampedSize = MathUtils.clamp(
      pointSize,
      minHeight * resolutionDownSampleFactor,
      maxHeight * resolutionDownSampleFactor
    );
    return (clampedSize / pointSize) * iconRadius;
  }
}
