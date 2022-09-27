/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { SceneHandler } from '@reveal/utilities';
import { Image360Descriptor, Image360FileProvider } from '@reveal/data-providers';

export type Image360Face = {
  side: 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom';
  data: ArrayBuffer;
};

export class Image360Entity {
  private readonly _imageProvider: Image360FileProvider;
  private readonly _image360Metadata: Image360Descriptor;
  constructor(
    image360Metadata: Image360Descriptor,
    sceneHandler: SceneHandler,
    imageProvider: Image360FileProvider,
    postTransform?: THREE.Matrix4
  ) {
    this._imageProvider = imageProvider;
    this._image360Metadata = image360Metadata;

    const transform =
      postTransform !== undefined
        ? postTransform.clone().multiply(image360Metadata.transform.clone())
        : image360Metadata.transform;

    const image360Icon = this.createSprite();
    image360Icon.applyMatrix4(transform);

    sceneHandler.addCustomObject(image360Icon);
  }

  public async activate360Image(): Promise<void> {
    await this._imageProvider.get360ImageFiles(this._image360Metadata);
    throw new Error('Not implemented');
  }

  private createSprite(): THREE.Sprite {
    const canvas = document.createElement('canvas');
    const textureSize = 128;
    canvas.width = textureSize;
    canvas.height = textureSize;

    const context = canvas.getContext('2d')!;
    drawInnerCircle();
    drawOuterCircle();
    drawHoverSelector();

    const spriteMaterial = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), depthTest: false });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.updateMatrixWorld();
    sprite.renderOrder = 3;
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

    function drawHoverSelector() {
      context.beginPath();
      context.fillStyle = '#FC2574';
      context.arc(textureSize / 2, textureSize / 2, textureSize / 2 - 42, 0, 2 * Math.PI);
      context.fill();
    }
  }
}
