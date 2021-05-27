/*!
 * Copyright 2021 Cognite AS
 */

import ComboControls from '@cognite/three-combo-controls';
import { Cognite3DViewer } from '../public/migration/Cognite3DViewer';

export type ViewerState = {
  cameraTarget: THREE.Vector3;
  cameraPosition: THREE.Vector3;
};

export class ViewStateHelper {
  private readonly _cameraControls: ComboControls;

  constructor(viewer: Cognite3DViewer) {
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
