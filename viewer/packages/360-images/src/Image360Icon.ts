/*!
 * Copyright 2022 Cognite AS
 */

import { AttributeDataAccessor, SceneHandler } from '@reveal/utilities';
import * as THREE from 'three';
import { Ray, Sphere, Vector3 } from 'three';

export class Image360Icon {
  private readonly MIN_PIXEL_SIZE = 16;
  private readonly MAX_PIXEL_SIZE = 64;
  private readonly _hoverSprite: THREE.Sprite;
  private readonly _alphaAttributeAccessor: AttributeDataAccessor<Uint8ClampedArray>;
  private readonly _position: THREE.Vector3;
  constructor(
    position: THREE.Vector3,
    sceneHandler: SceneHandler,
    alphaAttributeAccessor: AttributeDataAccessor<Uint8ClampedArray>
  ) {
    this._alphaAttributeAccessor = alphaAttributeAccessor;

    this._hoverSprite = this.createHoverSprite();
    this._hoverSprite.position.copy(position);
    this._hoverSprite.visible = false;

    this._position = position;

    this.setupAdaptiveScaling(position);

    sceneHandler.addCustomObject(this._hoverSprite);
  }

  set visible(visible: boolean) {
    const alpha = visible ? 255 : 0;
    this._alphaAttributeAccessor.set([alpha]);
  }

  get visible(): boolean {
    const alpha = this._alphaAttributeAccessor.at(0)!;
    return alpha > 0;
  }

  set hoverSpriteVisible(visible: boolean) {
    this._hoverSprite.visible = visible;
  }

  public intersect(ray: Ray): Vector3 | null {
    const sphere = new Sphere(this._position, 0.5 * this._hoverSprite.scale.x);
    return ray.intersectSphere(sphere, new Vector3());
  }

  public dispose(): void {
    this._hoverSprite.material.map?.dispose();
    this._hoverSprite.material.dispose();
    this._hoverSprite.geometry.dispose();
  }

  private setupAdaptiveScaling(position: THREE.Vector3): void {
    const base = new THREE.Vector4();
    const offset = new THREE.Vector4();
    const transform = new THREE.Matrix4();

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

      transform.makeTranslation(position.x, position.y, position.z);
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
