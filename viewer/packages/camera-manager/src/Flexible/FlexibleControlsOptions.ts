/*!
 * Copyright 2024 Cognite AS
 */

import { MathUtils } from 'three';
import { FlexibleControlsType } from './FlexibleControlsType';
import { FlexibleMouseActionType } from './FlexibleMouseActionType';
import { FlexibleWheelZoomType } from './FlexibleWheelZoomType';

const DEFAULT_POINTER_ROTATION_SPEED = (0.5 * Math.PI) / 360; // half degree per pixel
const DEFAULT_KEYBOARD_ROTATION_SPEED = DEFAULT_POINTER_ROTATION_SPEED * 5;
const DEFAULT_MIN_POLAR_ANGLE = 0.0001;

/**
 * @beta
 */
export class FlexibleControlsOptions {
  //================================================
  // INSTANCE FIELDS
  //================================================

  // Main behaivor
  public controlsType = FlexibleControlsType.Orbit;

  // Mouse click, double click and wheel behaivor
  public mouseWheelAction = FlexibleWheelZoomType.Auto;
  public mouseClickType = FlexibleMouseActionType.SetTarget;
  public mouseDoubleClickType = FlexibleMouseActionType.SetTargetAndCameraPosition;
  public enableChangeControlsTypeOn123Key = true;
  public enableKeyboardNavigation = true;

  // Used in FlexibleCameraManager
  public animationDuration = 300;
  public minimumTimeBetweenRaycasts = 200; // For mouse wheel event
  public maximumTimeBetweenRaycasts = 1000; // For mouse wheel event
  public mouseDistanceThresholdBetweenRaycasts = 5; // For mouse wheel event

  // Angles
  public minPolarAngle = DEFAULT_MIN_POLAR_ANGLE;
  public maxPolarAngle = Math.PI - DEFAULT_MIN_POLAR_ANGLE;
  public minAzimuthAngle = -Infinity;
  public maxAzimuthAngle = Infinity;

  // Dampning
  public enableDamping = true;
  public dampingFactor = 0.25;

  public automaticNearFarPlane = true;

  // Controls sensitivity
  public sensitivity = 0.4; // Smallest unit to move around
  public automaticSensitivity = true; // If true Sensitivity will be calculated automatically
  public sensitivityDiagonalFraction = 0.001; // sensitivity = boundingBox.diagonalLength * sensitivityDiagonalFraction
  public minSensitivity = 0.1; // Minimum sensitivity if calculated automatically
  public maxSensitivity = 0.8; // Maximum sensitivity if calculated automatically

  // Rotation speed
  public mouseRotationSpeedAzimuth = DEFAULT_POINTER_ROTATION_SPEED;
  public mouseRotationSpeedPolar = DEFAULT_POINTER_ROTATION_SPEED;
  public keyboardRotationSpeedAzimuth = DEFAULT_KEYBOARD_ROTATION_SPEED;
  public keyboardRotationSpeedPolar = DEFAULT_KEYBOARD_ROTATION_SPEED * 0.8;
  public keyboardFastRotationFactor = 2;

  // Wheel settings
  public zoomFraction = 0.05;
  public minOrthographicZoom = 0;
  public maxOrthographicZoom = Infinity;

  // Mouse speed for dolly and pan
  public wheelDollySpeed = 0.5;
  public mousePanSpeed = 25;
  public mouseDollySpeed = 100;

  // Keyboard speed for dolly and pan
  public keyboardPanSpeed = 100;
  public keyboardDollySpeed = 200;
  public keyboardFastMoveFactor = 5;

  // Pinch speed
  public pinchEpsilon = 0.1;
  public pinchPanSpeed = 50;

  public orthographicCameraDollyFactor = 0.3;

  // For when it is isStationary
  public minimumFov: number = 5;
  public maximumFov: number = 100;
  public defaultFov: number = 60;

  // Shaw target as a Marker settings
  public showTarget = true;
  public relativeMarkerSize = 0.018;
  public outerMarkerColor = '#FF2222';
  public innerMarkerColor = '#FFFFFF';

  //================================================
  // INSTANCE PROPERTIES
  //================================================

  public get realMouseWheelAction(): FlexibleWheelZoomType {
    if (this.mouseWheelAction === FlexibleWheelZoomType.Auto) {
      return this.controlsType === FlexibleControlsType.FirstPerson
        ? FlexibleWheelZoomType.ToCursor
        : FlexibleWheelZoomType.PastCursor;
    }
    return this.mouseWheelAction;
  }

  public get shouldPick(): boolean {
    switch (this.realMouseWheelAction) {
      case FlexibleWheelZoomType.ToCursor:
      case FlexibleWheelZoomType.PastCursor:
        return true;

      default:
        return false;
    }
  }

  //================================================
  // INSTANCE METHODS: Getters
  //================================================

  public getLegalFov(fov: number): number {
    return MathUtils.clamp(fov, this.minimumFov, this.maximumFov);
  }

  public getLegalAzimuthAngle(azimuthAngle: number): number {
    return MathUtils.clamp(azimuthAngle, this.minAzimuthAngle, this.maxAzimuthAngle);
  }

  public getLegalPolarAngle(polarAngle: number): number {
    return MathUtils.clamp(polarAngle, this.minPolarAngle, this.maxPolarAngle);
  }

  public getLegalSensitivity(controlsSensitivity: number): number {
    return MathUtils.clamp(controlsSensitivity, this.minSensitivity, this.maxSensitivity);
  }
}
