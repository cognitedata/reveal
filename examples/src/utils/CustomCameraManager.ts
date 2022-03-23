import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { CameraManager, CameraManagerHelper, CameraState, CameraChangeDelegate } from '@cognite/reveal';

export class CustomCameraManager implements CameraManager {
    private _domElement: HTMLElement;
    private _camera: THREE.PerspectiveCamera;
    private _controls: OrbitControls;
    private readonly _cameraChangedListener: Array<CameraChangeDelegate> = [];

    constructor(domElement: HTMLElement, camera: THREE.PerspectiveCamera) {
        this._domElement = domElement;
        this._camera = camera;
        this._controls = new OrbitControls(this._camera, domElement);
        this._controls.enableDamping = true;
        this._controls.dampingFactor = 0.3;

        this._controls.addEventListener('change', () => {
            this._cameraChangedListener.forEach( cb => cb(this._camera.position, this._controls.target));
        });
    }

    getCamera(): THREE.PerspectiveCamera {
        return this._camera;
    }

    setCameraState(state: CameraState): void {
        if (state.rotation && state.target) throw new Error("Can't set both rotation and target");
        const position = state.position ?? this._camera.position;
        const rotation = state.rotation ?? this._camera.quaternion;
        const target = state.target ?? ( state.rotation ? 
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

    on(event: "cameraChange", callback: CameraChangeDelegate): void {
        this._cameraChangedListener.push(callback);
    }

    off(event: "cameraChange", callback: CameraChangeDelegate): void {
        const index  = this._cameraChangedListener.indexOf(callback);
        if (index !== -1) {
            this._cameraChangedListener.splice(index, 1);
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