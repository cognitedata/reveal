/*!
 * Copyright 2024 Cognite AS
 */

import { CameraManager } from '../CameraManager';
import { FlexibleControlsOptions } from './FlexibleControlsOptions';
import { FlexibleControlsType } from './FlexibleControlsType';
import { Vector3 } from 'three';

/**
 * @beta
 */
export type FlexibleControlsTypeChangeDelegate = (controlsType: FlexibleControlsType) => void;

/**
 * Flexible implementation of {@link CameraManager}. The user can switch between Orbit, FirstPerson or OrbitInCenter
 * Supports automatic update of camera near and far planes and animated change of camera position and target.
 * It provides additional functionality for controlling camera behavior and rotation.
 * @beta
 */

export interface IFlexibleCameraManager extends CameraManager {
  /**
   * Get current FlexibleControlsType type
   */
  get controlsType(): FlexibleControlsType;

  /**
   * Set current FlexibleControlsType type
   */
  set controlsType(value: FlexibleControlsType);

  /**
   * Set the options for the camera manager
   * @beta
   */
  get options(): FlexibleControlsOptions;

  /**
   * Rotates the camera to look in the specified direction.
   * Supports automatic update of camera near and far planes and animated change of camera position and target.
   * @beta
   * @param direction - The direction to rotate the camera towards.
   * @param animationDuration - The duration of the rotation animation in milliseconds.
   */
  rotateCameraTo(direction: Vector3, animationDuration: number): void;

  /**
   * Adds a listener for changes in the controls type of the camera manager.
   * @param callback - The callback function to be invoked when the controls type changes.
   */
  addControlsTypeChangeListener(callback: FlexibleControlsTypeChangeDelegate): void;

  /**
   * Removes a listener for changes in the controls type of the camera manager.
   * @param callback - The callback function to be removed from the controls type change listeners.
   */
  removeControlsTypeChangeListener(callback: FlexibleControlsTypeChangeDelegate): void;

  /**
   * Called when a click event is triggered
   * @beta
   */
  onClick(event: PointerEvent): Promise<void>;

  /**
   * Called when double click event is triggered
   * @beta
   */
  onDoubleClick(event: PointerEvent): Promise<void>;

  /**
   * Called when pointer is pressed
   * @beta
   */
  onPointerDown(event: PointerEvent, leftButton: boolean): Promise<void>;

  /**
   * Called when pointer is dragged
   * @beta
   */
  onPointerDrag(event: PointerEvent, leftButton: boolean): Promise<void>;

  /**
   * Called when pointer is released
   * @beta
   */
  onPointerUp(event: PointerEvent, leftButton: boolean): Promise<void>;
  /**
   * Called when wheel event is triggered
   * @beta
   */
  onWheel(event: WheelEvent, delta: number): Promise<void>;

  /**
   * Called when a key is pressed or released
   * @beta
   */
  onKey(event: KeyboardEvent, down: boolean): void;

  /**
   * Called when focus is changed
   * @beta
   */
  onFocusChanged(haveFocus: boolean): void;
}

/**
 * Check id the CameraManager is a IFlexibleCameraManager
 * @beta
 */
export function isFlexibleCameraManager(manager: CameraManager): manager is IFlexibleCameraManager {
  // instanceof don't work within React, so using safeguarding
  const flexibleCameraManager = manager as IFlexibleCameraManager;
  return flexibleCameraManager.controlsType !== undefined;
}
