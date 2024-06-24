/*!
 * Copyright 2024 Cognite AS
 */
import throttle from 'lodash/throttle';
import { Camera, Matrix4 } from 'three';

export type Callback = () => void;

export class CameraChangeThrottler {
  private readonly _prevCameraMatrix: Matrix4 = new Matrix4();

  public call: (camera: Camera, callback: Callback) => void;

  constructor(wait: number = 500) {
    this.call = throttle((camera: Camera, callback: Callback) => this._call(camera, callback), wait);
  }

  private _call(camera: Camera, callback: Callback) {
    if (camera.matrix.equals(this._prevCameraMatrix)) {
      return;
    }

    callback();

    this._prevCameraMatrix.copy(camera.matrix);
  }
}
