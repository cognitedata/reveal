/*!
 * Copyright 2021 Cognite AS
 */

import { Mesh, MeshBasicMaterial, SphereGeometry, Scene, Object3D, Vector3 } from 'three';
import { ControlsType } from './ControlsType';
import { FlexibleCameraManager } from './FlexibleCameraManager';

export class FlexibleCameraObjects {
  private readonly _scene?: undefined | Scene;
  private _targetObject: Object3D | undefined;
  private _lookAtObject: Object3D | undefined;

  //================================================
  // CONSTRUCTOR
  //================================================

  constructor(scene?: Scene) {
    this._scene = scene;
  }

  //================================================
  // INSTANCE METHODS: Update helper Objects
  //================================================

  public updateVisibleObjects(manager: FlexibleCameraManager): void {
    if (this._scene === undefined) {
      return;
    }
    const show = manager.controls.controlsType !== ControlsType.FirstPerson;
    if (show && manager.options.showTarget) {
      if (!this._targetObject) {
        this._targetObject = this.createTargetObject();
        this._scene?.add(this._targetObject);
      }
      this.setPosition(this._targetObject, manager.controls.getTarget(), manager);
    } else {
      if (this._targetObject) {
        this._scene?.remove(this._targetObject);
        this._targetObject = undefined;
      }
    }
    if (manager.options.showLookAt) {
      if (!this._lookAtObject) {
        this._lookAtObject = this.createLookAtObject();
        this._scene?.add(this._lookAtObject);
      }
      this.setPosition(this._lookAtObject, manager.controls.getLookAt(), manager);
    } else {
      if (this._lookAtObject) {
        this._scene?.remove(this._lookAtObject);
        this._lookAtObject = undefined;
      }
    }
  }

  private setPosition(obj: Object3D, position: Vector3, manager: FlexibleCameraManager): void {
    const diagonal = manager.getBoundingBoxDiagonal();
    const scale = Math.max(Math.min(diagonal / 200, 0.2), 0.1);

    obj.position.copy(position);
    obj.lookAt(manager.camera.position);
    obj.scale.setScalar(scale);
  }

  private createTargetObject(): Mesh {
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

  private createLookAtObject(): Mesh {
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
