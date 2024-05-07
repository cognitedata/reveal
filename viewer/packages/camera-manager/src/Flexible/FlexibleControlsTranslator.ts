/*!
 * Copyright 2024 Cognite AS
 */

import { OrthographicCamera, PerspectiveCamera, Plane, Raycaster, Vector2, Vector3 } from 'three';
import { FlexibleControls } from './FlexibleControls';

/**
 * @beta
 * This class handles the translation of the camera.
 * It tries to translate the camera so the same (x,y, z) point is below the mouse
 */
export class FlexibleControlsTranslator {
  //================================================
  // INSTANCE FIELDS
  //================================================

  private readonly _controls: FlexibleControls;
  private readonly _prevPickedPoint = new Vector3();
  private readonly _plane = new Plane();
  private readonly _raycaster = new Raycaster();
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

  public async initialize(position: Vector2): Promise<boolean> {
    if (!this._controls.getPickedPointByPixelCoordinates) {
      return false;
    }
    const pickedPoint = await this._controls.getPickedPointByPixelCoordinates(position);
    if (!pickedPoint) {
      return false;
    }
    this._plane.setFromNormalAndCoplanarPoint(this._controls.cameraVector.getEndVector(), pickedPoint);
    this._camera = this._controls.camera.clone();
    this._prevPickedPoint?.copy(pickedPoint);
    return true;
  }

  public translate(position: Vector2): boolean {
    if (!this._camera) {
      return false;
    }
    const normalizedCoords = this._controls.getNormalizedPixelCoordinates(position);
    this._raycaster.setFromCamera(normalizedCoords, this._camera);

    const pickedPoint = this._raycaster.ray.intersectPlane(this._plane, new Vector3());
    if (!pickedPoint) {
      return false;
    }
    const translation = this._prevPickedPoint.sub(pickedPoint);
    this._controls.translate(translation);
    this._prevPickedPoint.copy(pickedPoint);
    return true;
  }
}
