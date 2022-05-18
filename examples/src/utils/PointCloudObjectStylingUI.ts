/*!
 * Copyright 2022 Cognite AS
 */

import { CognitePointCloudModel, PointCloudObjectCollection } from '@cognite/reveal';
import * as THREE from 'three';

export class PointCloudObjectStylingUI {

  static readonly MAX_OBJECTS = 10;

  private readonly _model: CognitePointCloudModel;

  constructor(uiFolder: dat.GUI, model: CognitePointCloudModel) {
    this._model = model;

    const objects = model.stylableObjects;

    objects.slice(0, PointCloudObjectStylingUI.MAX_OBJECTS).map(obj => this.createObjectUi(uiFolder.addFolder('Object #' + obj.objectId), obj.objectId));
  }

  createObjectUi(uiFolder: dat.GUI, objectId: number): void {
    const state = {
      color: '#ffffff',
    };

    uiFolder.addColor(state, 'color').name('Color').onFinishChange(color => {
      this._model.setObjectStyle(objectId, { color: hexStringToColor(color) });
    });
  }
};


function hexStringToColor(hexColor: string): [number, number, number] {
  const threeColor = new THREE.Color(hexColor);
  return [
    Math.floor(threeColor.r * 255),
    Math.floor(threeColor.g * 255),
    Math.floor(threeColor.b * 255)];
}
