/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { DisposedDelegate } from '@reveal/utilities';

import { Cognite3DViewerToolBase } from './Cognite3DViewerToolBase';
import { Cognite3DViewer } from '@reveal/api';
import { DataSourceType } from '@reveal/data-providers';

export class DebugCameraTool extends Cognite3DViewerToolBase {
  private readonly _viewer: Cognite3DViewer<DataSourceType>;
  private readonly _onViewerDisposedHandler: DisposedDelegate;
  private _cameraHelper?: THREE.CameraHelper;

  private get viewerCamera(): THREE.PerspectiveCamera {
    return this._viewer.cameraManager.getCamera();
  }

  constructor(viewer: Cognite3DViewer<DataSourceType>) {
    super();

    this._onViewerDisposedHandler = this.onViewerDisposed.bind(this);
    this._viewer = viewer;
    this._viewer.on('disposed', this._onViewerDisposedHandler);
  }

  /**
   * Removes all elements and detaches from the viewer.
   * @override
   */
  dispose(): void {
    this._viewer.off('disposed', this._onViewerDisposedHandler);
    super.dispose();
  }

  showCameraHelper(): void {
    this.hideCameraHelper();
    this._cameraHelper = new THREE.CameraHelper(this.viewerCamera.clone() as THREE.PerspectiveCamera);
    this._viewer.addObject3D(this._cameraHelper);
  }

  hideCameraHelper(): void {
    if (this._cameraHelper !== undefined) {
      this._viewer.removeObject3D(this._cameraHelper);
      this._cameraHelper = undefined;
    }
  }

  private onViewerDisposed(): void {
    this.dispose();
  }
}
