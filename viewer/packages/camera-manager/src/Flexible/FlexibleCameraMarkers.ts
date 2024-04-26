/*!
 * Copyright 2024 Cognite AS
 */

import { Scene, Object3D, Vector3, Sprite, SpriteMaterial, CanvasTexture } from 'three';
import { FlexibleCameraManager } from './FlexibleCameraManager';
import { FlexibleControlsType } from './FlexibleControlsType';

export class FlexibleCameraMarkers {
  private readonly _scene: Scene;
  private _targetMarker: Object3D | undefined;

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
      if (!this._targetMarker) {
        this._targetMarker = createSprite(manager.options.outerMarkerColor, manager.options.innerMarkerColor);
        this._scene.add(this._targetMarker);
        this._targetMarker.visible = true;
      } else if (!this._targetMarker.visible) {
        this._targetMarker.visible = true;
      }
      setPosition(this._targetMarker, manager.controls.getTarget(), manager);
    } else {
      if (this._targetMarker && this._targetMarker.visible) {
        this._targetMarker.visible = false;
      }
    }
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
}

function setPosition(object3D: Object3D, position: Vector3, manager: FlexibleCameraManager): void {
  const distance = position.distanceTo(manager.camera.position);
  const scale = manager.options.relativeMarkerSize * distance;

  object3D.position.copy(position);
  object3D.scale.setScalar(scale);
  object3D.updateMatrixWorld();
}

function createSprite(outerColor: string, innerColor: string): Sprite {
  const texture = createTexture(25, 3, outerColor, innerColor);
  const material = new SpriteMaterial({ map: texture, depthTest: false });
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
