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