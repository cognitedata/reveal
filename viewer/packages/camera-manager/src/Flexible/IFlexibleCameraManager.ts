/*!
 * Copyright 2024 Cognite AS
 */

import { FlexibleControlsOptions } from './FlexibleControlsOptions';
import { CameraManager } from '../CameraManager';
import { FlexibleControlsType } from './FlexibleControlsType';

/**
 * @beta
 */
export type ControlsTypeChangeDelegate = (controlsType: FlexibleControlsType) => void;

/**
 * Flexible implementation of {@link CameraManager}. The user can switch between Orbit, FirstPersion or OrbitInCenter
 * Supports automatic update of camera near and far planes and animated change of camera position and target.
 * @beta
 */
export interface IFlexibleCameraManager extends CameraManager {
  get options(): FlexibleControlsOptions;
  get controlsType(): FlexibleControlsType;
  set controlsType(value: FlexibleControlsType);

  addControlsTypeChangeListener(callback: ControlsTypeChangeDelegate): void;
  removeControlsTypeChangeListener(callback: ControlsTypeChangeDelegate): void;
}
