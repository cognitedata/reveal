/*!
 * Copyright 2021 Cognite AS
 */

export type CameraControlsOptions = {
  /**
   * Sets mouse wheel initiated action based on either lerping in the direction of the cursor or using so-called scroll target notion.
   * When mouse wheel scroll is initiated scroll target is set to the point on the model where cursor is hovering over. Then when zooming is happening camera
   * target moves towards scroll target with speed proportional to zooming speed. This prevents the camera to go through the model when using mouse navigation,
   * but keyboard navigation still allows to go through the model.
   *
   * Default is 'zoomPastCursor'.
   *
   */
  mouseWheelAction?:
    | 'zoomToTarget' // mouse wheel scroll zooms just to the current target (center of the screen) of the camera
    | 'zoomPastCursor' // mouse wheel scroll zooms in the direction of the ray coming from camera through cursor screen position, allows going through objects
    | 'zoomToCursor'; // mouse wheel scroll zooms towards the point on the model which cursor is hovering over, doesn't allow going through objects
  /**
   * Enables or disables change of camera target on mouse click. New target is then set to the point of the model under current cursor position.
   *
   * Default is false.
   *
   */
  onClickTargetChange?: boolean;
};

export interface RevealCameraControls {
  /**
   * Method for updating controls state
   */
  update: () => void;

  /**
   * Sets new state for controls
   */
  setState: (position: THREE.Vector3, target: THREE.Vector3) => void;

  /**
   * Method for getting current controls state
   */
  getState: () => { position: THREE.Vector3; target: THREE.Vector3 };

  /**
   * Sets view target (used for camera rotation animations) for controls.
   */
  setViewTarget: (target: THREE.Vector3) => void;

  /**
   * Sets scroll target (used for different scrolling mechanics) for controls.
   */
  setScrollTarget: (target: THREE.Vector3) => void;
}

export type CallbackData = {
  intersection: {
    /**
     * Coordinate of the intersection.
     */
    point: THREE.Vector3;
    /**
     * Distance from the camera to the intersection.
     */
    distanceToCamera: number;
  } | null;
  /**
   * Bounding box for all models on the scene
   */
  modelsBoundingBox: THREE.Box3;
};
