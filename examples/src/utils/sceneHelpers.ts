/*
 * Copyright 2020 Cognite AS
 */

import { default as THREE, WebGLRenderer } from 'three';

export function resizeRendererToDisplaySize(
  renderer: WebGLRenderer,
  camera: THREE.PerspectiveCamera
) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
  return needResize;
}
