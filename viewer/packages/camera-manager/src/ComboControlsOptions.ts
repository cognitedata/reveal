/*!
 * Copyright 2024 Cognite AS
 */

/**
 * Exposed options for Combo Controls
 */
export type ComboControlsOptions = {
  enableDamping: boolean;
  dampingFactor: number;
  dynamicTarget: boolean;
  minDistance: number;
  minZoomDistance: number;
  dollyFactor: number;
  /**
   * Radians
   */
  minPolarAngle: number;

  /**
   * Radians
   */
  maxPolarAngle: number;

  /**
   * Radians
   */
  minAzimuthAngle: number;

  /**
   * Radians
   */
  maxAzimuthAngle: number;
  panDollyMinDistanceFactor: number;
  firstPersonRotationFactor: number;

  /**
   * Radians per pixel
   */
  pointerRotationSpeedAzimuth: number;

  /**
   * Radians per pixel
   */
  pointerRotationSpeedPolar: number;
  enableKeyboardNavigation: boolean;
  keyboardRotationSpeedAzimuth: number;
  keyboardRotationSpeedPolar: number;
  mouseFirstPersonRotationSpeed: number;
  keyboardDollySpeed: number;
  keyboardPanSpeed: number;

  /**
   * How much quicker keyboard navigation will be with 'shift' pressed
   */
  keyboardSpeedFactor: number;
  pinchEpsilon: number;
  pinchPanSpeed: number;
  EPSILON: number;
  minZoom: number;
  maxZoom: number;
  orthographicCameraDollyFactor: number;
  lookAtViewTarget: boolean;
  useScrollTarget: boolean;
  zoomToCursor: boolean;
  minDeltaRatio: number;
  maxDeltaRatio: number;
  minDeltaDownscaleCoefficient: number;
  maxDeltaDownscaleCoefficient: number;
};

const DEFAULT_POINTER_ROTATION_SPEED = Math.PI / 360; // half degree per pixel
const DEFAULT_KEYBOARD_ROTATION_SPEED = DEFAULT_POINTER_ROTATION_SPEED * 10;

export function CreateDefaultControlsOptions(): Readonly<Required<ComboControlsOptions>> {
  return {
    enableDamping: true,
    dampingFactor: 0.25,
    dynamicTarget: true,
    minDistance: 0.8,
    minZoomDistance: 0.4,
    dollyFactor: 0.99,
    minPolarAngle: 0,
    maxPolarAngle: Math.PI,
    minAzimuthAngle: -Infinity,
    maxAzimuthAngle: Infinity,
    panDollyMinDistanceFactor: 10.0,
    firstPersonRotationFactor: 0.4,
    pointerRotationSpeedAzimuth: DEFAULT_POINTER_ROTATION_SPEED,
    pointerRotationSpeedPolar: DEFAULT_POINTER_ROTATION_SPEED,
    enableKeyboardNavigation: true,
    keyboardRotationSpeedAzimuth: DEFAULT_KEYBOARD_ROTATION_SPEED,
    keyboardRotationSpeedPolar: DEFAULT_KEYBOARD_ROTATION_SPEED * 0.8,
    mouseFirstPersonRotationSpeed: DEFAULT_POINTER_ROTATION_SPEED * 2,
    keyboardDollySpeed: 2,
    keyboardPanSpeed: 10,
    keyboardSpeedFactor: 3,
    pinchEpsilon: 2,
    pinchPanSpeed: 1,
    EPSILON: 0.001,
    minZoom: 0,
    maxZoom: Infinity,
    orthographicCameraDollyFactor: 0.3,
    lookAtViewTarget: false,
    useScrollTarget: false,
    zoomToCursor: true,
    minDeltaRatio: 1,
    maxDeltaRatio: 8,
    minDeltaDownscaleCoefficient: 0.1,
    maxDeltaDownscaleCoefficient: 1
  };
}
