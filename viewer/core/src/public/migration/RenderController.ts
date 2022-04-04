/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

/* eslint-disable jsdoc/require-jsdoc */
/**
 * @internal
 * @module @cognite/reveal
 */
export default class RenderController {
  private _needsRedraw: boolean;
  private readonly _camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  private readonly _lastCameraPosition: THREE.Vector3;
  private readonly _lastCameraRotation: THREE.Euler;
  private _lastCameraZoom: number;

  constructor(camera: THREE.PerspectiveCamera | THREE.OrthographicCamera) {
    this._camera = camera;
    this._needsRedraw = true;

    this._lastCameraPosition = new THREE.Vector3();
    this._lastCameraRotation = new THREE.Euler();
    this._lastCameraZoom = 0;

    window.addEventListener('focus', this.redraw.bind(this));
  }

  public get needsRedraw(): boolean {
    return this._needsRedraw;
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
      this._needsRedraw = true;
    }
  }

  dispose(): void {
    window.removeEventListener('focus', this.redraw.bind(this));
  }

  clearNeedsRedraw(): void {
    this._needsRedraw = false;
  }

  redraw(): void {
    this._needsRedraw = true;
  }
}
