/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { DeviceDescriptor, SceneHandler } from '@reveal/utilities';
import assert from 'assert';
import { Image360Face, Image360Texture } from '@reveal/data-providers';
import { Image360Visualization } from './Image360Visualization';
import { ImageAnnotationObject } from '../annotation/ImageAnnotationObject';

type VisualizationState = {
  opacity: number;
  visible: boolean;
  scale: THREE.Vector3;
  renderOrder: number;
};

export const DEFAULT_IMAGE_360_OPACITY = 1;

export class Image360VisualizationBox implements Image360Visualization {
  private readonly MAX_MOBILE_IMAGE_SIZE = 1024;
  private readonly _worldTransform: THREE.Matrix4;
  private _visualizationMesh: THREE.Mesh | undefined;
  private _faceMaterials: THREE.MeshBasicMaterial[] = [];
  private readonly _sceneHandler: SceneHandler;
  private readonly _device: DeviceDescriptor;
  private readonly _visualizationState: VisualizationState;
  private readonly _textureLoader: THREE.TextureLoader;
  private readonly _faceMaterialOrder: Image360Face['face'][] = ['left', 'right', 'top', 'bottom', 'front', 'back'];
  private readonly _annotationsGroup: THREE.Group = new THREE.Group();
  private readonly _localTransform: THREE.Matrix4;

  get visible(): boolean {
    return this._visualizationState.visible;
  }

  set visible(value: boolean) {
    this._visualizationState.visible = value;

    if (this._visualizationMesh === undefined) {
      return;
    }
    this._visualizationMesh.visible = value;
  }

  get opacity(): number {
    return this._visualizationState.opacity;
  }

  set opacity(value: number) {
    this._visualizationState.opacity = value;

    this._faceMaterials.forEach(material => {
      material.opacity = value;
    });
  }

  set scale(value: THREE.Vector3) {
    this._visualizationState.scale = value;

    if (this._visualizationMesh === undefined) {
      return;
    }

    this._visualizationMesh.scale.copy(value);
  }

  set renderOrder(value: number) {
    this._visualizationState.renderOrder = value;

    if (this._visualizationMesh === undefined) {
      return;
    }

    this._visualizationMesh.renderOrder = value;
  }

  setAnnotations(annotations: ImageAnnotationObject[]): void {
    this._annotationsGroup.remove(...this._annotationsGroup.children);

    if (annotations.length === 0) {
      return;
    }

    this._annotationsGroup.add(...annotations.map(a => a.getObject()));
  }

  constructor(worldTransform: THREE.Matrix4, sceneHandler: SceneHandler, device: DeviceDescriptor) {
    this._localTransform = worldTransform.clone();
    this._worldTransform = worldTransform.clone();
    this._sceneHandler = sceneHandler;
    this._device = device;
    this._textureLoader = new THREE.TextureLoader();
    this._visualizationState = {
      opacity: DEFAULT_IMAGE_360_OPACITY,
      renderOrder: 3,
      scale: new THREE.Vector3(1, 1, 1),
      visible: true
    };
  }

  public setWorldTransform(matrix: THREE.Matrix4): void {
    this._worldTransform.copy(matrix).multiply(this._localTransform);

    if (this._visualizationMesh) {
      this._visualizationMesh.position.setFromMatrixPosition(this._worldTransform);
      this._visualizationMesh.rotation.setFromRotationMatrix(this._worldTransform);
    }
  }

  public loadImages(textures: Image360Texture[]): void {
    if (this._visualizationMesh) {
      this._faceMaterialOrder.forEach((face, index) => {
        this._faceMaterials[index].map = getFaceTexture(face);
      });
      return;
    }

    this._faceMaterials = this._faceMaterialOrder.map(
      face =>
        new THREE.MeshBasicMaterial({
          side: THREE.BackSide,
          map: getFaceTexture(face),
          depthTest: false,
          opacity: this._visualizationState.opacity,
          transparent: true
        })
    );

    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    const visualizationMesh = new THREE.Mesh(boxGeometry, this._faceMaterials);
    visualizationMesh.renderOrder = this._visualizationState.renderOrder;
    visualizationMesh.position.setFromMatrixPosition(this._worldTransform);
    visualizationMesh.rotation.setFromRotationMatrix(this._worldTransform);
    visualizationMesh.scale.copy(this._visualizationState.scale);
    visualizationMesh.visible = this._visualizationState.visible;
    visualizationMesh.add(this._annotationsGroup);
    this.setAnnotationsVisibility(false);
    this._visualizationMesh = visualizationMesh;

    this._sceneHandler.addObject3D(this._visualizationMesh);

    function getFaceTexture(face: Image360Face['face']) {
      const texture = textures.find(p => p.face === face);
      assert(texture !== undefined);
      return texture.texture;
    }
  }

  public loadFaceTextures(faces: Image360Face[]): Promise<Image360Texture[]> {
    return Promise.all(
      faces.map(async image360Face => {
        const blob = new Blob([image360Face.data], { type: image360Face.mimeType });
        const url = window.URL.createObjectURL(blob);
        let faceTexture = await this._textureLoader.loadAsync(url);

        if (
          this._device.deviceType === 'mobile' &&
          (faceTexture.image.width > this.MAX_MOBILE_IMAGE_SIZE ||
            faceTexture.image.height > this.MAX_MOBILE_IMAGE_SIZE)
        ) {
          faceTexture = await this.getScaledImageTexture(faceTexture, this.MAX_MOBILE_IMAGE_SIZE);
        }

        // Expecting the object-url to have been loaded into the texture, so we can revoke its blob reference, allowing the release of the blob from memory.
        window.URL.revokeObjectURL(url);

        // Need to horizontally flip the texture since it is being rendered inside a cube
        faceTexture.center.set(0.5, 0.5);
        faceTexture.repeat.set(-1, 1);
        return { face: image360Face.face, texture: faceTexture };
      })
    );
  }

  public unloadImages(): void {
    if (this._visualizationMesh === undefined) {
      return;
    }
    this._sceneHandler.removeObject3D(this._visualizationMesh);
    const imageContainerMaterial = this._visualizationMesh.material;
    const materials =
      imageContainerMaterial instanceof THREE.Material ? [imageContainerMaterial] : imageContainerMaterial;

    materials
      .map(material => material as THREE.MeshBasicMaterial)
      .forEach(material => {
        material.map?.dispose();
        material.dispose();
      });

    this._visualizationMesh.geometry.dispose();
    this._visualizationMesh = undefined;
    this._faceMaterials = [];
  }

  private async getScaledImageTexture(texture: THREE.Texture, imageSize: number): Promise<THREE.Texture> {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    //Scale down the width and height
    let width = texture.image.width;
    let height = texture.image.height;

    // Calculate new dimensions while maintaining aspect ratio
    if (width > imageSize) {
      height *= imageSize / width;
      width = imageSize;
    }
    if (height > imageSize) {
      width *= imageSize / height;
      height = imageSize;
    }
    canvas.width = width;
    canvas.height = height;

    context!.drawImage(texture.image, 0, 0, canvas.width, canvas.height);

    const scaledImageTexture = new THREE.CanvasTexture(canvas);
    texture.dispose();

    return scaledImageTexture;
  }

  public setAnnotationsVisibility(visibility: boolean): void {
    this._annotationsGroup.visible = visibility;
  }
}
