/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import type { DeviceDescriptor, SceneHandler } from '@reveal/utilities';
import assert from 'assert';
import type { DataSourceType, Image360Face, Image360Texture } from '@reveal/data-providers';
import type { Image360Visualization } from './Image360Visualization';
import type { ImageAnnotationObject } from '../annotation/ImageAnnotationObject';
import type { JpegType } from '../utils/JpegDataStreamParser';
import { Image360FaceTextureLoader, hasDownloadUrl, type FaceTextureLoader } from './Image360FaceTextureLoader';

type VisualizationState = {
  opacity: number;
  visible: boolean;
  scale: THREE.Vector3;
  renderOrder: number;
};

export const DEFAULT_IMAGE_360_OPACITY = 1;

export class Image360VisualizationBox implements Image360Visualization {
  private readonly _worldTransform: THREE.Matrix4;
  private _visualizationMesh: THREE.Mesh | undefined;
  private _faceMaterials: THREE.MeshBasicMaterial[] = [];
  private readonly _sceneHandler: SceneHandler;
  private readonly _visualizationState: VisualizationState;
  private readonly _textureLoader: THREE.TextureLoader;
  private readonly _faceMaterialOrder: Image360Face['face'][] = ['left', 'right', 'top', 'bottom', 'front', 'back'];
  private readonly _annotationsGroup: THREE.Group = new THREE.Group();
  private readonly _localTransform: THREE.Matrix4;
  private readonly _loader: FaceTextureLoader;

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

  setAnnotations(annotations: ImageAnnotationObject<DataSourceType>[]): void {
    this._annotationsGroup.remove(...this._annotationsGroup.children);

    if (annotations.length === 0) {
      return;
    }

    this._annotationsGroup.add(...annotations.map(a => a.getObject()));
  }

  constructor(
    worldTransform: THREE.Matrix4,
    sceneHandler: SceneHandler,
    device: DeviceDescriptor,
    private readonly _requestRedraw: () => void = () => {},
    faceTextureLoader?: FaceTextureLoader
  ) {
    this._localTransform = worldTransform.clone();
    this._worldTransform = worldTransform.clone();
    this._sceneHandler = sceneHandler;
    this._textureLoader = new THREE.TextureLoader();
    this._visualizationState = {
      opacity: DEFAULT_IMAGE_360_OPACITY,
      renderOrder: 3,
      scale: new THREE.Vector3(1, 1, 1),
      visible: true
    };
    this._loader =
      faceTextureLoader ??
      new Image360FaceTextureLoader(
        device,
        this._textureLoader,
        this._requestRedraw,
        (face, texture) => this.updateFaceTexture(face, texture),
        () => this._visualizationMesh !== undefined
      );
  }

  public setWorldTransform(matrix: THREE.Matrix4): void {
    this._worldTransform.copy(matrix).multiply(this._localTransform);

    if (this._visualizationMesh) {
      this._visualizationMesh.position.setFromMatrixPosition(this._worldTransform);
      this._visualizationMesh.rotation.setFromRotationMatrix(this._worldTransform);
    }
  }

  public setImages(textures: Image360Texture[]): void {
    if (this._visualizationMesh) {
      this._faceMaterialOrder.forEach((face, index) => {
        this._faceMaterials[index].color.set(0xffffff);
        this._faceMaterials[index].map = getFaceTexture(face);
        this._faceMaterials[index].needsUpdate = true;
      });
      this._requestRedraw();
      return;
    }

    this.buildVisualizationMesh(
      this._faceMaterialOrder.map(
        face =>
          new THREE.MeshBasicMaterial({
            side: THREE.BackSide,
            map: getFaceTexture(face),
            depthTest: false,
            depthWrite: false,
            opacity: this._visualizationState.opacity,
            transparent: true
          })
      )
    );

    function getFaceTexture(face: Image360Face['face']) {
      const texture = textures.find(p => p.face === face);
      assert(texture !== undefined);
      return texture.texture;
    }
  }

  private buildVisualizationMesh(faceMaterials: THREE.MeshBasicMaterial[]): void {
    this._faceMaterials = faceMaterials;

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
  }

  public getTransform(): THREE.Matrix4 {
    return this._worldTransform;
  }

  public loadFaceTextures(
    faces: Image360Face[],
    onFirstFaceReady?: () => void,
    onFirstFaceTypeDetected?: (type: JpegType) => void,
    abortSignal?: AbortSignal
  ): Promise<Image360Texture[]> {
    if (faces.some(hasDownloadUrl)) {
      this.createPlaceholderMesh();
    }
    // Fire onFirstFaceReady only when ALL faces have their first scan ready
    let facesWithFirstScan = 0;
    const notifyFirstFace = (): void => {
      facesWithFirstScan++;
      if (facesWithFirstScan === faces.length) {
        onFirstFaceReady?.();
      }
    };
    let typeNotified = false;
    const notifyType = (type: JpegType): void => {
      if (!typeNotified) {
        typeNotified = true;
        onFirstFaceTypeDetected?.(type);
      }
    };
    return Promise.all(faces.map(face => this._loader.load(face, notifyFirstFace, notifyType, abortSignal)));
  }

  private createPlaceholderMesh(): void {
    if (this._visualizationMesh !== undefined) return;

    this.buildVisualizationMesh(
      this._faceMaterialOrder.map(
        () =>
          new THREE.MeshBasicMaterial({
            side: THREE.BackSide,
            color: 0x000000,
            depthTest: false,
            depthWrite: false,
            opacity: this._visualizationState.opacity,
            transparent: true
          })
      )
    );
  }

  public updateFaceTexture(face: Image360Face['face'], texture: THREE.Texture): void {
    if (this._visualizationMesh === undefined) return;
    const index = this._faceMaterialOrder.indexOf(face);
    if (index === -1) return;
    const material = this._faceMaterials[index];
    material.color.set(0xffffff);
    material.map = texture;
    material.needsUpdate = true;
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

  public setAnnotationsVisibility(visibility: boolean): void {
    this._annotationsGroup.visible = visibility;
  }
}
