/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { SceneHandler } from '@reveal/utilities';
import assert from 'assert';
import { Image360Face } from '@reveal/data-providers';
import { Image360Visualization } from './Image360Visualization';

type VisualizationState = {
  opacity: number;
  visible: boolean;
  scale: THREE.Vector3;
  renderOrder: number;
};

export class Image360VisualizationBox implements Image360Visualization {
  private readonly _worldTransform: THREE.Matrix4;
  private _visualizationMesh: THREE.Mesh | undefined;
  private _faceMaterials: THREE.MeshBasicMaterial[] = [];
  private readonly _sceneHandler: SceneHandler;
  private readonly _visualizationState: VisualizationState;
  private readonly _textureLoader: THREE.TextureLoader;

  get opacity(): number {
    return this._visualizationState.opacity;
  }

  set opacity(alpha: number) {
    this._visualizationState.opacity = alpha;

    this._faceMaterials.forEach(material => {
      material.opacity = alpha;
    });
  }

  get visible(): boolean {
    return this._visualizationState.visible;
  }

  set visible(isVisible: boolean) {
    this._visualizationState.visible = isVisible;

    if (this._visualizationMesh === undefined) {
      return;
    }
    this._visualizationMesh.visible = isVisible;
  }

  set scale(newScale: THREE.Vector3) {
    this._visualizationState.scale = newScale;

    if (this._visualizationMesh === undefined) {
      return;
    }

    this._visualizationMesh.scale.copy(newScale);
  }

  set renderOrder(newRenderOrder: number) {
    this._visualizationState.renderOrder = newRenderOrder;

    if (this._visualizationMesh === undefined) {
      return;
    }

    this._visualizationMesh.renderOrder = newRenderOrder;
  }

  constructor(worldTransform: THREE.Matrix4, sceneHandler: SceneHandler) {
    this._worldTransform = worldTransform;
    this._sceneHandler = sceneHandler;
    this._textureLoader = new THREE.TextureLoader();
    this._visualizationState = {
      opacity: 1,
      renderOrder: 3,
      scale: new THREE.Vector3(1, 1, 1),
      visible: true
    };
  }

  public async loadImages(faces: Image360Face[]): Promise<void> {
    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);

    await this.setFaceMaterials(faces);

    this._visualizationMesh = new THREE.Mesh(boxGeometry, this._faceMaterials);
    this._visualizationMesh.renderOrder = this._visualizationState.renderOrder;
    this._visualizationMesh.applyMatrix4(this._worldTransform);
    this._visualizationMesh.scale.copy(this._visualizationState.scale);
    this._visualizationMesh.visible = this._visualizationState.visible;
    this._sceneHandler.addCustomObject(this._visualizationMesh);

    return Promise.resolve();
  }

  public async setFaceMaterials(faces: Image360Face[]): Promise<void> {
    const faceMaterialOrder: Image360Face['face'][] = ['left', 'right', 'top', 'bottom', 'front', 'back'];
    const faceTextures = await this.loadFaceTextures(faces);

    if (this._faceMaterials.length === 0) {
      this._faceMaterials = faceMaterialOrder.map(
        face =>
          new THREE.MeshBasicMaterial({
            side: THREE.BackSide,
            map: getFaceTexture(face),
            depthTest: false,
            opacity: this._visualizationState.opacity,
            transparent: true
          })
      );
    } else {
      faceMaterialOrder.map((face, index) => {
        this._faceMaterials[index].map = getFaceTexture(face);
      });
    }

    function getFaceTexture(side: Image360Face['face']) {
      const face = faceTextures.find(p => p.side === side);
      assert(face !== undefined);
      return face.faceTexture;
    }
  }

  private loadFaceTextures(faces: Image360Face[]) {
    return Promise.all(
      faces.map(async image360Face => {
        const blob = new Blob([image360Face.data], { type: image360Face.mimeType });
        const url = window.URL.createObjectURL(blob);
        const faceTexture = await this._textureLoader.loadAsync(url);
        // Need to horizontally flip the texture since it is being rendered inside a cube
        faceTexture.center.set(0.5, 0.5);
        faceTexture.repeat.set(-1, 1);
        return { side: image360Face.face, faceTexture };
      })
    );
  }

  public unloadImages(): void {
    if (this._visualizationMesh === undefined) {
      return;
    }
    this._sceneHandler.removeCustomObject(this._visualizationMesh);
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
}
