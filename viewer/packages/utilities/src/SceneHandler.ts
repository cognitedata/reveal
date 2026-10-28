/*!
 * Copyright 2022 Cognite AS
 */

import type { Object3D } from 'three';
import { Line, Mesh, Points, Scene } from 'three';
import { remove } from 'lodash-es';
import type { ICustomObject } from './customObject/ICustomObject';
import { CustomObject } from './customObject/CustomObject';

export class SceneHandler {
  private readonly _scene: Scene;
  private readonly _cadModels: { cadNode: Object3D; modelIdentifier: symbol }[];
  private readonly _pointCloudModels: { pointCloudNode: Object3D; modelIdentifier: symbol }[];
  private readonly _customObjects: ICustomObject[];

  get scene(): Scene {
    return this._scene;
  }

  get cadModels(): { cadNode: Object3D; modelIdentifier: symbol }[] {
    return this._cadModels;
  }

  get pointCloudModels(): { pointCloudNode: Object3D; modelIdentifier: symbol }[] {
    return this._pointCloudModels;
  }

  get customObjects(): ICustomObject[] {
    return this._customObjects;
  }

  constructor() {
    this._cadModels = [];
    this._pointCloudModels = [];
    this._customObjects = [];
    this._scene = new Scene();

    this._scene.matrixWorldAutoUpdate = false;
  }

  public addCadModel(cadNode: Object3D, modelIdentifier: symbol): void {
    this._cadModels.push({ cadNode, modelIdentifier });
    this._scene.add(cadNode);
  }

  public addPointCloudModel(pointCloudNode: Object3D, modelIdentifier: symbol): void {
    this._pointCloudModels.push({ pointCloudNode, modelIdentifier });
    this._scene.add(pointCloudNode);
  }

  public removePointCloudModel(pointCloudNode: Object3D): void {
    this.scene.remove(pointCloudNode);
    remove(this._pointCloudModels, { pointCloudNode });
  }

  public removeCadModel(cadNode: Object3D): void {
    this.scene.remove(cadNode);
    remove(this._cadModels, { cadNode });
  }

  public addObject3D(object: Object3D): void {
    this.addCustomObject(new CustomObject(object));
  }

  public addCustomObject(customObject: ICustomObject): void {
    this._customObjects.push(customObject);
    this._scene.add(customObject.object);
  }

  public removeObject3D(object: Object3D): void {
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
      const hasGeometry = object instanceof Mesh || object instanceof Points || object instanceof Line;

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
