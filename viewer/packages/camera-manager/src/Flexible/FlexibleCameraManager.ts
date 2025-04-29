/*!
 * Copyright 2024 Cognite AS
 */

import { Box3, PerspectiveCamera, Raycaster, Vector3, Scene, Ray, Spherical, Vector2 } from 'three';

import { FlexibleControls } from './FlexibleControls';
import { FlexibleControlsOptions } from './FlexibleControlsOptions';

import TWEEN from '@tweenjs/tween.js';

import {
  fitCameraToBoundingBox,
  getNormalizedPixelCoordinates,
  PointerEventsTarget,
  PointerEvents,
  getPixelCoordinatesFromEvent
} from '@reveal/utilities';

import { CameraEventDelegate, CameraManagerCallbackData, CameraManagerEventType, CameraState } from './../types';
import { CameraManagerHelper } from './../CameraManagerHelper';
import { CameraManager } from './../CameraManager';
import { FlexibleControlsType } from './FlexibleControlsType';
import { FlexibleMouseActionType } from './FlexibleMouseActionType';
import { FlexibleCameraMarkers } from './FlexibleCameraMarkers';
import { moveCameraTargetTo, moveCameraPositionAndTargetTo } from './moveCamera';
import { FlexibleControlsTypeChangeDelegate, IFlexibleCameraManager } from './IFlexibleCameraManager';
import { FlexibleCameraEventTarget } from './FlexibleCameraEventTarget';

type RaycastCallback = (x: number, y: number, pickBoundingBox: boolean) => Promise<CameraManagerCallbackData>;

/**
 * Flexible implementation of {@link CameraManager}. The user can switch between Orbit, FirstPersion or OrbitInCenter
 * Supports automatic update of camera near and far planes and animated change of camera position and target.
 * @beta
 */

export class FlexibleCameraManager extends PointerEvents implements IFlexibleCameraManager {
  //================================================
  // INSTANCE FIELDS:
  //================================================

  private readonly _pointerEventsTarget?: PointerEventsTarget;
  private readonly _controls: FlexibleControls;
  private readonly _markers?: undefined | FlexibleCameraMarkers;
  private readonly _currentBoundingBox: Box3 = new Box3();
  private _isDisposed = false;
  private _isEnableClickAndDoubleClick = true;
  private _nearAndFarNeedsUpdate = false;
  private readonly _raycastCallback: RaycastCallback;
  private readonly _hasEventListeners: boolean;

  private readonly cameraManagerHelper = new CameraManagerHelper();

  //================================================
  // CONSTRUCTOR
  //================================================

  constructor(
    domElement: HTMLElement,
    raycastCallback: RaycastCallback,
    camera?: PerspectiveCamera,
    scene?: Scene,
    hasEventListeners?: boolean
  ) {
    super();
    this._hasEventListeners = hasEventListeners ?? true;
    this._controls = new FlexibleControls(camera, domElement, new FlexibleControlsOptions());
    this._controls.getPickedPointByPixelCoordinates = this.getPickedPointByPixelCoordinates;
    this._raycastCallback = raycastCallback;

    if (this._hasEventListeners) {
      this._pointerEventsTarget = new PointerEventsTarget(domElement, this);
      this.addEventListeners();
    }
    if (scene) {
      this._markers = new FlexibleCameraMarkers(scene);
    }

    this.isEnabled = true;

    const onCameraChange = () => {
      if (!this.isEnabled) {
        return;
      }
      this._nearAndFarNeedsUpdate = true;
      if (this._markers) {
        this._markers.update(this);
      }
    };
    this.on('cameraChange', onCameraChange);
  }

  //================================================
  // IMPLEMENTATION OF CameraManager (In correct order)
  //================================================

  public getCamera(): PerspectiveCamera {
    return this.camera;
  }

  public getCameraState(): Required<CameraState> {
    return {
      position: this.getPosition(),
      rotation: this.camera.quaternion.clone(),
      target: this.getTarget()
    };
  }

  /**
   * Sets camera state. All parameters are optional. Rotation and target can't be set at the same time,
   * if so, error will be thrown. Set rotation is preserved until next call of setCameraState with
   * empty rotation field.
   * @param state Camera state.
   * **/
  public setCameraState(state: CameraState): void {
    const position = state.position ?? this.getPosition();

    if (state.rotation && state.target) {
      this.controls.setTarget(state.target ?? this.getTarget());
      this.controls.setPositionAndRotation(position, state.rotation);
    } else if (state.target) {
      this.controls.setPositionAndTarget(position, state.target);
    } else if (state.rotation) {
      this.controls.setPositionAndRotation(position, state.rotation);
    } else {
      this.controls.setPositionAndTarget(position, this.getTarget());
    }
  }

  public activate(cameraManager?: CameraManager): void {
    if (this.isEnabled) {
      return;
    }
    this.isEnabled = true;

    if (cameraManager) {
      const previousState = cameraManager.getCameraState();
      this.setCameraState({ position: previousState.position, target: previousState.target });
      this.camera.aspect = cameraManager.getCamera().aspect;
    }
  }

  public deactivate(): void {
    if (!this.isEnabled) {
      return;
    }
    this.isEnabled = false;
  }

  public on(event: CameraManagerEventType, callback: CameraEventDelegate): void {
    this.listeners.addEventListener(event, callback);
  }

  public off(event: CameraManagerEventType, callback: CameraEventDelegate): void {
    this.listeners.removeEventListener(event, callback);
  }

  public fitCameraToBoundingBox(boundingBox: Box3, duration?: number, radiusFactor: number = 2): void {
    const { position, target } = fitCameraToBoundingBox(this.camera, boundingBox, radiusFactor);
    moveCameraPositionAndTargetTo(this, position, target, duration);
  }

  public update(deltaTime: number, nearFarPlaneBoundingBox: Box3): void {
    // If the camera haven't set the position and target before, do it now
    if (this._nearAndFarNeedsUpdate || !nearFarPlaneBoundingBox.equals(this._currentBoundingBox)) {
      this._nearAndFarNeedsUpdate = false;
      this._currentBoundingBox.copy(nearFarPlaneBoundingBox);
      this.updateCameraNearAndFar(nearFarPlaneBoundingBox);
    }
    if (this.isEnabled) {
      this.controls.update(deltaTime);
    }
  }

  public dispose(): void {
    this._isDisposed = true;
    this.removeEventListeners();
    this._markers?.dispose();
  }

  //================================================
  // IMPLEMENTATION OF IFlexibleCameraManager (In correct order)
  //================================================

  public get controlsType(): FlexibleControlsType {
    return this.controls.controlsType;
  }

  public set controlsType(value: FlexibleControlsType) {
    this.controls.setControlsType(value);
  }

  public rotateCameraTo(direction: Vector3, animationDuration: number): void {
    if (this.isDisposed) return;

    const startDirection = this.controls.cameraVector.value.clone();
    const endDirection = new Spherical().setFromVector3(direction);
    const from = { t: 0 };
    const to = { t: 1 };
    const animation = new TWEEN.Tween(from);
    this.controls.temporarilyDisableKeyboard = true;
    const tween = animation
      .to(to, animationDuration)
      .onUpdate(() => {
        if (this.isDisposed) return;
        this.controls.rotateCameraTo(startDirection, endDirection, from.t);
      })
      .onStop(() => {
        this.controls.temporarilyDisableKeyboard = false;
        if (this.isDisposed) return;
        this.controls.rotateCameraTo(startDirection, endDirection, 1);
      })
      .onComplete(() => {
        this.controls.temporarilyDisableKeyboard = false;
        if (this.isDisposed) return;
        this.controls.rotateCameraTo(startDirection, endDirection, 1);
      })
      .start(TWEEN.now());
    TWEEN.add(tween);
    tween.update(TWEEN.now());
  }

  public addControlsTypeChangeListener(callback: FlexibleControlsTypeChangeDelegate): void {
    this.listeners.addEventListener('controlsTypeChange', callback);
  }

  public removeControlsTypeChangeListener(callback: FlexibleControlsTypeChangeDelegate): void {
    this.listeners.removeEventListener('controlsTypeChange', callback);
  }

  public updateModelBoundingBox(modelBoundingBox: Box3): void {
    // If the camera haven't set the position and target before, do it now
    if (!this.controls.isInitialized) {
      const { position, target } = fitCameraToBoundingBox(this.camera, modelBoundingBox, 2);
      this.setPositionAndTarget(position, target);
      this.controls.isInitialized = true;
    }
    this.updateControlsSensitivity(modelBoundingBox);
  }

  public get options(): FlexibleControlsOptions {
    return this._controls.options;
  }

  //================================================
  // OVERRIDES of PointerEvents
  //================================================

  public override async onClick(event: PointerEvent): Promise<void> {
    if (!this.isEnabled || !this.isEnableClickAndDoubleClick || this.controls.isStationary) {
      return;
    }
    if (this.options.mouseClickType === FlexibleMouseActionType.None) {
      return;
    }
    const position = getPixelCoordinatesFromEvent(event, this.domElement);
    await this.mouseAction(position, this.options.mouseClickType);
  }

  public override async onDoubleClick(event: PointerEvent): Promise<void> {
    if (!this.isEnabled || !this.isEnableClickAndDoubleClick || this.controls.isStationary) {
      return;
    }
    if (this.options.mouseClickType === FlexibleMouseActionType.None) {
      return;
    }
    const position = getPixelCoordinatesFromEvent(event, this.domElement);
    await this.mouseAction(position, this.options.mouseDoubleClickType);
  }

  public override async onPointerDown(event: PointerEvent, leftButton: boolean): Promise<void> {
    await this.controls.onPointerDown(event, leftButton);
  }

  public override async onPointerDrag(event: PointerEvent, leftButton: boolean): Promise<void> {
    await this.controls.onPointerDrag(event, leftButton);
  }

  public override async onPointerUp(event: PointerEvent, leftButton: boolean): Promise<void> {
    await this.controls.onPointerUp(event, leftButton);
  }

  //================================================
  // INSTANCE METHODS: Other events
  //================================================

  public async onWheel(event: WheelEvent, delta: number): Promise<void> {
    await this.controls.onWheel(event, delta);
  }

  public onKey(event: KeyboardEvent, down: boolean): void {
    this.controls.onKey(event, down);
  }

  public onFocusChanged(haveFocus: boolean): void {
    this.controls.onFocusChanged(haveFocus);
  }

  //================================================
  // INSTANCE METHODS: Setters and getters
  //================================================

  public get controls(): FlexibleControls {
    return this._controls;
  }

  public get camera(): PerspectiveCamera {
    return this.controls.camera as PerspectiveCamera;
  }

  get listeners(): FlexibleCameraEventTarget {
    return this.controls.listeners;
  }

  public get domElement(): HTMLElement {
    return this.controls.domElement;
  }

  public override get isEnabled(): boolean {
    return this.controls.isEnabled;
  }

  public get isEnableClickAndDoubleClick(): boolean {
    return this._isEnableClickAndDoubleClick;
  }

  public get isDisposed(): boolean {
    return this._isDisposed;
  }

  private set isEnabled(value: boolean) {
    this.controls.isEnabled = value;
  }

  public set isEnableClickAndDoubleClick(value: boolean) {
    this._isEnableClickAndDoubleClick = value;
  }

  private getPosition(): Vector3 {
    return this.camera.position.clone();
  }

  private getTarget(): Vector3 {
    return this.controls.getTarget();
  }

  public setPositionAndTarget(position: Vector3, target: Vector3): void {
    this.controls.setPositionAndTarget(position, target);
  }

  public setPosition(position: Vector3): void {
    this.controls.setPosition(position);
  }

  //================================================
  // INSTANCE METHODS: Calculations
  //================================================

  private readonly getPickedPointByPixelCoordinates = async (position: Vector2): Promise<Vector3> => {
    const raycastResult = await this._raycastCallback(position.x, position.y, false);
    if (raycastResult.intersection?.point) {
      return raycastResult.intersection.point;
    }
    // If no intersection, get the intersection from the bounding box
    return this.getTargetByBoundingBox(position, raycastResult.modelsBoundingBox);
  };

  private getTargetByBoundingBox(position: Vector2, boundingBox: Box3): Vector3 {
    const raycaster = new Raycaster();
    const normalizedCoords = getNormalizedPixelCoordinates(this.domElement, position.x, position.y);
    raycaster.setFromCamera(normalizedCoords, this.camera);

    // Try to intersect the bounding box
    const closestIntersection = new Vector3();
    const furthestIntersection = new Vector3();
    const intersectionCount = intersectBox(raycaster.ray, boundingBox, closestIntersection, furthestIntersection);
    if (intersectionCount === 1) {
      return closestIntersection;
    }
    if (intersectionCount === 2) {
      return furthestIntersection;
    }
    // Fallback to the old method
    const diagonal = getDiagonal(boundingBox);
    const center = boundingBox.getCenter(new Vector3());
    const distanceToCenter = this.camera.position.distanceTo(center);
    const distance = Math.min(distanceToCenter, diagonal) / 2;
    return raycaster.ray.at(distance, new Vector3());
  }

  //================================================
  // INSTANCE METHODS: Set up/tear down events
  //================================================

  private addEventListeners() {
    if (!this._hasEventListeners) {
      return;
    }
    this._pointerEventsTarget?.addEventListeners();
    this._controls.addEventListeners();
  }

  private removeEventListeners(): void {
    if (!this._hasEventListeners) {
      return;
    }
    this._pointerEventsTarget?.removeEventListeners();
    this._controls.removeEventListeners();
  }

  //================================================
  // INSTANCE METHODS: Event Handlers
  //================================================

  private async mouseAction(position: Vector2, mouseActionType: FlexibleMouseActionType) {
    if (mouseActionType === FlexibleMouseActionType.None) {
      return;
    }
    if (mouseActionType === FlexibleMouseActionType.SetTarget) {
      if (this.controls.controlsType !== FlexibleControlsType.Orbit) {
        return;
      }
      const newTarget = await this.getPickedPointByPixelCoordinates(position);
      this.controls.setTarget(newTarget);
      this.controls.updateCameraAndTriggerCameraChangeEvent();
    } else if (mouseActionType === FlexibleMouseActionType.SetTargetAndCameraDirection) {
      const newTarget = await this.getPickedPointByPixelCoordinates(position);
      moveCameraTargetTo(this, newTarget, this.options.animationDuration);
    } else if (mouseActionType === FlexibleMouseActionType.SetTargetAndCameraPosition) {
      this.setTargetAndCameraPosition(position);
    }
  }

  private async setTargetAndCameraPosition(position: Vector2) {
    const raycastResult = await this._raycastCallback(position.x, position.y, true);
    // If an object is picked, zoom in to the object (the target will be in the middle of the bounding box)
    if (raycastResult.pickedBoundingBox !== undefined) {
      const { position, target } = fitCameraToBoundingBox(this.camera, raycastResult.pickedBoundingBox, 3);
      moveCameraPositionAndTargetTo(this, position, target, this.options.animationDuration);
      return;
    }
    // If no particular bounding box is found, create it by camera distance
    // This happen when picking at a point clouds
    if (raycastResult.intersection?.point) {
      const point = raycastResult.intersection.point;
      const distance = raycastResult.intersection.distanceToCamera;
      const boundingBox = new Box3(point.clone(), point.clone());
      const moveFraction = 0.1;
      const radiusFactor = 3;
      boundingBox.expandByScalar(moveFraction * distance);
      const { position, target } = fitCameraToBoundingBox(this.camera, boundingBox, radiusFactor);
      moveCameraPositionAndTargetTo(this, position, target, this.options.animationDuration);
      return;
    }
    // If not particular object is picked, move the camera position towards the edge of the modelsBoundingBox
    const moveFraction = 0.33;
    const newTarget = this.getTargetByBoundingBox(position, raycastResult.modelsBoundingBox);
    const newPosition = new Vector3().subVectors(newTarget, this.camera.position);
    newPosition.multiplyScalar(moveFraction);
    newPosition.add(this.camera.position);
    moveCameraPositionAndTargetTo(this, newPosition, newTarget, this.options.animationDuration);
  }

  //================================================
  // INSTANCE METHODS: Updates
  //================================================

  private updateCameraNearAndFar(boundingBox: Box3): void {
    // See https://stackoverflow.com/questions/8101119/how-do-i-methodically-choose-the-near-clip-plane-distance-for-a-perspective-proj
    if (this._isDisposed) {
      return;
    }
    if (!this.options.automaticNearFarPlane) {
      return;
    }
    this.cameraManagerHelper.updateCameraNearAndFar(this.camera, boundingBox);
  }

  private updateControlsSensitivity(boundingBox: Box3): void {
    if (this._isDisposed) {
      return;
    }
    if (!this.options.automaticSensitivity) {
      return;
    }
    // This is used to determine the speed of the camera when flying with ASDW.
    // We want to either let it be controlled by the near plane if we are far away,
    // but no more than a fraction of the bounding box of the system if inside
    const diagonal = getHorizontalDiagonal(boundingBox);
    const diagonalFraction = diagonal * this.options.sensitivityDiagonalFraction;
    const nearFraction = 0.1 * this.camera.near;

    let sensitivity: number;
    if (diagonalFraction < nearFraction) {
      sensitivity = nearFraction;
    } else {
      sensitivity = this.options.getLegalSensitivity(diagonalFraction);
    }
    this.options.sensitivity = sensitivity;
  }

  public static as(manager: CameraManager): FlexibleCameraManager | undefined {
    // instanceof don't work within React, so using safeguarding
    const flexibleCameraManager = manager as FlexibleCameraManager;
    return flexibleCameraManager.controlsType === undefined ? undefined : flexibleCameraManager;
  }
}

function getDiagonal(boundingBox: Box3): number {
  return boundingBox.min.distanceTo(boundingBox.max);
}
function getHorizontalDiagonal(boundingBox: Box3): number {
  return Math.sqrt((boundingBox.max.x - boundingBox.min.x) ** 2 + (boundingBox.max.z - boundingBox.min.z) ** 2);
}

/**
 * Finds 0, 1 or 2 intersection points, return number of intersections and
 * sets the closest and furthest intersection points.
 */
function intersectBox(ray: Ray, box: Box3, closestIntersection: Vector3, furthestIntersection: Vector3): number {
  const invdirx = 1 / ray.direction.x;
  const invdiry = 1 / ray.direction.y;
  const invdirz = 1 / ray.direction.z;

  const origin = ray.origin;
  let tmin, tmax;
  if (invdirx >= 0) {
    tmin = (box.min.x - origin.x) * invdirx;
    tmax = (box.max.x - origin.x) * invdirx;
  } else {
    tmin = (box.max.x - origin.x) * invdirx;
    tmax = (box.min.x - origin.x) * invdirx;
  }
  let tymin, tymax;
  if (invdiry >= 0) {
    tymin = (box.min.y - origin.y) * invdiry;
    tymax = (box.max.y - origin.y) * invdiry;
  } else {
    tymin = (box.max.y - origin.y) * invdiry;
    tymax = (box.min.y - origin.y) * invdiry;
  }
  if (tmin > tymax || tymin > tmax) return 0;
  if (tymin > tmin || isNaN(tmin)) tmin = tymin;
  if (tymax < tmax || isNaN(tmax)) tmax = tymax;

  let tzmin, tzmax;
  if (invdirz >= 0) {
    tzmin = (box.min.z - origin.z) * invdirz;
    tzmax = (box.max.z - origin.z) * invdirz;
  } else {
    tzmin = (box.max.z - origin.z) * invdirz;
    tzmax = (box.min.z - origin.z) * invdirz;
  }

  if (tmin > tzmax || tzmin > tmax) return 0;
  if (tzmin > tmin || tmin !== tmin) tmin = tzmin;
  if (tzmax < tmax || tmax !== tmax) tmax = tzmax;

  if (tmin > tmax) [tmin, tmax] = [tmax, tmin];

  if (tmax < 0) return 0;
  if (tmin >= 0 && tmax >= 0) {
    closestIntersection = ray.at(tmin, closestIntersection);
    furthestIntersection = ray.at(tmax, furthestIntersection);
    return 2;
  }
  if (tmax >= 0) {
    closestIntersection = ray.at(tmax, closestIntersection);
    return 1;
  }
  return 0;
}
