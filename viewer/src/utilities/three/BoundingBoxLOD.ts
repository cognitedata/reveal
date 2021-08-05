/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

export class BoundingBoxLOD extends THREE.Object3D {
  private _currentLevel = 0;
  private readonly _boundingBox: THREE.Box3;
  private readonly _levels: { distance: number; object: THREE.Object3D }[] = [];

  // Note! isLOD and autoUpdate is used by WebGLRenderer to perform automatic update of LOD
  // level before rendering
  public readonly isLOD = true;
  public readonly autoUpdate = true;

  constructor(boundingBox: THREE.Box3) {
    super();
    this._boundingBox = boundingBox.clone();
    this.type = 'BoundingBoxLOD';
  }

  setBoundingBox(boundingBox: THREE.Box3) {
    this._boundingBox.copy(boundingBox);
  }

  addLevel(object: THREE.Object3D, distance: number = 0) {
    this._levels.push({ object, distance: Math.abs(distance) });
    this._levels.sort((a, b) => a.distance - b.distance);
    this.add(object);
  }

  getCurrentLevel() {
    return this._currentLevel;
  }

  private readonly _updateVars = {
    camPos: new THREE.Vector3(),
    bounds: new THREE.Box3()
  };
  update(camera: THREE.Camera) {
    const levels = this._levels;
    const { camPos, bounds } = this._updateVars;
    bounds.copy(this._boundingBox).applyMatrix4(this.matrixWorld);
    const cameraZoom = camera instanceof THREE.PerspectiveCamera ? camera.zoom : 1.0;

    if (levels.length > 0) {
      camPos.setFromMatrixPosition(camera.matrixWorld);
      const distanceToCamera = bounds.distanceToPoint(camPos) / cameraZoom;

      this._currentLevel = 0;
      levels[0].object.visible = true;

      for (let i = 1; i < levels.length; ++i) {
        if (distanceToCamera >= levels[i].distance) {
          levels[i - 1].object.visible = false;
          levels[i].object.visible = true;
          this._currentLevel = i;
        } else {
          break;
        }
      }

      for (let i = this._currentLevel + 1; i < levels.length; ++i) {
        levels[i].object.visible = false;
      }
    }
  }
}
