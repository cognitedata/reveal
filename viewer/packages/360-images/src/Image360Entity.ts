/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { SceneHandler } from '@reveal/utilities';
import { Image360Descriptor, Image360FileProvider, Image360Face } from '@reveal/data-providers';
import assert from 'assert';

export class Image360Entity {
  private readonly _imageProvider: Image360FileProvider;
  private readonly _image360Metadata: Image360Descriptor;
  private readonly _sceneHandler: SceneHandler;
  private readonly _transform: THREE.Matrix4;

  get transform(): THREE.Matrix4 {
    return this._transform;
  }

  constructor(
    image360Metadata: Image360Descriptor,
    sceneHandler: SceneHandler,
    imageProvider: Image360FileProvider,
    postTransform?: THREE.Matrix4
  ) {
    this._sceneHandler = sceneHandler;
    this._imageProvider = imageProvider;
    this._image360Metadata = image360Metadata;

    this._transform =
      postTransform !== undefined
        ? postTransform.clone().multiply(image360Metadata.transform.clone())
        : image360Metadata.transform;

    const image360Icon = this.createSprite();
    image360Icon.applyMatrix4(this._transform);
    sceneHandler.addCustomObject(image360Icon);
  }

  public async activate360Image(): Promise<void> {
    const faces = await this._imageProvider.get360ImageFiles(this._image360Metadata);
    const box = await this.createImage360VisualizationObject(faces);
    box.applyMatrix4(this._transform);
    this._sceneHandler.addCustomObject(box);
  }
  private async createImage360VisualizationObject(faces: Image360Face[]): Promise<THREE.Mesh> {
    const loader = new THREE.TextureLoader();
    const faceTextures = await getTextures();

    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);

    const faceMaterials = [
      new THREE.MeshBasicMaterial({ side: THREE.BackSide, map: getFaceTexture('left'), depthTest: false }),
      new THREE.MeshBasicMaterial({ side: THREE.BackSide, map: getFaceTexture('right'), depthTest: false }),
      new THREE.MeshBasicMaterial({ side: THREE.BackSide, map: getFaceTexture('top'), depthTest: false }),
      new THREE.MeshBasicMaterial({ side: THREE.BackSide, map: getFaceTexture('bottom'), depthTest: false }),
      new THREE.MeshBasicMaterial({ side: THREE.BackSide, map: getFaceTexture('front'), depthTest: false }),
      new THREE.MeshBasicMaterial({ side: THREE.BackSide, map: getFaceTexture('back'), depthTest: false })
    ];
    const mesh = new THREE.Mesh(boxGeometry, faceMaterials);
    mesh.renderOrder = 3;
    return mesh;

    function getTextures() {
      return Promise.all(
        faces.map(async image360Face => {
          const blob = new Blob([image360Face.data]);
          const url = window.URL.createObjectURL(blob);
          const faceTexture = await loader.loadAsync(url);
          faceTexture.wrapS = THREE.RepeatWrapping;
          // Need to horizontally flip the texture since it is being rendered inside a cube
          faceTexture.repeat.x = -1;
          return { side: image360Face.face, faceTexture };
        })
      );
    }
    function getFaceTexture(side: 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom') {
      const face = faceTextures.find(p => p.side === side);
      assert(face !== undefined);
      return face.faceTexture;
    }
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

    function drawHoverSelector() {
      context.beginPath();
      context.fillStyle = '#FC2574';
      context.arc(textureSize / 2, textureSize / 2, textureSize / 2 - 42, 0, 2 * Math.PI);
      context.fill();
    }
  }
}
