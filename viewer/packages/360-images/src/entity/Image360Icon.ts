/*!
 * Copyright 2022 Cognite AS
 */

import { AttributeDataAccessor, EventTrigger, SceneHandler } from '@reveal/utilities';
import * as THREE from 'three';
import { Ray, Sphere, Vector3 } from 'three';
import { clamp } from 'three/src/math/MathUtils';

export class Image360Icon {
  private readonly _hoverSprite: THREE.Sprite;
  private readonly _alphaAttributeAccessor: AttributeDataAccessor<Uint8ClampedArray>;
  private readonly _position: THREE.Vector3;
  private readonly _sceneHandler: SceneHandler;
  private _adaptiveScale = 1;
  private readonly _minPixelSize: number;
  private readonly _maxPixelSize: number;
  private readonly _setAdaptiveScale: (renderer: THREE.WebGLRenderer, camera: THREE.Camera) => void;
  private readonly _onRenderTrigger: EventTrigger<(renderer: THREE.WebGLRenderer, camera: THREE.Camera) => void>;

  constructor(
    position: THREE.Vector3,
    hoverIconTexture: THREE.CanvasTexture,
    sceneHandler: SceneHandler,
    alphaAttributeAccessor: AttributeDataAccessor<Uint8ClampedArray>,
    minPixelSize: number,
    maxPixelSize: number,
    onRenderTrigger: EventTrigger<(renderer: THREE.WebGLRenderer, camera: THREE.Camera) => void>
  ) {
    this._minPixelSize = minPixelSize;
    this._maxPixelSize = maxPixelSize;
    this._alphaAttributeAccessor = alphaAttributeAccessor;

    this._hoverSprite = this.createHoverSprite(hoverIconTexture);
    this._hoverSprite.position.copy(position);
    this._hoverSprite.visible = false;

    this._setAdaptiveScale = this.setupAdaptiveScaling(position);
    onRenderTrigger.subscribe(this._setAdaptiveScale);

    sceneHandler.addCustomObject(this._hoverSprite);

    this._position = position;
    this._sceneHandler = sceneHandler;
    this._onRenderTrigger = onRenderTrigger;
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
    const sphere = new Sphere(this._position, 0.5 * this._adaptiveScale);
    return ray.intersectSphere(sphere, new Vector3());
  }

  public dispose(): void {
    this._onRenderTrigger.unsubscribe(this._setAdaptiveScale);
    this._sceneHandler.removeCustomObject(this._hoverSprite);
    this._hoverSprite.material.dispose();
    this._hoverSprite.geometry.dispose();

    this._alphaAttributeAccessor.set([0]);
  }

  private setupAdaptiveScaling(position: THREE.Vector3): (renderer: THREE.WebGLRenderer, camera: THREE.Camera) => void {
    const ndcPosition = new THREE.Vector4();
    const renderSize = new THREE.Vector2();
    return (renderer: THREE.WebGLRenderer, camera: THREE.Camera) => {
      this._adaptiveScale = computeAdaptiveScaling(renderer, camera, this._maxPixelSize, this._minPixelSize);
      this._hoverSprite.scale.set(this._adaptiveScale, this._adaptiveScale, 1.0);
    };

    function computeAdaptiveScaling(
      renderer: THREE.WebGLRenderer,
      camera: THREE.Camera,
      maxHeight: number,
      minHeight: number
    ) {
      ndcPosition.set(position.x, position.y, position.z, 1);
      ndcPosition.applyMatrix4(camera.matrixWorldInverse).applyMatrix4(camera.projectionMatrix);
      if (Math.abs(ndcPosition.w) < 0.00001) {
        return 1.0;
      }
      renderer.getSize(renderSize);
      const pointSize = (renderSize.y * camera.projectionMatrix.elements[5] * 0.5) / ndcPosition.w;
      const resolutionDownSampleFactor = renderSize.x / renderer.domElement.clientWidth;
      const clampedSize = clamp(
        pointSize,
        minHeight * resolutionDownSampleFactor,
        maxHeight * resolutionDownSampleFactor
      );
      return clampedSize / pointSize;
    }
  }

  private createHoverSprite(hoverIconTexture: THREE.CanvasTexture): THREE.Sprite {
    const spriteMaterial = new THREE.SpriteMaterial({ map: hoverIconTexture, depthTest: false });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.updateMatrixWorld();
    sprite.renderOrder = 5;
    return sprite;
  }
}
