/*!
 * Copyright 2021 Cognite AS
 */

export enum ControlsType {
  Combo = 'combo',
  FirstPerson = 'firstPerson',
  Orbit = 'orbit'
}

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
   * Work when changeCameraTargetOnClick is true. Enables or disables weather the it should zoom to the target or let the camera standing still
   *
   * Default is false, which is zoom to target
   *
   */
  changeTargetOnlyOnClick?: boolean;

  /**
   * Enables or disables change of camera position on mouse doubke click. New target is then set to the point of the model under current cursor
   * position and the a camera position is set half way to this point
   *
   * Default is false.
   *
   */
  changeCameraPositionOnDoubleClick?: boolean;

  /**
   * Set the initial controlsType on the camera
   *
   * Default is ControlsType.Combo as is was previously
   *
   */
  controlsType?: ControlsType;

  /**
   * Show taget as a white spot on the screen.
   * It is working when controlsType is ControlsType.Combo or ControlsType.Orbit
   *
   * Default is false
   *
   */
  showTarget?: boolean;

  /**
   * Show camera lookat position as a red spot on the screen.
   * It is working when controlsType is ControlsType.Combo or ControlsType.Orbit
   *
   * Default is false
   *
   */
  showLookAt?: boolean;
};
