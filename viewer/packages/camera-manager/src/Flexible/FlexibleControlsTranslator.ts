/*!
 * Copyright 2024 Cognite AS
 */

import { Line3, OrthographicCamera, PerspectiveCamera, Plane, Raycaster, Vector3 } from 'three';
import { FlexibleControls } from './FlexibleControls';

/**
 * @beta
 */
export class FlexibleControlsTranslator {
  //================================================
  // INSTANCE FIELDS
  //================================================

  private readonly _controls: FlexibleControls;
  private readonly _prevPickedPoint: Vector3 = new Vector3();
  private readonly _plane: Plane = new Plane();
  private _camera: PerspectiveCamera | OrthographicCamera | undefined;
  private _distance: number = 0;

  //================================================
  // CONTRUCTORS
  //================================================

  constructor(controls: FlexibleControls) {
    this._controls = controls;
  }

  //================================================
  // INSTANCE METHODS
  //================================================

  public async initialize(event: PointerEvent): Promise<boolean> {
    if (!this._controls.getPickedPointByPixelCoordinates) {
      return false;
    }
    const pickedPoint = await this._controls.getPickedPointByPixelCoordinates(event.clientX, event.clientY);
    if (!pickedPoint) {
      return false;
    }
    this._plane.setFromNormalAndCoplanarPoint(this._controls.cameraVector.getEndVector(), pickedPoint);
    this._camera = this._controls.camera.clone();
    this._distance = pickedPoint.distanceTo(this._controls.cameraPosition.end);
    this._prevPickedPoint?.copy(pickedPoint);
    return true;
  }

  public translate(event: PointerEvent): boolean {
    if (!this._camera) {
      return false;
    }
    const pixelCoordinates = this._controls.getNormalizedPixelCoordinates(event);
    const raycaster = new Raycaster();
    raycaster.setFromCamera(pixelCoordinates, this._camera);

    const line = convertRayToLine3(raycaster, this._distance * 2);
    const pickedPoint = this._plane.intersectLine(line, new Vector3());
    if (!pickedPoint) {
      return false;
    }
    const translation = new Vector3().subVectors(this._prevPickedPoint, pickedPoint);
    this._prevPickedPoint.copy(pickedPoint);
    this._controls.translate(translation);
    return true;
  }
}

//================================================
// LOCAL FUNCTIONS
//================================================

function convertRayToLine3(raycaster: Raycaster, distance: number): Line3 {
  const startPoint = raycaster.ray.origin;
  const endPoint = raycaster.ray.direction.clone().multiplyScalar(distance).add(raycaster.ray.origin);
  return new Line3(startPoint, endPoint);
}
