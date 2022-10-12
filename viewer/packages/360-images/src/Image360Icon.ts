/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';

export class Image360Icon extends THREE.Group {
  private readonly _hoverSprite: THREE.Sprite;
  private readonly _outerSprite: THREE.Sprite;
  constructor() {
    super();
    this._hoverSprite = this.createHoverSprite();
    this._hoverSprite.visible = false;

    this._outerSprite = this.createOuterRingsSprite();

    this.add(this._outerSprite);
    this.add(this._hoverSprite);
  }

  set hoverSpriteVisible(visible: boolean) {
    this._hoverSprite.visible = visible;
  }

  public raycast(raycaster: THREE.Raycaster, intersects: THREE.Intersection<THREE.Object3D<THREE.Event>>[]): void {
    if (this.visible === false) {
      return;
    }
    const test: THREE.Intersection[] = [];
    this._hoverSprite.raycast(raycaster, test);
    if (test.length > 0) {
      const obj = test[0];
      obj.object = this;
      intersects.push(obj);
    }
  }

  private createOuterRingsSprite(): THREE.Sprite {
    const canvas = document.createElement('canvas');
    const textureSize = 128;
    canvas.width = textureSize;
    canvas.height = textureSize;

    const context = canvas.getContext('2d')!;
    drawInnerCircle();
    drawOuterCircle();

    const spriteMaterial = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), depthTest: true });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.updateMatrixWorld();
    sprite.renderOrder = 4;
    return sprite;

    function drawOuterCircle() {
      context.beginPath();
      context.lineWidth = 8;
      context.strokeStyle = '#FFFFFF';
      context.arc(textureSize / 2, textureSize / 2, textureSize / 2 - 4, 0, 2 * Math.PI);
      context.stroke();
    }

    function drawInnerCircle() {
      context.beginPath();
      context.lineWidth = 16;
      context.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      context.arc(textureSize / 2, textureSize / 2, textureSize / 2 - 16, 0, 2 * Math.PI);
      context.shadowColor = 'red';
      context.stroke();
    }
  }

  private createHoverSprite(): THREE.Sprite {
    const canvas = document.createElement('canvas');
    const textureSize = 128;
    canvas.width = textureSize;
    canvas.height = textureSize;

    const context = canvas.getContext('2d')!;
    drawHoverSelector();

    const spriteMaterial = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), depthTest: true });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.updateMatrixWorld();
    sprite.renderOrder = 4;
    return sprite;

    function drawHoverSelector() {
      context.beginPath();
      context.fillStyle = '#FC2574';
      context.arc(textureSize / 2, textureSize / 2, textureSize / 2 - 42, 0, 2 * Math.PI);
      context.fill();
    }
  }
}
