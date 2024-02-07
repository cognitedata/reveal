/*!
 * Copyright 2021 Cognite AS
 */

export type CameraControlsOptions = {
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
  mouseWheelAction?: 'zoomToTarget' | 'zoomPastCursor' | 'zoomToCursor';
  /**
   * Enables or disables change of camera target on mouse click. New target is then set to the point of the model under current cursor position.
   *
   * Default is false.
   *
   */
  changeCameraTargetOnClick?: boolean;

  /**
   * Enables or disables change of camera position on mouse doubke click. New target is then set to the point of the model under current cursor
   * position and the a camera position is set half way to this point
   *
   * Default is false.
   *
   */
  changeCameraPositionOnDoubleClick?: boolean;
};
