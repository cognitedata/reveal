/*!
 * Copyright 2021 Cognite AS
 */

import { ControlsType } from './ControlsType';
import { MouseActionType } from './MouseActionType';
import { WheelZoomType } from './WheelZoomType';

const DEFAULT_POINTER_ROTATION_SPEED = Math.PI / 360; // half degree per pixel
const DEFAULT_KEYBOARD_ROTATION_SPEED = DEFAULT_POINTER_ROTATION_SPEED * 10;

export class FlexibleControlsOptions {
  mouseWheelAction = WheelZoomType.Auto;
  controlsType = ControlsType.Combo;
  showTarget = true;
  showLookAt = true;

  get realMouseWheelAction(): WheelZoomType {
    if (this.mouseWheelAction == WheelZoomType.Auto) {
      return this.controlsType == ControlsType.FirstPerson ? WheelZoomType.PastCursor : WheelZoomType.ToCursor;
    }
    return this.mouseWheelAction;
  }

  // Mouse click and double click behaivor
  mouseClickType = MouseActionType.None;
  mouseDoubleClickType = MouseActionType.None;

  // These was in the DefaultCameraManager
  public readonly animationDuration = 300;
  public readonly maximumMinDistance = 0.8; // For ComboColntrol.option.minDistance
  public readonly maximumTimeBetweenRaycasts = 200;
  public readonly mouseDistanceThresholdBetweenRaycasts = 5;

  // Angles
  public minPolarAngle = 0;
  public maxPolarAngle = Math.PI;
  public minAzimuthAngle = -Infinity;
  public maxAzimuthAngle = Infinity;

  // Dampning
  public enableDamping = true;
  public dampingFactor = 0.25;

  public dynamicTarget = true;
  public minDistance = 0.8;
  public minZoomDistance = 0.4;
  public dollyFactor = 0.99;

  public enableKeyboardNavigation = true;

  public panDollyMinDistanceFactor = 10.0;
  public firstPersonRotationFactor = 0.4;
  public pointerRotationSpeedAzimuth = DEFAULT_POINTER_ROTATION_SPEED;
  public pointerRotationSpeedPolar = DEFAULT_POINTER_ROTATION_SPEED;
  public keyboardRotationSpeedAzimuth = DEFAULT_KEYBOARD_ROTATION_SPEED;
  public keyboardRotationSpeedPolar = DEFAULT_KEYBOARD_ROTATION_SPEED * 0.8;
  public mouseFirstPersonRotationSpeed = DEFAULT_POINTER_ROTATION_SPEED * 2;
  public keyboardDollySpeed = 2;
  public keyboardPanSpeed = 10;
  public keyboardSpeedFactor = 3;
  public pinchEpsilon = 2;
  public pinchPanSpeed = 1;
  public EPSILON = 0.001;
  public minZoom = 0;
  public maxZoom = Infinity;
  public orthographicCameraDollyFactor = 0.3;
  public minDeltaRatio = 1;
  public maxDeltaRatio = 8;
  public minDeltaDownscaleCoefficient = 0.1;
  public maxDeltaDownscaleCoefficient = 1;
}
