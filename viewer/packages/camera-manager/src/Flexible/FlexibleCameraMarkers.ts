/*!
 * Copyright 2024 Cognite AS
 */

import { Scene, Object3D, Vector3, Sprite, SpriteMaterial, CanvasTexture } from 'three';
import { FlexibleCameraManager } from './FlexibleCameraManager';
import { FlexibleControlsType } from './FlexibleControlsType';
import { FlexibleControlsOptions } from './FlexibleControlsOptions';

const TEXTURE_SIZE = 25;
const LINE_WIDTH = 3;
const NO_DEPTH_TEST_OPACITY = 0.5;

export class FlexibleCameraMarkers {
  private readonly _scene: Scene;
  private _targetMarker1: Sprite | undefined;
  private _targetMarker2: Sprite | undefined;

  //================================================
  // CONSTRUCTOR
  //================================================

  constructor(scene: Scene) {
    this._scene = scene;
  }

  //================================================
  // INSTANCE METHODS: Update helper Objects
  //================================================

  public update(manager: FlexibleCameraManager): void {
    if (this.isVisible(manager)) {
      if (this._targetMarker1 === undefined) {
        this._targetMarker1 = createSprite(manager.options, true);
        this._scene.add(this._targetMarker1);
      }
      if (this._targetMarker2 === undefined) {
        this._targetMarker2 = createSprite(manager.options, false);
        this._scene.add(this._targetMarker2);
      }
      for (const marker of this.getMarkers()) {
        setPosition(marker, manager.controls.getTarget(), manager);
        if (!marker.visible) {
          marker.visible = true;
        }
      }
    } else {
      for (const marker of this.getMarkers()) {
        if (marker.visible) {
          marker.visible = false;
        }
      }
    }
  }

  public dispose(): void {
    for (const marker of this.getMarkers()) {
      this._scene.remove(marker);
      marker.material.map?.dispose();
      marker.material.dispose();
      marker.geometry.dispose();
    }
    this._targetMarker1 = undefined;
    this._targetMarker2 = undefined;
  }

  private isVisible(manager: FlexibleCameraManager): boolean {
    if (!manager.options.showTarget) {
      return false;
    }
    if (!manager.isEnabled) {
      return false;
    }
    if (manager.controls.isStationary) {
      return false;
    }
    if (manager.options.controlsType === FlexibleControlsType.FirstPerson) {
      return false;
    }
    return true;
  }

  private *getMarkers(): Generator<Sprite> {
    if (this._targetMarker1 !== undefined) yield this._targetMarker1;
    if (this._targetMarker2 !== undefined) yield this._targetMarker2;
  }
}

function setPosition(object3D: Object3D, position: Vector3, manager: FlexibleCameraManager): void {
  const distance = position.distanceTo(manager.camera.position);
  const scale = manager.options.relativeMarkerSize * distance;

  object3D.position.copy(position);
  object3D.scale.setScalar(scale);
  object3D.updateMatrixWorld();
}

function createSprite(options: FlexibleControlsOptions, depthTest: boolean): Sprite {
  const texture = createTexture(TEXTURE_SIZE, LINE_WIDTH, options.outerMarkerColor, options.innerMarkerColor);
  const material = new SpriteMaterial({ map: texture, depthTest });
  if (!depthTest) {
    material.transparent = true;
    material.opacity = NO_DEPTH_TEST_OPACITY;
  }
  const sprite = new Sprite(material);
  sprite.updateMatrixWorld();
  sprite.visible = true;
  return sprite;
}

function createTexture(textureSize: number, lineWidth: number, outerColor: string, innerColor: string): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = textureSize;
  canvas.height = textureSize;

  const center = textureSize / 2;
  const radius = textureSize / 2 - lineWidth - 1;
  const context = canvas.getContext('2d')!;

  context.beginPath();
  context.fillStyle = innerColor;
  context.ellipse(center, center, radius, radius, 0, 0, 2 * Math.PI);
  context.fill();

  context.beginPath();
  context.strokeStyle = outerColor;
  context.lineWidth = lineWidth;
  context.ellipse(center, center, radius, radius, 0, 0, 2 * Math.PI);
  context.stroke();

  return new CanvasTexture(canvas);
}
