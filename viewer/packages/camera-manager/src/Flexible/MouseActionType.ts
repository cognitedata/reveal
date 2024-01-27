/*!
 * Copyright 2021 Cognite AS
 */

export enum MouseActionType {
  None = 'none',
  SetTarget = 'setTarget',
  SetTargetAndCameraDirection = 'setTargetAndCameraDirection',
  SetTargetAndCameraPosition = 'setTargetAndCameraPosition'
}

/**
 * Sets mouse wheel initiated action.
 *
 * Modes:
 *
 * 'zoomToTarget' - zooms just to the current target (center of the screen) of the camera.
 *
 * 'zoomPastCursor' - zooms in the direction of the ray coming from camera through cursor screen position, allows going through objects.
 *
 * 'zoomToCursor' - mouse wheel scroll zooms towards the point on the model where cursor is hovering over, doesn't allow going through objects.
 *
 * Default is 'zoomPastCursor'.
 *
 */

export enum MouseWheelType {
  ToTarget = 'toTarget',
  PastCursor = 'pastCursor',
  ToCursor = 'toCursor',
  Auto = 'auto'
}
