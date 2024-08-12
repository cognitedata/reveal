import { Plane, Vector3 } from 'three';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import pull from 'lodash/pull';

import {
  CameraManager,
  CameraManagerHelper,
  CameraState,
  CameraChangeDelegate,
  CameraManagerEventType,
  CameraEventDelegate,
  DebouncedCameraStopEventTrigger,
  CameraStopDelegate
} from '@cognite/reveal';

export class CustomCameraManager implements CameraManager {
  private _domElement: HTMLElement;
  private _camera: THREE.PerspectiveCamera;
  private _controls: OrbitControls;
  private readonly _cameraChangedListener: Array<CameraChangeDelegate> = [];
  private _stopEventHandler: DebouncedCameraStopEventTrigger;
  private readonly cameraManagerHelper = new CameraManagerHelper();

  constructor(domElement: HTMLElement, camera: THREE.PerspectiveCamera) {
    this._domElement = domElement;
    this._camera = camera;
    this._controls = new OrbitControls(this._camera, domElement);
    this._controls.enableDamping = true;
    this._controls.dampingFactor = 0.3;
    this._stopEventHandler = new DebouncedCameraStopEventTrigger(this);

    this._controls.addEventListener('change', () => {
      this._cameraChangedListener.forEach(cb => cb(this._camera.position, this._controls.target));
    });
  }

  get enabled(): boolean {
    return this._controls.enabled;
  }

  getCamera(): THREE.PerspectiveCamera {
    return this._camera;
  }

  setCameraState(state: CameraState): void {
    if (state.rotation && state.target) throw new Error("Can't set both rotation and target");
    const position = state.position ?? this._camera.position;
    const rotation = state.rotation ?? this._camera.quaternion;
    const target =
      state.target ??
      (state.rotation
        ? CameraManagerHelper.calculateNewTargetFromRotation(
            this._camera,
            state.rotation,
            this._controls.target,
            position
          )
        : this._controls.target);

    this._camera.position.copy(position);
    this._controls.target.copy(target);
    this._camera.quaternion.copy(rotation);
  }

  getCameraState(): Required<CameraState> {
    return {
      position: this._camera.position.clone(),
      target: this._controls.target.clone(),
      rotation: this._camera.quaternion.clone()
    };
  }

  activate(cameraManager?: CameraManager): void {
    this._controls.enabled = true;

    if (cameraManager) {
      this.setCameraState({ target: cameraManager.getCameraState().target });
    }
  }

  deactivate(): void {
    this._controls.enabled = false;
  }

  on(event: CameraManagerEventType, callback: CameraEventDelegate): void {
    switch (event) {
      case 'cameraChange':
        this._cameraChangedListener.push(callback);
        break;
      case 'cameraStop':
        this._stopEventHandler.subscribe(callback as CameraStopDelegate);
        break;
      default:
        throw Error(`Unrecognized camera event type: ${event}`);
    }
  }

  off(event: CameraManagerEventType, callback: CameraEventDelegate): void {
    switch (event) {
      case 'cameraChange':
        pull(this._cameraChangedListener, callback);
        break;
      case 'cameraStop':
        this._stopEventHandler.unsubscribe(callback as CameraStopDelegate);
        break;
      default:
        throw Error(`Unrecognized camera event type: ${event}`);
    }
  }

  fitCameraToBoundingBox(boundingBox: THREE.Box3, duration?: number, radiusFactor?: number): void {
    const { position, target } = CameraManagerHelper.calculateCameraStateToFitBoundingBox(
      this._camera,
      boundingBox,
      radiusFactor
    );

    this.setCameraState({ position, target });
  }

  update(deltaTime: number, boundingBox: THREE.Box3): void {
    this._controls.update();
    this.cameraManagerHelper.updateCameraNearAndFar(this._camera, boundingBox);
  }

  dispose(): void {
    this._stopEventHandler.dispose();
    this._controls.dispose();
    this._cameraChangedListener.splice(0);
  }
}
