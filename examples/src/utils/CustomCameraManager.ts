import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { CameraManager } from '@cognite/reveal';
import { CameraState, CameraChangedEvent } from '@cognite/reveal/packages/camera-manager';


export class CustomCameraManager implements CameraManager {
    private _domElement: HTMLElement;
    private _camera: THREE.PerspectiveCamera;
    private _controls: OrbitControls;
    private _lastCameraState: Required<CameraState>;
    private readonly _cameraChangedListener: Array<CameraChangedEvent> = [];

    constructor(domElement: HTMLElement, camera: THREE.PerspectiveCamera) {
        this._domElement = domElement;
        this._camera = camera;
        this._controls = new OrbitControls(this._camera, this._domElement);
        this._lastCameraState = this.getCameraState();
    }
    getCamera(): THREE.PerspectiveCamera {
        return this._camera;
    }
    setCameraState(state: CameraState): void {
        if (state.rotation && state.target) throw new Error("Can't set both rotation and target");
        const position = state.position ?? this._camera.position;
        const target = state.target ?? this._controls.target;
        const rotation = state.rotation ?? this._camera.quaternion;

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
    on(event: "cameraChange", callback: CameraChangedEvent): void {
        this._cameraChangedListener.push(callback);
    }
    off(event: "cameraChange", callback: CameraChangedEvent): void {
        const index  = this._cameraChangedListener.indexOf(callback);
        if (index !== -1) {
            this._cameraChangedListener.splice(index, 1);
        }

    }
    fitCameraToBoundingBox(boundingBox: THREE.Box3, duration?: number, radiusFactor?: number): void {
        this._controls.target.copy(boundingBox.getCenter(new THREE.Vector3()));
    }
    update(deltaTime: number, boundingBox: THREE.Box3): void {
        this._controls.update();

        const cameraState = this.getCameraState();
        if (cameraState.position.distanceTo(this._lastCameraState.position) > 0.001 || 
            cameraState.target.distanceTo(this._lastCameraState.target) > 0.001) {
                
            this._cameraChangedListener.forEach( cb => cb({ camera: { position: cameraState.position, target: cameraState.target } }));
        }
        this._lastCameraState = cameraState;
    }
    dispose(): void {
        throw new Error("Method not implemented.");
    }
    
}