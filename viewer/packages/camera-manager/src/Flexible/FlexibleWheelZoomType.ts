/*!
 * Copyright 2024 Cognite AS
 */

/**
 * Sets mouse wheel initiated action.
 *
 * Modes:
 *
 * 'ToTarget' - zooms just to the current target (center of the screen) of the camera.
 *
 * 'PastCursor' - zooms in the direction of the ray coming from camera through cursor screen position, allows going through objects.
 *
 * 'ToCursor' - mouse wheel scroll zooms towards the point on the model where cursor is hovering over, doesn't allow going through objects.
 *
 * Default is 'zoomPastCursor'.
 *
 * @beta
 */

export enum FlexibleWheelZoomType {
  Center = 'center',
  PastCursor = 'pastCursor',
  ToCursor = 'toCursor',
  Auto = 'auto'
}
