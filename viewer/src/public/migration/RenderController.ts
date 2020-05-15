/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';

export default class RenderController {
  needsRedraw: boolean;
  private _camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  private _lastCameraPosition: THREE.Vector3;
  private _lastCameraRotation: THREE.Euler;
  private _lastCameraZoom: number;

  constructor(camera: THREE.PerspectiveCamera | THREE.OrthographicCamera) {
    this._camera = camera;
    this.needsRedraw = true;

    this._lastCameraPosition = new THREE.Vector3();
    this._lastCameraRotation = new THREE.Euler();
    this._lastCameraZoom = 0;

    window.addEventListener('focus', () => {
      this.redraw(); // force rendering on focus
    });
  }

  update(): void {
    const { _camera, _lastCameraPosition, _lastCameraRotation, _lastCameraZoom } = this;
    const { position, rotation, zoom } = _camera;
    const hasCameraChanged =
      !position.equals(_lastCameraPosition) || !rotation.equals(_lastCameraRotation) || zoom !== _lastCameraZoom;
    _lastCameraPosition.copy(position);
    _lastCameraRotation.copy(rotation);
    this._lastCameraZoom = zoom;
    if (hasCameraChanged) {
      this.needsRedraw = true;
    }
  }

  clearNeedsRedraw(): void {
    this.needsRedraw = false;
  }

  redraw(): void {
    this.needsRedraw = true;
  }
}
