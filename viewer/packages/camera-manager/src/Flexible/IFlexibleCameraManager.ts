/*!
 * Copyright 2024 Cognite AS
 */

import { CameraManager } from '../CameraManager';
import { FlexibleControlsType } from './FlexibleControlsType';
import { Vector3 } from 'three';

/**
 * @beta
 */
export type FlexibleControlsTypeChangeDelegate = (controlsType: FlexibleControlsType) => void;

/**
 * Flexible implementation of {@link CameraManager}. The user can switch between Orbit, FirstPersion or OrbitInCenter
 * Supports automatic update of camera near and far planes and animated change of camera position and target.
 * It provides additional functionality for controlling camera behavior and rotation.
 * @beta
 */

export type IFlexibleCameraManager = {
  /**
   * Get curent FlexibleControlsType type
   */
  get controlsType(): FlexibleControlsType;

  /**
   * Set curent FlexibleControlsType type
   */
  set controlsType(value: FlexibleControlsType);

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
} & CameraManager;

export function asFlexibleCameraManager(manager: CameraManager): IFlexibleCameraManager | undefined {
  // instanceof don't work within React, so using safeguarding
  const flexibleCameraManager = manager as IFlexibleCameraManager;
  return flexibleCameraManager.controlsType === undefined ? undefined : flexibleCameraManager;
}
