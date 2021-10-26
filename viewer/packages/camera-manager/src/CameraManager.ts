/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import {ComboControls} from './ComboControls';

export class CameraManager extends THREE.EventDispatcher {
    public controls: ComboControls;
    
    private _camera: THREE.PerspectiveCamera;
    private _domElement: HTMLElement;
    
    private modelRaycast: (x: number, y: number) => Object;
    
    private isDisposed = false;
    private readonly _animationDuration: number = 600;
    private readonly _minDefaultAnimationDuration: number = 600;
    private readonly _maxDefaultAnimationDuration: number = 2500;
    private readonly _minDistanceDefault: number = 0.1;
    private readonly _useScrollTargetControls: boolean = false;
    private readonly _canInterruptAnimations: boolean = false;
    private readonly _raycaster: THREE.Raycaster = new THREE.Raycaster();

    constructor(camera: THREE.PerspectiveCamera,
        domElement: HTMLElement, raycastFunction: (x: number, y: number) => Object) {

        super();
        this._camera = camera;
        this._domElement = domElement;
        this.modelRaycast = raycastFunction;
        this.controls = new ComboControls(camera, domElement);
        this.controls.dollyFactor = 0.992;
        this.controls.minDistance = 0.15;
        this.controls.maxDistance = 100.0;
        this.controls.useScrollTarget = this._useScrollTargetControls;

    }

    fitCameraToBoundingBox(box: THREE.Box3, duration?: number, radiusFactor: number = 2): void {
        const center = new THREE.Vector3().lerpVectors(box.min, box.max, 0.5);
        const radius = 0.5 * box.max.distanceTo(box.min);
        const boundingSphere = new THREE.Sphere(center, radius);

        // TODO 2020-03-15 larsmoa: Doesn't currently work :S
        // const boundingSphere = box.getBoundingSphere(new THREE.Sphere());

        const target = boundingSphere.center;
        const distance = boundingSphere.radius * radiusFactor;
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(this._camera.quaternion);

        const position = new THREE.Vector3();
        position.copy(direction).multiplyScalar(-distance).add(target);

        this.moveCameraTo(position, target, duration);
    }

    setCameraTarget(target: THREE.Vector3, animated: boolean = false): void {
        if (this.isDisposed) {
          return;
        }
    
        const animationTime = animated ? this._animationDuration : 0;
        this.moveCameraTargetTo(target, animationTime);
      }

    /**
    * Calculates new target when raycaster doesn't have any intersections with the model.
    * @param cursorPosition Cursor position for desired calculations.
    * @param cursorPosition.x
    * @param cursorPosition.y
    */
    private calculateMissedRaycast = (cursorPosition: { x: number; y: number }, modelBB: THREE.Box3): THREE.Vector3 => {
        const modelSize = modelBB.min.distanceTo(modelBB.max);

        this._raycaster.setFromCamera(cursorPosition, this._camera);

        const farPoint = this._raycaster.ray.direction
            .clone()
            .normalize()
            .multiplyScalar(Math.max(this._camera.position.distanceTo(modelBB.getCenter(new THREE.Vector3())), modelSize))
            .add(this._camera.position);

        return farPoint;
    };

    /** @private */
    private moveCameraTo(position: THREE.Vector3, target: THREE.Vector3, duration?: number) {
        
        const { _camera, _raycaster, _minDefaultAnimationDuration, _maxDefaultAnimationDuration } = this;

        if (duration == null) {
            const distance = position.distanceTo(_camera.position);
            duration = distance * 125; // 125ms per unit distance
            duration = Math.min(Math.max(duration, _minDefaultAnimationDuration), _maxDefaultAnimationDuration);
        }

        _raycaster.setFromCamera(new THREE.Vector2(), _camera);
        const distanceToTarget = target.distanceTo(_camera.position);
        const scaledDirection = _raycaster.ray.direction.clone().multiplyScalar(distanceToTarget);
        const startTarget = _raycaster.ray.origin.clone().add(scaledDirection);
        const from = {
            x: _camera.position.x,
            y: _camera.position.y,
            z: _camera.position.z,
            targetX: startTarget.x,
            targetY: startTarget.y,
            targetZ: startTarget.z
        };
        const to = {
            x: position.x,
            y: position.y,
            z: position.z,
            targetX: target.x,
            targetY: target.y,
            targetZ: target.z
        };

        const animation = new TWEEN.Tween(from);
        const stopTween = (event: Event) => {
            // if (this.isDisposed) {
            //     document.removeEventListener('keydown', stopTween);
            //     animation.stop();
            //     return;
            // }

            if (event.type !== 'keydown' || this.controls.enableKeyboardNavigation) {
                animation.stop();
                this._domElement.removeEventListener('pointerdown', stopTween);
                this._domElement.removeEventListener('wheel', stopTween);
                document.removeEventListener('keydown', stopTween);
            }
        };

        if (this._canInterruptAnimations) {
            this._domElement.addEventListener('pointerdown', stopTween);
            this._domElement.addEventListener('wheel', stopTween);
            document.addEventListener('keydown', stopTween);
        }
        const tempTarget = new THREE.Vector3();
        const tempPosition = new THREE.Vector3();
        const tween = animation
            .to(to, duration)
            .easing((x: number) => TWEEN.Easing.Circular.Out(x))
            .onUpdate(() => {
                // if (this.isDisposed) {
                //     return;
                // }
                tempPosition.set(from.x, from.y, from.z);
                tempTarget.set(from.targetX, from.targetY, from.targetZ);
                if (!this._camera) {
                    return;
                }

                this.controls.setState(tempPosition, tempTarget);
            })
            .onComplete(() => {
                // if (this.isDisposed) {
                //     return;
                // }
                this._domElement.removeEventListener('pointerdown', stopTween);
            })
            .start(TWEEN.now());
        tween.update(TWEEN.now());
    }

    /** @private */
    private moveCameraTargetTo(target: THREE.Vector3, duration?: number) {
        // if (this.isDisposed) {
        //   return;
        // }

        if (duration === 0) {
            this.controls.setState(this._camera.position, target);
            return;
        }

        const { _camera, _raycaster, _minDefaultAnimationDuration, _maxDefaultAnimationDuration } = this;

        if (duration == null) {
            const distance = target.distanceTo(this.controls.getState().target);
            duration = distance * 125; // 125ms per unit distance
            duration = Math.min(Math.max(duration, _minDefaultAnimationDuration), _maxDefaultAnimationDuration);
        }

        _raycaster.setFromCamera(new THREE.Vector2(), _camera);
        const distanceToTarget = target.distanceTo(_camera.position);
        const scaledDirection = _raycaster.ray.direction.clone().multiplyScalar(distanceToTarget);
        const startTarget = _raycaster.ray.origin.clone().add(scaledDirection);
        const from = {
            targetX: startTarget.x,
            targetY: startTarget.y,
            targetZ: startTarget.z
        };
        const to = {
            targetX: target.x,
            targetY: target.y,
            targetZ: target.z
        };

        const animation = new TWEEN.Tween(from);
        const stopTween = (event: Event) => {
            //   if (this.isDisposed) {
            //     document.removeEventListener('keydown', stopTween);
            //     animation.stop();
            //     return;
            //   }
            this.controls.lookAtViewTarget = false;

            if (event.type !== 'keydown' || this.controls.enableKeyboardNavigation) {
                animation.stop();
                this._domElement.removeEventListener('pointerdown', stopTween);

                if (this._canInterruptAnimations) {
                    this._domElement.removeEventListener('wheel', stopTween);
                    document.removeEventListener('keydown', stopTween);
                }
            }
        };

        this._domElement.addEventListener('pointerdown', stopTween);

        if (this._canInterruptAnimations) {
            this._domElement.addEventListener('wheel', stopTween);
            document.addEventListener('keydown', stopTween);
        }

        this.controls.lookAtViewTarget = true;
        this.controls.setState(this._camera.position, target);

        const tempTarget = new THREE.Vector3();
        const tween = animation
            .to(to, duration)
            .easing((x: number) => TWEEN.Easing.Circular.Out(x))
            .onUpdate(() => {
                // if (this.isDisposed) {
                //   return;
                // }
                tempTarget.set(from.targetX, from.targetY, from.targetZ);
                if (!this._camera) {
                    return;
                }
                this.controls.setViewTarget(tempTarget);
            })
            .onComplete(() => {
                // if (this.isDisposed) {
                //   return;
                // }
                this.controls.lookAtViewTarget = false;
                this.controls.enableKeyboardNavigation = true;
                this.controls.setState(this._camera.position, tempTarget);

                this._domElement.removeEventListener('pointerdown', stopTween);
            })
            .start(TWEEN.now());
        tween.update(TWEEN.now());
    }

}
