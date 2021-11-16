/*!
 * Copyright 2021 Cognite AS
 */

export type CameraControlsOptions = {
  /**
   * Enables or disables the usage of "zoom-to-cursor" mechanics based on either lerping in the direction of the cursor or using so-called scroll target notion.
   * When mouse wheel scroll is initiated scroll target is set to the point on the model where cursor is hovering over. Then when zooming is happening camera
   * target moves towards scroll target with speed proportional to zooming speed. This prevents the camera to go through the model when using mouse navigation,
   * keyboard navigation still allows to go through the model.
   *
   * Default is 'basicLerp'.
   *
   */
  zoomToCursor?:
    | 'disable' // disables "zoom-to-cursor" mechanic, then mouse scroll zooms just to the current target of the camera
    | 'basicLerp' // based on lerping in the direction of the ray coming from camera through cursor position
    | 'scrollTarget'; // moves the target towards the point on the model where
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
