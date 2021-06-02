/*!
 * Copyright 2021 Cognite AS
 */

import ComboControls from '../combo-camera-controls';
import { NodeAppearance } from '../datamodels/cad/NodeAppearance';
import { Cognite3DViewer } from '../public/migration/Cognite3DViewer';

export type ViewerState = {
  cameraTarget: THREE.Vector3;
  cameraPosition: THREE.Vector3;
};

export type ModelState = {
  defaultNodeAppearance: NodeAppearance;
};

export class ViewStateHelper {
  private readonly _cameraControls: ComboControls;
  //private readonly _viewer: Cognite3DViewer;

  constructor(viewer: Cognite3DViewer) {
    //this._viewer = viewer;
    this._cameraControls = viewer.cameraControls;
  }

  public getCurrentState(): ViewerState {
    const cameraState = this._cameraControls.getState();

    return {
      cameraPosition: cameraState.position,
      cameraTarget: cameraState.target
    };
  }

  public setState(viewerState: ViewerState): void {
    this._cameraControls.setState(viewerState.cameraPosition, viewerState.cameraTarget);
  }
}
