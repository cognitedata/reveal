/*!
 * Copyright 2021 Cognite AS
 */

import { MathUtils } from 'three/src/math/MathUtils';
import { ControlsType } from './ControlsType';
import { MouseActionType } from './MouseActionType';
import { WheelZoomType } from './WheelZoomType';

const DEFAULT_POINTER_ROTATION_SPEED = (0.1 * Math.PI) / 360; // half degree per pixel
const DEFAULT_KEYBOARD_ROTATION_SPEED = DEFAULT_POINTER_ROTATION_SPEED * 10;
const DEFAULT_SENSITIVITY = 0.8;

/**
 * @experimental
 */
export class FlexibleControlsOptions {
  //================================================
  // INSTANCE FIELDS
  //================================================

  // Main behaivor
  public controlsType = ControlsType.Orbit;

  // Visualization
  public showTarget = true;
  public showLookAt = true;

  // Mouse click, double click and wheel behaivor
  public mouseWheelAction = WheelZoomType.Auto;
  public mouseWheelDynamicTarget = true;
  public mouseClickType = MouseActionType.None;
  public mouseDoubleClickType = MouseActionType.None;
  public enableChangeControlsTypeOn123Key = true;
  public enableKeyboardNavigation = true;

  // Used in FlexibleCameraManager
  public animationDuration = 300; // For animatiins
  public minimumTimeBetweenRaycasts = 200; // For mouse wheel event
  public maximumTimeBetweenRaycasts = 1000; // For mouse wheel event
  public mouseDistanceThresholdBetweenRaycasts = 5; // For mouse wheel event

  // Angles
  public minPolarAngle = 0;
  public maxPolarAngle = Math.PI;
  public minAzimuthAngle = -Infinity;
  public maxAzimuthAngle = Infinity;

  // Dampning
  public enableDamping = true;
  public dampingFactor = 0.25;

  public automaticNearFarPlane = true;

  // Controls sensitivity
  public sensitivity = DEFAULT_SENSITIVITY; // Smallest unit to move around
  public automaticSensitivity = true; // If true Sensitivity will be calculated automatically
  public sensitivityDiagonalFraction = 0.002; // sensitivity = boundingBox.diagonalLength * sensitivityDiagonalFraction
  public maximumSensitivity = DEFAULT_SENSITIVITY; // Maximum sensitivity if calculated automatically

  // Rotation speed
  public mouseRotationSpeedAzimuth = DEFAULT_POINTER_ROTATION_SPEED;
  public mouseRotationSpeedPolar = DEFAULT_POINTER_ROTATION_SPEED;
  public keyboardRotationSpeedAzimuth = DEFAULT_KEYBOARD_ROTATION_SPEED;
  public keyboardRotationSpeedPolar = DEFAULT_KEYBOARD_ROTATION_SPEED * 0.8;

  // Wheel settings
  public minZoomDistance = 0.4;
  public dollyFactorForZ = 0.99;
  public minOrthographicZoom = 0;
  public maxOrthographicZoom = Infinity;

  // Mouse speed for dolly and pan
  public wheelDollySpeed = 25;
  public mousePanSpeed = 25;
  public mouseDollySpeed = 100;

  // Keyboard speed for dolly and pan
  public keyboardPanSpeed = 200;
  public keyboardDollySpeed = 40;
  public keyboardFastMoveFactor = 4;

  // Pinch speeed
  public pinchEpsilon = 2;
  public pinchPanSpeed = 1;

  // Used in getDeltaDownscaleCoefficient only
  public minDeltaRatio = 1;
  public maxDeltaRatio = 8;
  public minDeltaDownscaleCoefficient = 0.1;
  public maxDeltaDownscaleCoefficient = 1;

  // Others
  public EPSILON = 0.001;
  public orthographicCameraDollyFactor = 0.3;

  //================================================
  // INSTANCE PROPERTIES
  //================================================

  public get realMouseWheelAction(): WheelZoomType {
    if (this.mouseWheelAction === WheelZoomType.Auto) {
      return this.controlsType === ControlsType.FirstPerson ? WheelZoomType.ToCursor : WheelZoomType.PastCursor;
    }
    return this.mouseWheelAction;
  }

  //================================================
  // INSTANCE METHODS: Getters
  //================================================

  public getLegalAzimuthAngle(azimuthAngle: number): number {
    return MathUtils.clamp(azimuthAngle, this.minAzimuthAngle, this.maxAzimuthAngle);
  }

  public getLegalPolarAngle(polarAngle: number): number {
    return MathUtils.clamp(polarAngle, this.minPolarAngle, this.maxPolarAngle);
  }

  public getLegalSensitivity(controlsSensitivity: number): number {
    return Math.min(controlsSensitivity, this.maximumSensitivity);
  }

  public getDeltaDownscaleCoefficient(targetOffsetToDeltaRatio: number): number {
    if (targetOffsetToDeltaRatio < this.minDeltaRatio) return this.maxDeltaDownscaleCoefficient;
    else if (targetOffsetToDeltaRatio > this.maxDeltaRatio) return this.minDeltaDownscaleCoefficient;
    else
      return MathUtils.mapLinear(
        targetOffsetToDeltaRatio,
        this.minDeltaRatio,
        this.maxDeltaRatio,
        this.maxDeltaDownscaleCoefficient,
        this.minDeltaDownscaleCoefficient
      );
  }
}
