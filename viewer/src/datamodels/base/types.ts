/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';

export interface IntersectInput {
  normalizedCoords: {
    x: number;
    y: number;
  };
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  domElement: HTMLElement;
}
