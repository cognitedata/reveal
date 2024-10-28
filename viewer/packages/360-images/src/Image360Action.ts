/*!
 * Copyright 2024 Cognite AS
 */

/**
 * 360 image action to be used by the CogniteViewer.canDo360Action and do360Action
 * @beta
 */
export enum Image360Action {
  /**
   * When inside 360 image, forwards on the history list.
   */
  Forward,
  /**
   * When inside 360 image, backwards on the history list.
   */
  Backward,
  /**
   * When outside 360 image, go to current in the history list (where you exit from).
   */
  Enter,
  /**
   * When inside 360, exit.
   */
  Exit
}
