/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import remove from 'lodash/remove';
import { ICustomObject } from './customObject/ICustomObject';
import { CustomObject } from './customObject/CustomObject';

export class SceneHandler {
  private readonly _scene: THREE.Scene;
  private readonly _cadModels: { cadNode: THREE.Object3D; modelIdentifier: symbol }[];
  private readonly _pointCloudModels: { pointCloudNode: THREE.Object3D; modelIdentifier: symbol }[];
  private readonly _customObjects: ICustomObject[];

  get scene(): THREE.Scene {
    return this._scene;
  }

  get cadModels(): { cadNode: THREE.Object3D; modelIdentifier: symbol }[] {
    return this._cadModels;
  }

  get pointCloudModels(): { pointCloudNode: THREE.Object3D; modelIdentifier: symbol }[] {
    return this._pointCloudModels;
  }

  get customObjects(): ICustomObject[] {
    return this._customObjects;
  }

  constructor() {
    this._cadModels = [];
    this._pointCloudModels = [];
    this._customObjects = [];
    this._scene = new THREE.Scene();

    this._scene.matrixWorldAutoUpdate = false;
  }

  public addCadModel(cadNode: THREE.Object3D, modelIdentifier: symbol): void {
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

  public addObject3D(object: THREE.Object3D): void {
    this.addCustomObject(new CustomObject(object));
  }

  public addCustomObject(customObject: ICustomObject): void {
    this._customObjects.push(customObject);
    this._scene.add(customObject.object);
  }

  public removeObject3D(object: THREE.Object3D): void {
    const customObject = this._customObjects.find(customObject => customObject.object === object);
    if (customObject) {
      this.removeCustomObject(customObject);
    }
  }

  public removeCustomObject(customObject: ICustomObject): void {
    this.scene.remove(customObject.object);
    remove(this._customObjects, customObject);
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
