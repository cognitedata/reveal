/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';

export class Image360Icon extends THREE.Group {
  private readonly MIN_PIXEL_SIZE = 32;
  private readonly MAX_PIXEL_SIZE = 256;
  private readonly _hoverSprite: THREE.Sprite;
  private readonly _outerSprite: THREE.Sprite;
  constructor(modelToWorldTransform: THREE.Matrix4) {
    super();
    this._hoverSprite = this.createHoverSprite();
    this._hoverSprite.visible = false;

    this._outerSprite = this.createOuterRingsSprite();

    this.setupAdaptiveScaling(modelToWorldTransform);

    this.add(this._outerSprite);
    this.add(this._hoverSprite);
    this.applyMatrix4(modelToWorldTransform);
  }

  set hoverSpriteVisible(visible: boolean) {
    this._hoverSprite.visible = visible;
  }

  public raycast(raycaster: THREE.Raycaster, intersects: THREE.Intersection<THREE.Object3D<THREE.Event>>[]): void {
    if (this.visible === false) {
      return;
    }
    const intersections: THREE.Intersection[] = [];
    this._outerSprite.raycast(raycaster, intersections);
    if (intersections.length > 0) {
      const obj = intersections[0];
      obj.object = this;
      intersects.push(obj);
    }
  }

  private setupAdaptiveScaling(modelToWorldTransform: THREE.Matrix4): void {
    const base = new THREE.Vector4();
    const offset = new THREE.Vector4();
    const transform = new THREE.Matrix4();

    this._outerSprite.onBeforeRender = (renderer: THREE.WebGLRenderer, _1: THREE.Scene, camera: THREE.Camera) => {
      const adaptiveScale = computeAdaptiveScaling(renderer, camera, this.MAX_PIXEL_SIZE, this.MIN_PIXEL_SIZE);
      this._outerSprite.scale.set(adaptiveScale, adaptiveScale, 1.0);
      this._outerSprite.updateMatrixWorld();
    };

    this._hoverSprite.onBeforeRender = (renderer: THREE.WebGLRenderer, _1: THREE.Scene, camera: THREE.Camera) => {
      const adaptiveScale = computeAdaptiveScaling(renderer, camera, this.MAX_PIXEL_SIZE, this.MIN_PIXEL_SIZE);
      this._hoverSprite.scale.set(adaptiveScale, adaptiveScale, 1.0);
      this._hoverSprite.updateMatrixWorld();
    };

    function computeAdaptiveScaling(
      renderer: THREE.WebGLRenderer,
      camera: THREE.Camera,
      maxHeight: number,
      minHeight: number
    ): number {
      const clientHeight = renderer.domElement.clientHeight;

      transform.copy(modelToWorldTransform);
      transform.premultiply(camera.matrixWorldInverse);

      base.set(0, 0, 0, 1);
      offset.set(0, 0.5, 0, 1);

      base.applyMatrix4(transform);
      offset.add(base);

      base.applyMatrix4(camera.projectionMatrix);
      offset.applyMatrix4(camera.projectionMatrix);

      const ndcHeight = Math.abs(offset.y / offset.w - base.y / base.w);
      const screenHeight = ndcHeight * clientHeight;

      return screenHeight > maxHeight
        ? maxHeight / screenHeight
        : screenHeight < minHeight
        ? minHeight / screenHeight
        : 1.0;
    }
  }

  private createOuterRingsSprite(): THREE.Sprite {
    const canvas = document.createElement('canvas');
    const textureSize = this.MAX_PIXEL_SIZE;
    canvas.width = textureSize;
    canvas.height = textureSize;

    const context = canvas.getContext('2d')!;
    drawInnerCircle();
    drawOuterCircle();

    const spriteMaterial = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), depthTest: true });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.updateMatrixWorld();
    sprite.renderOrder = 5;
    return sprite;

    function drawOuterCircle() {
      context.beginPath();
      context.lineWidth = textureSize / 16;
      context.strokeStyle = '#FFFFFF';
      context.arc(textureSize / 2, textureSize / 2, textureSize / 2 - context.lineWidth / 2, 0, 2 * Math.PI);
      context.stroke();
    }

    function drawInnerCircle() {
      context.beginPath();
      context.lineWidth = textureSize / 8;
      context.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      context.arc(textureSize / 2, textureSize / 2, textureSize / 2 - context.lineWidth, 0, 2 * Math.PI);
      context.shadowColor = 'red';
      context.stroke();
    }
  }

  private createHoverSprite(): THREE.Sprite {
    const canvas = document.createElement('canvas');
    const textureSize = this.MAX_PIXEL_SIZE;
    canvas.width = textureSize;
    canvas.height = textureSize;

    const context = canvas.getContext('2d')!;
    drawHoverSelector();

    const spriteMaterial = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), depthTest: true });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.updateMatrixWorld();
    sprite.renderOrder = 5;
    return sprite;

    function drawHoverSelector() {
      const outerCircleLineWidth = textureSize / 16;
      const innerCircleLineWidth = textureSize / 8;
      context.beginPath();
      context.fillStyle = '#FC2574';
      context.arc(
        textureSize / 2,
        textureSize / 2,
        textureSize / 2 - outerCircleLineWidth - 2 * innerCircleLineWidth,
        0,
        2 * Math.PI
      );
      context.fill();
    }
  }
}
