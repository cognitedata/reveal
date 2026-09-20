/*!
 * Copyright 2021 Cognite AS
 */

import type { PerspectiveCamera, Plane, Vector2, WebGLRenderer } from 'three';

export interface IntersectInput {
  normalizedCoords: Vector2;
  camera: PerspectiveCamera;
  clippingPlanes: Plane[];
  renderer: WebGLRenderer;
  domElement: HTMLElement;
  /**
   * Whether the camera is currently known to be in motion (e.g. mid interactive zoom/pan/orbit).
   * Lets pickers skip work that would only benefit picks answered after the camera settles.
   */
  cameraInMotion?: boolean;
  /**
   * Unconditionally skips point-cloud full-frame pick caching for this call. Intended for callers
   * that pick on every input event of a fast, continuous interaction (e.g. wheel-driven
   * zoom-to-cursor), where the pick happens before the camera has moved for that event, so
   * `cameraInMotion` can't yet reflect it.
   */
  forceWindowedPick?: boolean;
}

/**
 * State holding information about data being loaded.
 */
export type LoadingState = {
  /**
   * Indicates if we are currently loading more data.
   */
  isLoading: boolean;
  /**
   * Items loaded so far in this batch.
   */
  itemsLoaded: number;
  /**
   * Totals number of items to load in this batch.
   */
  itemsRequested: number;
  /**
   * Number of items that has been 'culled' (i.e. deemed not necessary
   * to load) so far in this batch.
   */
  itemsCulled: number;
};
