/*!
 * Copyright 2021 Cognite AS
 */

import { Mesh, MeshBasicMaterial, SphereGeometry, Scene, Object3D, Vector3 } from 'three';
import { ControlsType } from './ControlsType';
import { FlexibleCameraManager } from './FlexibleCameraManager';

export class FlexibleCameraMarkers {
  private readonly _scene?: undefined | Scene;
  private _targetMarker: Object3D | undefined;
  private _lookAtMarker: Object3D | undefined;

  //================================================
  // CONSTRUCTOR
  //================================================

  constructor(scene?: Scene) {
    this._scene = scene;
  }

  //================================================
  // INSTANCE METHODS: Update helper Objects
  //================================================

  public update(manager: FlexibleCameraManager): void {
    if (this._scene === undefined) {
      return;
    }
    const show = manager.controls.controlsType !== ControlsType.FirstPerson;
    if (show && manager.options.showTarget) {
      if (!this._targetMarker) {
        this._targetMarker = this.createTargetMarker();
        this._scene?.add(this._targetMarker);
      }
      this.setPosition(this._targetMarker, manager.controls.getTarget(), manager);
    } else {
      if (this._targetMarker) {
        this._scene?.remove(this._targetMarker);
        this._targetMarker = undefined;
      }
    }
    if (manager.options.showLookAt) {
      if (!this._lookAtMarker) {
        this._lookAtMarker = this.createLookAtMarker();
        this._scene?.add(this._lookAtMarker);
      }
      this.setPosition(this._lookAtMarker, manager.controls.getLookAt(), manager);
    } else {
      if (this._lookAtMarker) {
        this._scene?.remove(this._lookAtMarker);
        this._lookAtMarker = undefined;
      }
    }
  }

  private setPosition(object3D: Object3D, position: Vector3, manager: FlexibleCameraManager): void {
    const diagonal = manager.getBoundingBoxDiagonal();
    const scale = Math.max(Math.min(diagonal / 200, 0.2), 0.1);

    object3D.position.copy(position);
    object3D.lookAt(manager.camera.position);
    object3D.scale.setScalar(scale);
  }

  private createTargetMarker(): Mesh {
    return new Mesh(
      new SphereGeometry(1),
      new MeshBasicMaterial({
        color: '#FFFFFF', // --cogs-primary-inverted (dark)
        transparent: true,
        opacity: 0.8,
        depthTest: false
      })
    );
  }

  private createLookAtMarker(): Mesh {
    return new Mesh(
      new SphereGeometry(1),
      new MeshBasicMaterial({
        color: '#FF0000', // --cogs-primary-inverted (dark)
        transparent: true,
        opacity: 0.8,
        depthTest: false
      })
    );
  }
}
