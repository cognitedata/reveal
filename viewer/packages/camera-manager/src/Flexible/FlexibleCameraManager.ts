/*!
 * Copyright 2024 Cognite AS
 */

import { Box3, PerspectiveCamera, Raycaster, Vector2, Vector3, Scene, Ray } from 'three';

import { FlexibleControls } from './FlexibleControls';
import { FlexibleControlsOptions } from './FlexibleControlsOptions';

import {
  assertNever,
  EventTrigger,
  InputHandler,
  disposeOfAllEventListeners,
  PointerEventData,
  fitCameraToBoundingBox,
  getNormalizedPixelCoordinates,
  getClickOrTouchEventPoint
} from '@reveal/utilities';

import {
  CameraChangeDelegate,
  CameraEventDelegate,
  CameraManagerCallbackData,
  CameraManagerEventType,
  CameraState,
  CameraStopDelegate
} from './../types';
import { CameraManagerHelper } from './../CameraManagerHelper';
import { CameraManager } from './../CameraManager';
import { FlexibleControlsType } from './FlexibleControlsType';
import { FlexibleMouseActionType } from './FlexibleMouseActionType';
import { DebouncedCameraStopEventTrigger } from '../utils/DebouncedCameraStopEventTrigger';
import { FlexibleCameraMarkers } from './FlexibleCameraMarkers';
import { moveCameraTargetTo, moveCameraTo } from './moveCamera';
import { FlexibleControlsTypeChangeDelegate, IFlexibleCameraManager } from './IFlexibleCameraManager';

type RaycastCallback = (x: number, y: number, pickBoundingBox: boolean) => Promise<CameraManagerCallbackData>;

/**
 * Flexible implementation of {@link CameraManager}. The user can switch between Orbit, FirstPersion or OrbitInCenter
 * Supports automatic update of camera near and far planes and animated change of camera position and target.
 * @beta
 */

export class FlexibleCameraManager implements IFlexibleCameraManager {
  //================================================
  // INSTANCE FIELDS:
  //================================================

  private readonly _triggers = {
    cameraChange: new EventTrigger<CameraChangeDelegate>(),
    controlsTypeChange: new EventTrigger<FlexibleControlsTypeChangeDelegate>()
  };
  private readonly _stopEventTrigger: DebouncedCameraStopEventTrigger;
  private readonly _controls: FlexibleControls;
  private readonly _camera: PerspectiveCamera;
  private readonly _domElement: HTMLElement;
  private readonly _inputHandler: InputHandler;
  private readonly _markers?: undefined | FlexibleCameraMarkers;
  private readonly _currentBoundingBox: Box3 = new Box3();
  private _isDisposed = false;
  private _nearAndFarNeedsUpdate = false;
  private _isEnabled = true;

  // For the wheel event
  private _prevTime = 0;
  private readonly _prevCoords = new Vector2();

  //================================================
  // INSTANCE FIELDS: Events
  //================================================

  private readonly _raycastCallback: RaycastCallback;

  //================================================
  // CONSTRUCTOR
  //================================================

  constructor(
    domElement: HTMLElement,
    inputHandler: InputHandler,
    raycastCallback: RaycastCallback,
    camera?: PerspectiveCamera,
    scene?: Scene
  ) {
    this._camera = camera ?? new PerspectiveCamera(60, undefined, 0.1, 10000);
    this._controls = new FlexibleControls(this.camera, domElement, new FlexibleControlsOptions());
    this._controls.getPickedPointByPixelCoordinates = this.getPickedPointByPixelCoordinates;
    this._domElement = domElement;
    this._inputHandler = inputHandler;
    this._raycastCallback = raycastCallback;
    if (scene) {
      this._markers = new FlexibleCameraMarkers(scene);
    }

    this.addEventListeners();
    this._controls.addEventListeners(); // After this.addEventListeners();
    this.isEnabled = true;
    this._stopEventTrigger = new DebouncedCameraStopEventTrigger(this);
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
    if (state.rotation && state.target) {
      throw new Error(`Rotation and target can't be set at the same time`);
    }
    const position = state.position ?? this.getPosition();
    if (state.target) {
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
    switch (event) {
      case 'cameraChange':
        this._triggers.cameraChange.subscribe(callback as CameraChangeDelegate);
        break;
      case 'cameraStop':
        this._stopEventTrigger.subscribe(callback as CameraStopDelegate);
        break;
      default:
        assertNever(event);
    }
  }

  public off(event: CameraManagerEventType, callback: CameraEventDelegate): void {
    switch (event) {
      case 'cameraChange':
        this._triggers.cameraChange.unsubscribe(callback as CameraChangeDelegate);
        break;
      case 'cameraStop':
        this._stopEventTrigger.unsubscribe(callback as CameraStopDelegate);
        break;
      default:
        assertNever(event);
    }
  }

  public fitCameraToBoundingBox(boundingBox: Box3, duration?: number, radiusFactor: number = 2): void {
    const { position, target } = fitCameraToBoundingBox(this.camera, boundingBox, radiusFactor);
    moveCameraTo(this, position, target, duration);
  }

  public update(deltaTime: number, boundingBox: Box3): void {
    // If the camera haven't set the position and target before, do it now
    if (!this.controls.isInitialized) {
      const { position, target } = fitCameraToBoundingBox(this.camera, boundingBox, 2);
      this.setPositionAndTarget(position, target);
      this.controls.isInitialized = true;
      console.log('update init');
    }
    console.log('update');

    if (this._nearAndFarNeedsUpdate || !boundingBox.equals(this._currentBoundingBox)) {
      this._nearAndFarNeedsUpdate = false;
      this._currentBoundingBox.copy(boundingBox);
      this.updateCameraNearAndFar();
      this.updateControlsSensitivity();
    }
    if (this.controls.isEnabled) {
      this.controls.update(deltaTime);
    }
  }

  public dispose(): void {
    this._isDisposed = true;
    this.controls.dispose();
    this.removeEventListeners();
    disposeOfAllEventListeners(this._triggers);
    this._inputHandler.dispose();
    this._stopEventTrigger.dispose();
  }

  //================================================
  // IMPLEMENTATION OF IFlexibleCameraManager (In correct order)
  //================================================

  public get controlsType(): FlexibleControlsType {
    return this.controls.options.controlsType;
  }

  public set controlsType(value: FlexibleControlsType) {
    this.controls.setControlsType(value);
  }

  public addControlsTypeChangeListener(callback: FlexibleControlsTypeChangeDelegate): void {
    this._triggers.controlsTypeChange.subscribe(callback);
  }

  public removeControlsTypeChangeListener(callback: FlexibleControlsTypeChangeDelegate): void {
    this._triggers.controlsTypeChange.subscribe(callback);
  }

  //================================================
  // INSTANCE METHODS: Setters and getters
  //================================================

  public get options(): FlexibleControlsOptions {
    return this._controls.options;
  }

  public get controls(): FlexibleControls {
    return this._controls;
  }

  public get camera(): PerspectiveCamera {
    return this._camera;
  }

  public get domElement(): HTMLElement {
    return this._domElement;
  }

  public get isEnabled(): boolean {
    return this._isEnabled;
  }

  public get isDisposed(): boolean {
    return this._isDisposed;
  }

  private set isEnabled(value: boolean) {
    this._isEnabled = value;
    this.controls.isEnabled = true;
  }

  private getPosition(): Vector3 {
    return this.camera.position.clone();
  }

  private getTarget(): Vector3 {
    return this.controls.getTarget();
  }

  public getBoundingBoxDiagonal(): number {
    return getDiagonal(this._currentBoundingBox);
  }
  public getHorizontalDiagonal(): number {
    return getHorizontalDiagonal(this._currentBoundingBox);
  }

  public setPositionAndTarget(position: Vector3, target: Vector3): void {
    if (this.controls.isEnabled) {
      this.controls.setPositionAndTarget(position, target);
    }
  }

  //================================================
  // INSTANCE METHODS: Calculations
  //================================================

  private readonly getPickedPointByPixelCoordinates = async (pixelX: number, pixelY: number): Promise<Vector3> => {
    const raycastResult = await this._raycastCallback(pixelX, pixelY, false);
    if (raycastResult.intersection?.point) {
      return raycastResult.intersection.point;
    }
    // If no intersection, get the intersection from the bounding box
    return this.getTargetByBoundingBox(pixelX, pixelY, raycastResult.modelsBoundingBox);
  };

  private getTargetByBoundingBox(pixelX: number, pixelY: number, boundingBox: Box3): Vector3 {
    const raycaster = new Raycaster();
    const normalizedCoords = getNormalizedPixelCoordinates(this.domElement, pixelX, pixelY);
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
    this._inputHandler.on('click', this.onClick);
    this.domElement.addEventListener('keydown', this.onKeyDown);
    this.domElement.addEventListener('dblclick', this.onDoubleClick);
    this.domElement.addEventListener('wheel', this.onWheel);
    this.controls.addEventListener('cameraChange', this.onCameraChange);
    this.controls.addEventListener('controlsTypeChange', this.onControlsTypeChange);
  }

  private removeEventListeners(): void {
    this._inputHandler.off('click', this.onClick);
    this.domElement.removeEventListener('dblclick', this.onDoubleClick);
    this.domElement.removeEventListener('keydown', this.onKeyDown);
    this.domElement.removeEventListener('wheel', this.onWheel);
    this.controls.removeEventListener('cameraChange', this.onCameraChange);
    this.controls.removeEventListener('controlsTypeChange', this.onControlsTypeChange);
  }

  //================================================
  // INSTANCE METHODS: Event Handlers
  //================================================

  private readonly onCameraChange = (event: { content: { position: Vector3; target: Vector3 } }) => {
    const { position, target } = event.content;
    this._triggers.cameraChange.fire(position.clone(), target.clone());
    this._nearAndFarNeedsUpdate = true;
    if (this._markers) {
      this._markers.update(this);
    }
  };

  private readonly onControlsTypeChange = (event: { controlsType: FlexibleControlsType }) => {
    this._triggers.controlsTypeChange.fire(event.controlsType);
  };

  private readonly onKeyDown = (event: KeyboardEvent) => {
    if (!this.isEnabled) {
      return;
    }
    if (!this.options.enableChangeControlsTypeOn123Key) {
      return;
    }
    if (event.code === 'Digit1') {
      return this.controls.setControlsType(FlexibleControlsType.FirstPerson);
    } else if (event.code === 'Digit2') {
      return this.controls.setControlsType(FlexibleControlsType.Orbit);
    } else if (event.code === 'Digit3') {
      return this.controls.setControlsType(FlexibleControlsType.OrbitInCenter);
    }
  };

  private readonly onClick = async (event: PointerEventData) => {
    if (!this.isEnabled) return;
    if (this.options.mouseClickType !== FlexibleMouseActionType.None) {
      await this.mouseAction(event, this.options.mouseClickType);
    }
  };

  private readonly onDoubleClick = async (event: PointerEventData) => {
    if (!this.isEnabled) return;
    if (this.options.mouseDoubleClickType !== FlexibleMouseActionType.None) {
      await this.mouseAction(event, this.options.mouseDoubleClickType);
    }
  };

  private readonly onWheel = async (event: WheelEvent) => {
    if (!this.isEnabled) return;
    if (!this.options.shouldPick) {
      return;
    }
    // Added because cameraControls are disabled when doing picking, so
    // preventDefault could be not called on wheel event and produce unwanted scrolling.
    event.preventDefault();
    const currentCoords = getClickOrTouchEventPoint(event, this.domElement);
    const currentTime = performance.now();
    const deltaTime = currentTime - this._prevTime;
    const deltaCoords = currentCoords.distanceTo(this._prevCoords);

    if (deltaTime <= this.options.minimumTimeBetweenRaycasts) {
      return;
    }
    const timeHasChanged = deltaTime >= this.options.maximumTimeBetweenRaycasts;
    const positionHasChanged = deltaCoords >= this.options.mouseDistanceThresholdBetweenRaycasts;
    if (!positionHasChanged || !timeHasChanged) {
      return;
    }
    this._prevTime = currentTime;
    this._prevCoords.copy(currentCoords);

    const scrollCursor = await this.getPickedPointByPixelCoordinates(currentCoords.x, currentCoords.y);
    this.controls.setScrollCursor(scrollCursor);
    this._prevTime = currentTime;
  };

  private async mouseAction(event: PointerEventData, mouseActionType: FlexibleMouseActionType) {
    if (mouseActionType === FlexibleMouseActionType.None) {
      return;
    }
    if (mouseActionType === FlexibleMouseActionType.SetTarget) {
      if (this.controls.controlsType === FlexibleControlsType.FirstPerson) {
        return;
      }
      const newTarget = await this.getPickedPointByPixelCoordinates(event.offsetX, event.offsetY);
      this.controls.setTarget(newTarget);
      this.controls.triggerCameraChangeEvent();
    } else if (mouseActionType === FlexibleMouseActionType.SetTargetAndCameraDirection) {
      const newTarget = await this.getPickedPointByPixelCoordinates(event.offsetX, event.offsetY);
      moveCameraTargetTo(this, newTarget, this.options.animationDuration);
    } else if (mouseActionType === FlexibleMouseActionType.SetTargetAndCameraPosition) {
      this.setTargetAndCameraPosition(event);
    }
  }

  private async setTargetAndCameraPosition(event: PointerEventData) {
    const raycastResult = await this._raycastCallback(event.offsetX, event.offsetY, true);
    // If an object is picked, zoom in to the object (the target will be in the middle of the bounding box)
    if (raycastResult.pickedBoundingBox !== undefined) {
      const { position, target } = fitCameraToBoundingBox(this.camera, raycastResult.pickedBoundingBox, 3);
      moveCameraTo(this, position, target, this.options.animationDuration);
      return;
    }
    // If not particular bounding box is found, create it by camera distance
    // This happen when picking at a point clouds
    if (raycastResult.intersection?.point) {
      const point = raycastResult.intersection.point;
      const distance = raycastResult.intersection.distanceToCamera;
      const boundingBox = new Box3(point.clone(), point.clone());
      const moveFraction = 0.1;
      const radiusFactor = 3;
      boundingBox.expandByScalar(moveFraction * distance);
      const { position, target } = fitCameraToBoundingBox(this.camera, boundingBox, radiusFactor);
      moveCameraTo(this, position, target, this.options.animationDuration);
      return;
    }
    // If not particular object is picked, move the camera position towards the edge of the modelsBoundingBox
    const moveFraction = 0.33;
    const newTarget = this.getTargetByBoundingBox(event.offsetX, event.offsetY, raycastResult.modelsBoundingBox);
    const newPosition = new Vector3().subVectors(newTarget, this.camera.position);
    newPosition.multiplyScalar(moveFraction);
    newPosition.add(this.camera.position);
    moveCameraTo(this, newPosition, newTarget, this.options.animationDuration);
  }

  //================================================
  // INSTANCE METHODS: Updates
  //================================================

  private updateCameraNearAndFar(): void {
    // See https://stackoverflow.com/questions/8101119/how-do-i-methodically-choose-the-near-clip-plane-distance-for-a-perspective-proj
    if (this._isDisposed) {
      return;
    }
    if (!this.options.automaticNearFarPlane) {
      return;
    }
    CameraManagerHelper.updateCameraNearAndFar(this.camera, this._currentBoundingBox);
  }

  private updateControlsSensitivity(): void {
    if (this._isDisposed) {
      return;
    }
    if (!this.options.automaticSensitivity) {
      return;
    }
    // This is used to determine the speed of the camera when flying with ASDW.
    // We want to either let it be controlled by the near plane if we are far away,
    // but no more than a fraction of the bounding box of the system if inside
    const diagonal = this.getHorizontalDiagonal();
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
