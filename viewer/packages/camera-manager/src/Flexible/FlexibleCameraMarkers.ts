/*!
 * Copyright 2021 Cognite AS
 */

import { Mesh, MeshBasicMaterial, SphereGeometry, Scene, Object3D, Vector3 } from 'three';
import { ControlsType } from './ControlsType';
import { FlexibleCameraManager } from './FlexibleCameraManager';

export class FlexibleCameraMarkers {
  private readonly _scene?: undefined | Scene;
  private _pivotMarker: Object3D | undefined;
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
      if (!this._pivotMarker) {
        this._pivotMarker = this.createPivotMarker();
        this._scene?.add(this._pivotMarker);
      }
      this.setPosition(this._pivotMarker, manager.controls.getTarget(), manager);
    } else {
      if (this._pivotMarker) {
        this._scene?.remove(this._pivotMarker);
        this._pivotMarker = undefined;
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

  private createPivotMarker(): Mesh {
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
