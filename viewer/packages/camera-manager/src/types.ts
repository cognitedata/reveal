/*!
 * Copyright 2021 Cognite AS
 */

export interface RevealCameraControls {
    /**
     * Method for updating controls state
     */
    update: () => void;

    /**
     * Sets new state for controls
     */
    setState: (...args: any[]) => Object;

     /**
     * Method for getting current controls state
     */
    getState: () => Object;
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
    modelsBB: THREE.Box3;
  };