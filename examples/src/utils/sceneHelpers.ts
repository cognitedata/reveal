/*
 * Copyright 2020 Cognite AS
 */

import { default as THREE, WebGLRenderer } from 'three';

export function resizeRendererToDisplaySize(
  renderer: WebGLRenderer,
  camera: THREE.PerspectiveCamera,
  updateStyle: boolean = false
) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== Math.floor(width * window.devicePixelRatio) || canvas.height !== Math.floor(height * window.devicePixelRatio);
  if (needResize) {
    renderer.setSize(width, height, updateStyle);
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
  return needResize;
}
