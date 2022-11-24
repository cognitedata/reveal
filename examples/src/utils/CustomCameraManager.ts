import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import {
    CameraManager,
    CameraManagerHelper,
    CameraState,
    CameraChangeDelegate,
    CameraManagerEventType,
    CameraEventDelegate,
    DebouncedCameraStopEventTrigger,
    CameraStoppedDelegate
} from '@cognite/reveal';

export class CustomCameraManager implements CameraManager {
    private _domElement: HTMLElement;
    private _camera: THREE.PerspectiveCamera;
    private _controls: OrbitControls;
    private readonly _cameraChangedListener: Array<CameraChangeDelegate> = [];
    private _stopEventHandler: DebouncedCameraStopEventTrigger;

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
        const target = state.target ?? (state.rotation ?
            CameraManagerHelper.calculateNewTargetFromRotation(
                this._camera, state.rotation, this._controls.target) :
            this._controls.target);

        this._camera.position.copy(position);
        this._controls.target.copy(target);
        this._camera.quaternion.copy(rotation);
    }

    getCameraState(): Required<CameraState> {
        return {
            position: this._camera.position.clone(),
            target: this._controls.target.clone(),
            rotation: this._camera.quaternion.clone(),
        }
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
        switch(event) {
            case 'cameraChange':
                this._cameraChangedListener.push(callback);
                break;
            case 'cameraStopped':
                this._stopEventHandler.subscribe(callback as CameraStoppedDelegate);
                break;
            default:
                throw Error(`Unrecognized camera event type: ${event}`);
        }
    }

    off(event: CameraManagerEventType, callback: CameraEventDelegate): void {
        switch(event) {
            case 'cameraChange':
                const index  = this._cameraChangedListener.indexOf(callback);
                if (index !== -1) {
                    this._cameraChangedListener.splice(index, 1);
                }
                break;
            case 'cameraStopped':
                this._stopEventHandler.unsubscribe(callback as CameraStoppedDelegate);
                break;
            default:
                throw Error(`Unrecognized camera event type: ${event}`);
        }
    }

    fitCameraToBoundingBox(boundingBox: THREE.Box3, duration?: number, radiusFactor?: number): void {
        const { position, target } = CameraManagerHelper.calculateCameraStateToFitBoundingBox(this._camera, boundingBox, radiusFactor);

        this.setCameraState({ position, target });
    }

    update(deltaTime: number, boundingBox: THREE.Box3): void {
        this._controls.update();
        CameraManagerHelper.updateCameraNearAndFar(this._camera, boundingBox);
    }

    dispose(): void {
        this._controls.dispose();
        this._cameraChangedListener.splice(0);
    }
}
