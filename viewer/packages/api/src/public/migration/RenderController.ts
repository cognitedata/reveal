/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { Cognite3DViewer } from '../../migration';

/* eslint-disable jsdoc/require-jsdoc */
/**
 * @internal
 * @module @cognite/reveal
 */
export default class RenderController {
  private _needsRedraw: boolean;
  private readonly _viewer: Cognite3DViewer;
  private readonly _lastCameraPosition: THREE.Vector3;
  private readonly _lastCameraRotation: THREE.Euler;
  private _lastCameraZoom: number;
  private _lastCameraFov: number;

  constructor(viewer: Cognite3DViewer) {
    this._viewer = viewer;
    this._needsRedraw = true;

    this._lastCameraPosition = new THREE.Vector3();
    this._lastCameraRotation = new THREE.Euler();
    this._lastCameraZoom = 0;
    this._lastCameraFov = 0;

    window.addEventListener('focus', this.redraw);
  }

  public get needsRedraw(): boolean {
    return this._needsRedraw;
  }

  update(): void {
    const { _viewer, _lastCameraPosition, _lastCameraRotation, _lastCameraZoom, _lastCameraFov } = this;
    const { position, rotation, zoom, fov } = _viewer.cameraManager.getCamera();
    const hasCameraChanged =
      !position.equals(_lastCameraPosition) ||
      !rotation.equals(_lastCameraRotation) ||
      zoom !== _lastCameraZoom ||
      fov !== _lastCameraFov;
    _lastCameraPosition.copy(position);
    _lastCameraRotation.copy(rotation);
    this._lastCameraZoom = zoom;
    this._lastCameraFov = fov;
    if (hasCameraChanged) {
      this._needsRedraw = true;
    }
  }

  dispose(): void {
    window.removeEventListener('focus', this.redraw);
  }

  clearNeedsRedraw(): void {
    this._needsRedraw = false;
  }

  redraw = (): void => {
    this._needsRedraw = true;
  };
}
