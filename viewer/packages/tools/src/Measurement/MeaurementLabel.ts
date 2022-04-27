/*!
 * Copyright 2022 Cognite AS
 */

import { Cognite3DViewer } from '@reveal/core';
import * as THREE from 'three';
import { MeasurementLabelOptions } from './types';

export class MeasurementLabel {
  private readonly _viewer: Cognite3DViewer;
  private _label: THREE.Sprite;
  private _options: MeasurementLabelOptions = {
    size: 64,
    radius: 20,
    font: '${64}px bold Georgia',
    fontColor: 'green',
    fillColor: 'rgba(255, 255, 255, 1.0)'
  };

  constructor(viewer: Cognite3DViewer, options?: MeasurementLabelOptions) {
    this._viewer = viewer;
    this._options = options;
  }

  /**
   * Create overlay texture to be added as Sprite
   * @param label String to be added into the Sprite
   * @param size Size of the label
   * @returns Texture object containing label string
   */
  public getOverlayTexture(label: string): THREE.Texture {
    const borderSize = 24;
    const baseWidth = 64;
    const ctx = document.createElement('canvas').getContext('2d');
    const font = ``;
    ctx.font = font;

    const textWidth = ctx.measureText(label).width;

    const doubleBorderSize = borderSize * 2;
    const width = baseWidth + doubleBorderSize + 10;
    const height = this._options.size + doubleBorderSize - 5;
    ctx.canvas.width = width;
    ctx.canvas.height = height;

    // need to set font again after resizing canvas
    ctx.font = this._options.font;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    ctx.fillStyle = this._options.fillColor;
    this.roundRect(ctx, 0, 0, ctx.canvas.width, ctx.canvas.height);

    // scale to fit but don't stretch
    const scaleFactor = Math.min(1.0, width / textWidth);
    ctx.translate(width / 2, height / 2);
    ctx.scale(scaleFactor, 1);
    ctx.fillStyle = this._options.fontColor;
    ctx.fillText(label, 0, 0);

    ctx.canvas.style.borderRadius = '20px';

    const texture = new THREE.CanvasTexture(ctx.canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    return texture;
  }

  /**
   * Create a rounded Rectangle
   * @param ctx Canvas context to be used
   * @param x start point x
   * @param y start point y
   * @param width width of the rectangle
   * @param height height of the rectangle
   * @param stroke is the rectangle to be stroked
   */
  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    stroke?: boolean
  ) {
    if (typeof stroke === 'undefined') {
      stroke = true;
    }
    let radiusParameter: any;
    if (typeof this._options.radius === 'number') {
      radiusParameter = {
        tl: this._options.radius,
        tr: this._options.radius,
        br: this._options.radius,
        bl: this._options.radius
      };
    } else {
      const defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
      for (const side in defaultRadius) {
        this._options.radius[side] = this._options.radius[side] || defaultRadius[side];
      }
    }
    ctx.beginPath();
    ctx.moveTo(x + radiusParameter.tl, y);
    ctx.lineTo(x + width - radiusParameter.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radiusParameter.tr);
    ctx.lineTo(x + width, y + height - radiusParameter.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radiusParameter.br, y + height);
    ctx.lineTo(x + radiusParameter.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radiusParameter.bl);
    ctx.lineTo(x, y + radiusParameter.tl);
    ctx.quadraticCurveTo(x, y, x + radiusParameter.tl, y);
    ctx.closePath();
    ctx.fill();

    if (stroke) {
      ctx.stroke();
    }
  }

  /**
   * Updates the label parameters
   * @param options MeasurementLabelOptions of size, radius, font, font color & fill color
   */
  public updateLabelOptions(options: MeasurementLabelOptions): void {
    this._options = options;
  }

  /**
   * Add a label
   * @param position Label position
   * @param texture Texture for the sprite
   */
  public addLabel(position: THREE.Vector3, texture: THREE.Texture): void {
    const labelMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });

    this._label = new THREE.Sprite(labelMaterial);
    this._label.scale.set(0.5, 0.25, 1.0);
    this._label.position.set(position.x, position.y + 0.15, position.z);

    this._viewer.addObject3D(this._label);
  }

  /**
   * Remove the label
   */
  public removeLabel(): void {
    if (this._label) {
      this._viewer.removeObject3D(this._label);
    }
  }

  /**
   * Update the label texture
   * @param texture updated texture
   */
  public updateLabelTexture(texture: THREE.Texture): void {
    if (this._label) {
      this._label.material.map.dispose();
      this._label.material.map = texture;
    }
  }

  /**
   * Update the label position
   * @param startPosition start point
   * @param endPosition end point
   */
  public updateLabelPosition(startPosition: THREE.Vector3, endPosition: THREE.Vector3): void {
    if (this._label) {
      let direction = endPosition.clone().sub(startPosition);
      const length = direction.length();
      direction = direction.normalize().multiplyScalar(length * 0.5);
      const midPoint = startPosition.clone().add(direction);
      midPoint.setY(midPoint.y + 0.15);
      this._label.position.copy(midPoint);
    }
  }
}
