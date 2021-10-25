/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

export default class CameraManager extends THREE.EventDispatcher {
    private _camera: THREE.PerspectiveCamera;

    constructor(camera: THREE.PerspectiveCamera,
        domElement: HTMLElement, raycastFunction: (x: number, y: number) => void) {

        super();
        this._camera = camera;

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
        direction.applyQuaternion(this.camera.quaternion);

        const position = new THREE.Vector3();
        position.copy(direction).multiplyScalar(-distance).add(target);

        this.moveCameraTo(position, target, duration);
    }

    /** @private */
    private moveCameraTo(position: THREE.Vector3, target: THREE.Vector3, duration?: number) {
        if (this.isDisposed) {
            return;
        }

        const { camera, raycaster, _minDefaultAnimationDuration, _maxDefaultAnimationDuration } = this;

        if (duration == null) {
            const distance = position.distanceTo(camera.position);
            duration = distance * 125; // 125ms per unit distance
            duration = Math.min(Math.max(duration, _minDefaultAnimationDuration), _maxDefaultAnimationDuration);
        }

        raycaster.setFromCamera(new THREE.Vector2(), camera);
        const distanceToTarget = target.distanceTo(camera.position);
        const scaledDirection = raycaster.ray.direction.clone().multiplyScalar(distanceToTarget);
        const startTarget = raycaster.ray.origin.clone().add(scaledDirection);
        const from = {
            x: camera.position.x,
            y: camera.position.y,
            z: camera.position.z,
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
            if (this.isDisposed) {
                document.removeEventListener('keydown', stopTween);
                animation.stop();
                return;
            }

            if (event.type !== 'keydown' || this.controls.enableKeyboardNavigation) {
                animation.stop();
                this.canvas.removeEventListener('pointerdown', stopTween);
                this.canvas.removeEventListener('wheel', stopTween);
                document.removeEventListener('keydown', stopTween);
            }
        };

        if (this._canInterruptAnimations) {
            this.canvas.addEventListener('pointerdown', stopTween);
            this.canvas.addEventListener('wheel', stopTween);
            document.addEventListener('keydown', stopTween);
        }
        const tempTarget = new THREE.Vector3();
        const tmpPosition = new THREE.Vector3();
        const tween = animation
            .to(to, duration)
            .easing((x: number) => TWEEN.Easing.Circular.Out(x))
            .onUpdate(() => {
                if (this.isDisposed) {
                    return;
                }
                tmpPosition.set(from.x, from.y, from.z);
                tempTarget.set(from.targetX, from.targetY, from.targetZ);
                if (!this.camera) {
                    return;
                }

                this.setCameraPosition(tmpPosition);
                this.setCameraTarget(tempTarget);
            })
            .onComplete(() => {
                if (this.isDisposed) {
                    return;
                }
                this.canvas.removeEventListener('pointerdown', stopTween);
            })
            .start(TWEEN.now());
        tween.update(TWEEN.now());
    }

}
