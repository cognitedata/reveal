/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import { ComboControls } from './ComboControls';
import { CallbackData } from './types';

export class CameraManager extends THREE.EventDispatcher {
    public controls: ComboControls;
    
    private _camera: THREE.PerspectiveCamera;
    private _domElement: HTMLElement;
    
    private modelRaycast: (x: number, y: number) => Promise<CallbackData>;
    
    private isDisposed = false;
    public useOnClickTargetChange: boolean = false;
    public automaticNearFarPlane: boolean = true;
    private readonly _animationDuration: number = 600;
    private readonly _minDefaultAnimationDuration: number = 600;
    private readonly _maxDefaultAnimationDuration: number = 2500;
    private readonly _minDistanceDefault: number = 0.1;
    private readonly _useScrollTargetControls: boolean = true;
    private readonly _automaticControlsSensitivity: boolean = false;
    private readonly _canInterruptAnimations: boolean = false;
    private readonly _raycaster: THREE.Raycaster = new THREE.Raycaster();

    /**
    * Reusable buffers used by functions in Cognite3dViewer to avoid allocations.
    */
    private readonly _updateNearAndFarPlaneBuffers = {
        cameraPosition: new THREE.Vector3(),
        cameraDirection: new THREE.Vector3(),
        nearPlaneCoplanarPoint: new THREE.Vector3(),
        nearPlane: new THREE.Plane(),
        corners: new Array<THREE.Vector3>(
            new THREE.Vector3(),
            new THREE.Vector3(),
            new THREE.Vector3(),
            new THREE.Vector3(),
            new THREE.Vector3(),
            new THREE.Vector3(),
            new THREE.Vector3(),
            new THREE.Vector3()
        )
    };

    /**
   * Calculates new target when raycaster doesn't have any intersections with the model.
   * @param cursorPosition Cursor position for desired calculations.
   * @param cursorPosition.x
   * @param cursorPosition.y
   */
  private calculateMissedRaycast = (cursorPosition: { x: number; y: number }, modelsBB: THREE.Box3): THREE.Vector3 => {
    const modelSize = modelsBB.min.distanceTo(modelsBB.max);

    this._raycaster.setFromCamera(cursorPosition, this._camera);

    const farPoint = this._raycaster.ray.direction
      .clone()
      .normalize()
      .multiplyScalar(Math.max(this._camera.position.distanceTo(modelsBB.getCenter(new THREE.Vector3())), modelSize))
      .add(this._camera.position);

    return farPoint;
  };

  /**
   * Changes controls target based on current cursor position.
   * @param event MouseEvent that contains pointer location data.
   */
   private changeTarget = async (event: MouseEvent) => {
    const { offsetX, offsetY } = event;

    const x = (offsetX / this._domElement.clientWidth) * 2 - 1,
      y = (offsetY / this._domElement.clientHeight) * -2 + 1;

    const callbackData = await this.modelRaycast(offsetX, offsetY);

    const newTarget = callbackData?.intersection?.point ?? this.calculateMissedRaycast({ x, y }, callbackData.modelsBB);

    this.setCameraTarget(newTarget, true);
  };

  /**
   * Adds event listeners for change of target when user clicks the mouse.
   */
  private addOnClickTargetChange = () => {
    let startedScroll = false,
      newTargetUpdate = false;
    let timeAfterClick = 0;
    const wheelClock = new THREE.Clock(),
      clickClock = new THREE.Clock();

    const onClickTargetChange = (e: MouseEvent) => {

        if (this.isDisposed) {
            this._domElement.removeEventListener('click', onClickTargetChange);
            return;
        }

        newTargetUpdate = true;
        timeAfterClick = 0;
        clickClock.getDelta();
  
        this.controls.enableKeyboardNavigation = false;
        this.changeTarget(e);
    };

    const onWheelTargetChange = async (e: any) => {
        if (this.isDisposed) {
            this._domElement.removeEventListener('wheel', onWheelTargetChange);
            return;
        }

        const timeDelta = wheelClock.getDelta();
        timeAfterClick += clickClock.getDelta();
        const { offsetX, offsetY } = e;
        const x = (offsetX / this._domElement.clientWidth) * 2 - 1;
        const y = (offsetY / this._domElement.clientHeight) * -2 + 1;
  
        if (timeAfterClick > 3) newTargetUpdate = false;
  
        const wantNewScrollTarget =
          startedScroll && !newTargetUpdate && (e?.wheelDeltaY > 0 || e?.wheelDelta > 0 || e?.deltaY > 0);
  
        if (wantNewScrollTarget) {
          startedScroll = false;
  
          const callbackData = await this.modelRaycast(offsetX, offsetY);
  
          const newScrollTarget = callbackData?.intersection?.point ?? this.calculateMissedRaycast({ x, y }, callbackData.modelsBB);
  
          this.controls.setScrollTarget(newScrollTarget);
        } else {
          if (timeDelta > 0.1) startedScroll = true;
        }
    }

    this._domElement.addEventListener('click', onClickTargetChange);

    this._domElement.addEventListener('wheel', onWheelTargetChange);
  };

    constructor(camera: THREE.PerspectiveCamera,
        domElement: HTMLElement, raycastFunction: (x: number, y: number) => Promise<CallbackData>) {

        super();
        this._camera = camera;
        this._domElement = domElement;
        this.modelRaycast = raycastFunction;
        this.controls = new ComboControls(camera, domElement);
        this.controls.dollyFactor = 0.992;
        this.controls.minDistance = 0.15;
        this.controls.maxDistance = 100.0;
        this.controls.useScrollTarget = this._useScrollTargetControls;

        if (this.useOnClickTargetChange) this.addOnClickTargetChange();

        if (!camera) {
            this._camera = new THREE.PerspectiveCamera(60, undefined, 0.1, 10000);

            // TODO savokr 28-10-2021: Consider removing default camera position initialization 
            this._camera.position.x = 30;
            this._camera.position.y = 10;
            this._camera.position.z = 50;
            this._camera.lookAt(new THREE.Vector3());
        }

    }

    fitCameraToBoundingBox(box: THREE.Box3, duration?: number, radiusFactor: number = 2): void {
        const boundingSphere = box.getBoundingSphere(new THREE.Sphere());

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

    public moveCameraTo(position: THREE.Vector3, target: THREE.Vector3, duration?: number) {
        
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

    public moveCameraTargetTo(target: THREE.Vector3, duration?: number) {
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

    public updateCameraNearAndFar(camera: THREE.PerspectiveCamera, combinedBbox: THREE.Box3) {
        // See https://stackoverflow.com/questions/8101119/how-do-i-methodically-choose-the-near-clip-plane-distance-for-a-perspective-proj
        if (this.isDisposed) {
            return;
        }
        // if (!this._automaticControlsSensitivity && !this.automaticNearFarPlane) {
        //     return;
        // }

        const { cameraPosition, cameraDirection, corners, nearPlane, nearPlaneCoplanarPoint } =
            this._updateNearAndFarPlaneBuffers;
        getBoundingBoxCorners(combinedBbox, corners);
        camera.getWorldPosition(cameraPosition);
        camera.getWorldDirection(cameraDirection);

        // 1. Compute nearest to fit the whole bbox (the case
        // where the camera is inside the box is ignored for now)
        let near = combinedBbox.distanceToPoint(cameraPosition);
        near /= Math.sqrt(1 + Math.tan(((camera.fov / 180) * Math.PI) / 2) ** 2 * (camera.aspect ** 2 + 1));
        near = Math.max(0.1, near);

        // 2. Compute the far distance to the distance from camera to furthest
        // corner of the boundingbox that is "in front" of the near plane
        nearPlaneCoplanarPoint.copy(cameraPosition).addScaledVector(cameraDirection, near);
        nearPlane.setFromNormalAndCoplanarPoint(cameraDirection, nearPlaneCoplanarPoint);
        let far = -Infinity;
        for (let i = 0; i < 8; ++i) {
            if (nearPlane.distanceToPoint(corners[i]) >= 0) {
                const dist = corners[i].distanceTo(cameraPosition);
                far = Math.max(far, dist);
            }
        }
        far = Math.max(near * 2, far);

        // 3. Handle when camera is inside the model by adjusting the near value
        const diagonal = combinedBbox.min.distanceTo(combinedBbox.max);
        if (combinedBbox.containsPoint(cameraPosition)) {
            near = Math.min(0.1, far / 1000.0);
        }

        // Apply
        if (this.automaticNearFarPlane) {
            camera.near = near;
            camera.far = far;
            camera.updateProjectionMatrix();
        }
        if (this._automaticControlsSensitivity) {
            // The minDistance of the camera controller determines at which distance
            // we will stop when zooming with mouse wheel.
            // This is also used to determine the speed of the camera when flying with ASDW.
            // We want to either let it be controlled by the near plane if we are far away,
            // but no more than a fraction of the bounding box of the system if inside
            this.controls.minDistance = Math.min(Math.max(diagonal * 0.02, 0.1 * near), this._minDistanceDefault);
        }
    }

    dispose(): void {
        this.isDisposed = true;
        this.controls.dispose();

    }

}

function getBoundingBoxCorners(bbox: THREE.Box3, outBuffer?: THREE.Vector3[]): THREE.Vector3[] {
    outBuffer = outBuffer || [
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3()
    ];
    if (outBuffer.length !== 8) {
      throw new Error(`outBuffer must hold exactly 8 elements, but holds ${outBuffer.length} elemnents`);
    }
  
    const min = bbox.min;
    const max = bbox.max;
    outBuffer[0].set(min.x, min.y, min.z);
    outBuffer[1].set(max.x, min.y, min.z);
    outBuffer[2].set(min.x, max.y, min.z);
    outBuffer[3].set(min.x, min.y, max.z);
    outBuffer[4].set(max.x, max.y, min.z);
    outBuffer[5].set(max.x, max.y, max.z);
    outBuffer[6].set(max.x, min.y, max.z);
    outBuffer[7].set(min.x, max.y, max.z);
    return outBuffer;
  }