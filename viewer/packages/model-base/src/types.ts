/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

export interface IntersectInput {
  normalizedCoords: {
    x: number;
    y: number;
  };
  camera: THREE.PerspectiveCamera;
  clippingPlanes: THREE.Plane[];
  renderer: THREE.WebGLRenderer;
  domElement: HTMLElement;
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
