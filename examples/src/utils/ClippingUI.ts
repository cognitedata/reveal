import * as THREE from 'three';
import dat from 'dat.gui';

export class ClippingUI {
  private readonly _xUi: dat.GUIController;
  private readonly _yUi: dat.GUIController;
  private readonly _zUi: dat.GUIController;
  private readonly _updateSlicingPlanesCallback: (planes: THREE.Plane[]) => void;

  private readonly _params = {
    enabledX: false,
    enabledY: false,
    enabledZ: false,
    flipX: false,
    flipY: false,
    flipZ: false,
    x: 0,
    y: 0,
    z: 0,
    showHelpers: false,
  };

  constructor(uiFolder: dat.GUI, updateSlicingPlanesCallback: (planes: THREE.Plane[]) => void) {
    const { xUi, yUi, zUi } = this.createGui(uiFolder);
    this._xUi = xUi;
    this._yUi = yUi;
    this._zUi = zUi;
    this._updateSlicingPlanesCallback = updateSlicingPlanesCallback;
  }

  updateWorldBounds(bounds: THREE.Box3) {
    this._xUi.min(bounds.min.x);
    this._xUi.max(bounds.max.x);
    this._yUi.min(bounds.min.y);
    this._yUi.max(bounds.max.y);
    this._zUi.min(bounds.min.z);
    this._zUi.max(bounds.max.z);

    const size = bounds.getSize(new THREE.Vector3());
    this._xUi.step(size.x / 100.0);
    this._yUi.step(size.y / 100.0);
    this._zUi.step(size.z / 100.0);
  }

  private orderOfMagnitude(v: number): number {
    const epsilon = 0.00001;
    const order = Math.floor(Math.log(v) / Math.LN10 + epsilon);
    return Math.pow(10, order);
  }

  private createGui(ui: dat.GUI) {
    const updateSlicingPlanes = this.updateSlicingPlanes.bind(this);
    // X
    ui
      .add(this._params, 'enabledX')
      .name('X')
      .onChange(updateSlicingPlanes);
    ui
      .add(this._params, 'flipX')
      .name('Flip X')
      .onChange(updateSlicingPlanes);
    const xUi = ui
      .add(this._params, 'x', -600, 600)
      .step(0.1)
      .name('X')
      .onChange(updateSlicingPlanes);

    // Y
    ui
      .add(this._params, 'enabledY')
      .name('Y')
      .onChange(updateSlicingPlanes);
    ui
      .add(this._params, 'flipY')
      .name('Flip Y')
      .onChange(updateSlicingPlanes);
    const yUi = ui
      .add(this._params, 'y', -600, 600)
      .step(0.1)
      .name('y')
      .onChange(updateSlicingPlanes);

    // Z
    ui
      .add(this._params, 'enabledZ')
      .name('Z')
      .onChange(updateSlicingPlanes);
    ui
      .add(this._params, 'flipZ')
      .name('Flip Z')
      .onChange(updateSlicingPlanes);
    const zUi = ui
      .add(this._params, 'z', -600, 600)
      .step(0.1)
      .name('z')
      .onChange(updateSlicingPlanes);

    return { xUi, yUi, zUi };
  }

  updateSlicingPlanes() {
    const dirX = new THREE.Vector3(1, 0, 0);
    const dirY = new THREE.Vector3(0, -1, 0);
    const dirZ = new THREE.Vector3(0, 0, 1);
    const planes: THREE.Plane[] = [];
    const point = new THREE.Vector3(this._params.x, this._params.y, this._params.z);
    if (this._params.enabledX) {
      const normal = dirX.clone().multiplyScalar(this._params.flipX ? -1 : 1);
      planes.push(new THREE.Plane().setFromNormalAndCoplanarPoint(normal, point));
    }
    if (this._params.enabledY) {
      const normal = dirY.clone().multiplyScalar(this._params.flipY ? -1 : 1);
      planes.push(new THREE.Plane().setFromNormalAndCoplanarPoint(normal, point));
    }
    if (this._params.enabledZ) {
      const normal = dirZ.clone().multiplyScalar(this._params.flipZ ? -1 : 1);
      planes.push(new THREE.Plane().setFromNormalAndCoplanarPoint(normal, point));
    }
    this._updateSlicingPlanesCallback(planes);
  }
}
