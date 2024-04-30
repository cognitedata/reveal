import * as dat from 'dat.gui';

import { Cognite3DViewer, CogniteCadModel, CognitePointCloudModel } from '@cognite/reveal';
import { SingleClippingUI } from './SingleClippingUI';
import type { Box3 } from 'three';

export class ClippingUIs {
  private _rootUi: dat.GUI;
  private _globalUi: SingleClippingUI;
  private _modelCount = 0;

  constructor(uiFolder: dat.GUI, viewer: Cognite3DViewer) {
    this._rootUi = uiFolder;
    const globalFolder = uiFolder.addFolder('Global');
    this._globalUi = new SingleClippingUI(globalFolder, planes => viewer.setGlobalClippingPlanes(planes));
  }

  updateWorldBounds(bounds: Box3) {
    this._globalUi.updateBounds(bounds);
  }

  addModel(model: CogniteCadModel | CognitePointCloudModel) {
    this._modelCount++;
    const modelFolder = this._rootUi.addFolder(`Model #${this._modelCount}`);
    const clippingUi = new SingleClippingUI(modelFolder, planes => model.setModelClippingPlanes(planes));
    clippingUi.updateBounds(model.getModelBoundingBox());
  }
}
