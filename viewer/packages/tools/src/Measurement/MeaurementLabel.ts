/*!
 * Copyright 2022 Cognite AS
 */

import { Cognite3DViewer } from '@reveal/core';
import * as THREE from 'three';

export class MeasurementLabel {
  private readonly _viewer: Cognite3DViewer;
  private _label: THREE.Sprite;

  constructor(viewer: Cognite3DViewer) {
    this._viewer = viewer;
  }

  public getOverlayTexture(distance: string, size: number): THREE.Texture {
    const borderSize = 24;
    const baseWidth = 64;
    const ctx = document.createElement('canvas').getContext('2d');
    const font = `${64}px bold sans-serif`;
    ctx.font = font;

    const textWidth = ctx.measureText(distance).width;

    const doubleBorderSize = borderSize * 2;
    const width = baseWidth + doubleBorderSize + 10;
    const height = size + doubleBorderSize - 5;
    ctx.canvas.width = width;
    ctx.canvas.height = height;

    // need to set font again after resizing canvas
    ctx.font = font;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // scale to fit but don't stretch
    const scaleFactor = Math.min(1.0, width / textWidth);
    ctx.translate(width / 2, height / 2);
    ctx.scale(scaleFactor, 1);
    ctx.fillStyle = 'white';
    ctx.fillText(distance, 0, 0);

    ctx.canvas.style.borderRadius = '20px';

    const texture = new THREE.CanvasTexture(ctx.canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    return texture;
  }

  public addLabel(position: THREE.Vector3, texture: THREE.Texture): void {
    const labelMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
    this._label = new THREE.Sprite(labelMaterial);
    this._label.scale.set(0.3, 0.2, 1);
    this._label.position.set(position.x, position.y + 0.125, position.z);

    this._viewer.addObject3D(this._label);
  }

  public removeLabel(): void {
    if (this._label) {
      this._viewer.removeObject3D(this._label);
    }
  }

  public updateLabelTexture(texture: THREE.Texture): void {
    if (this._label) {
      this._label.material.map = texture;
    }
  }

  public updateLabelPosition(startPosition: THREE.Vector3, endPosition: THREE.Vector3): void {
    if (this._label) {
      let direction = endPosition.clone().sub(startPosition);
      const length = direction.length();
      direction = direction.normalize().multiplyScalar(length * 0.5);
      const midPoint = startPosition.clone().add(direction);
      midPoint.setY(midPoint.y + 0.125);
      this._label.position.copy(midPoint);
    }
  }
}
