/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';

export interface Image360Visualization {
  /**
   * Opaqueness of the 360 image
   */
  opacity: number;
  /**
   * Visibility of the 360 image
   */
  set visible(value: boolean);
  /**
   * Scale of the box containing the 360 image
   */
  set scale(value: THREE.Vector3);
  /**
   * Render order of the mesh containing the 360 image
   */
  set renderOrder(value: number);
}
