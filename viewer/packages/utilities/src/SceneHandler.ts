/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import remove from 'lodash/remove';

export class SceneHandler {
  private readonly _scene: THREE.Scene;
  private readonly _cadModels: { cadNode: THREE.Object3D; modelIdentifier: string }[];
  private readonly _pointCloudModels: { pointCloudNode: THREE.Object3D; modelIdentifier: symbol }[];
  private readonly _customObjects: THREE.Object3D[];

  get scene(): THREE.Scene {
    return this._scene;
  }

  get cadModels(): { cadNode: THREE.Object3D; modelIdentifier: string }[] {
    return this._cadModels;
  }

  get pointCloudModels(): { pointCloudNode: THREE.Object3D; modelIdentifier: symbol }[] {
    return this._pointCloudModels;
  }

  get customObjects(): THREE.Object3D[] {
    return this._customObjects;
  }

  constructor() {
    this._cadModels = [];
    this._pointCloudModels = [];
    this._customObjects = [];
    this._scene = new THREE.Scene();

    this._scene.matrixWorldAutoUpdate = false;
  }

  public addCadModel(cadNode: THREE.Object3D, modelIdentifier: string): void {
    this._cadModels.push({ cadNode, modelIdentifier });
    this._scene.add(cadNode);
  }

  public addPointCloudModel(pointCloudNode: THREE.Object3D, modelIdentifier: symbol): void {
    this._pointCloudModels.push({ pointCloudNode, modelIdentifier });
    this._scene.add(pointCloudNode);
  }

  public removePointCloudModel(pointCloudNode: THREE.Object3D): void {
    this.scene.remove(pointCloudNode);
    remove(this._pointCloudModels, { pointCloudNode });
  }

  public removeCadModel(cadNode: THREE.Object3D): void {
    this.scene.remove(cadNode);
    remove(this._cadModels, { cadNode });
  }

  public addCustomObject(object: THREE.Object3D): void {
    this._customObjects.push(object);
    this._scene.add(object);
  }

  public removeCustomObject(object: THREE.Object3D): void {
    this.scene.remove(object);
    remove(this._customObjects, object);
  }

  public dispose(): void {
    this._cadModels.splice(0);
    this._pointCloudModels.splice(0);
    this._customObjects.splice(0);

    this.scene.traverse(object => {
      const hasGeometry =
        object instanceof THREE.Mesh || object instanceof THREE.Points || object instanceof THREE.Line;

      if (!hasGeometry) {
        return;
      }

      object.geometry?.dispose();

      if (Array.isArray(object.material)) {
        object.material.forEach(material => material.dispose());
      } else {
        object.material?.dispose();
      }
    });

    this.scene.clear();
  }
}
