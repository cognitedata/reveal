/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

// For BoundingBoxLOD.update()
const updateVars = {
  camPos: new THREE.Vector3(),
  bounds: new THREE.Box3()
};

/**
 * Class similar to THREE.LOD except that it doesn't use `matrixWorld` to determine distance to camera, but a
 * bounding box.
 */
export class BoundingBoxLOD extends THREE.Object3D {
  private readonly _boundingBox: THREE.Box3;
  private _activeLevel = 0;
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
    this._levels.sort((a, b) => b.distance - a.distance);
    object.visible = false;
    this.add(object);
  }

  /**
   * Returns the index of the current active LOD. 0 means highest detail.
   */
  getCurrentLevel() {
    return this._levels.length > 0 ? this._levels.length - this._activeLevel - 1 : 0;
  }

  /**
   * Update selected LOD level based on distance to camera.
   */
  update(camera: THREE.Camera) {
    this.updateCurrentLevel(camera);
  }

  private updateCurrentLevel(camera: THREE.Camera) {
    const levels = this._levels;
    const { camPos, bounds } = updateVars;
    bounds.copy(this._boundingBox).applyMatrix4(this.matrixWorld);
    const cameraZoom = camera instanceof THREE.PerspectiveCamera ? camera.zoom : 1.0;

    if (levels.length > 0) {
      camPos.setFromMatrixPosition(camera.matrixWorld);
      const distanceToCamera = bounds.distanceToPoint(camPos) / cameraZoom;

      levels[this._activeLevel].object.visible = false;
      this._activeLevel = levels.findIndex(p => distanceToCamera >= p.distance);
      this._activeLevel = this._activeLevel >= 0 ? this._activeLevel : levels.length - 1;
      levels[this._activeLevel].object.visible = true;
    }
  }
}
