/*!
 * Copyright 2024 Cognite AS
 */

import { OrthographicCamera, PerspectiveCamera, Raycaster, Spherical, Vector3 } from 'three';
import { FlexibleControls } from './FlexibleControls';

/**
 * @beta
 * This class handles the rotation of the camera in first persion mode
 * It tries to rotate the camera so the same (x,y,z) point is below the mouse
 */
export class FlexibleControlsRotator {
  //================================================
  // INSTANCE FIELDS
  //================================================

  private readonly _controls: FlexibleControls;
  private readonly _prevDirection = new Vector3();
  private _camera: PerspectiveCamera | OrthographicCamera | undefined;

  //================================================
  // CONTRUCTORS
  //================================================

  constructor(controls: FlexibleControls) {
    this._controls = controls;
  }

  //================================================
  // INSTANCE METHODS
  //================================================

  public initialize(event: PointerEvent): void {
    this._camera = this._controls.camera.clone();
    const pixelCoordinates = this._controls.getNormalizedPixelCoordinates(event);
    const raycaster = new Raycaster();
    raycaster.setFromCamera(pixelCoordinates, this._camera);
    this._prevDirection.copy(raycaster.ray.direction);
  }

  public rotate(event: PointerEvent): boolean {
    if (!this._camera) {
      return false;
    }
    const pixelCoordinates = this._controls.getNormalizedPixelCoordinates(event);
    const raycaster = new Raycaster();
    raycaster.setFromCamera(pixelCoordinates, this._camera);

    const direction = raycaster.ray.direction.clone();
    const spherical = new Spherical().setFromVector3(direction);
    const prevSpherical = new Spherical().setFromVector3(this._prevDirection);

    // Calculate the differences in the spherical coordinates
    const deltaTheta = prevSpherical.theta - spherical.theta;
    const deltaPhi = prevSpherical.phi - spherical.phi;

    this._controls.rotateByAngles(-deltaTheta, deltaPhi);
    this._prevDirection.copy(direction);
    return true;
  }
}
