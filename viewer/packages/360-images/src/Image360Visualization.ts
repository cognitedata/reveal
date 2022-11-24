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
  visible: boolean;
  /**
   * Scale of the box containing the 360 image
   */
  scale: THREE.Vector3;
  /**
   * Render order of the mesh containing the 360 image
   */
  renderOrder: number;
}
