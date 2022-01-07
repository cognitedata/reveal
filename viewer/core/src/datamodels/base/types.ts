/*!
 * Copyright 2022 Cognite AS
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
