/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';

export interface PickingInput {
  coords: {
    x: number;
    y: number;
  };
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
}

const storage = {
  renderTarget: new THREE.WebGLRenderTarget(1, 1),
  pixelBuffer: new Uint8Array(4)
};

export function pickPixelColor(input: PickingInput, clearColor: THREE.Color, clearAlpha: number) {
  const { renderTarget, pixelBuffer } = storage;
  const { scene, camera, coords, renderer } = input;

  const pickCamera = camera.clone();

  pickCamera.setViewOffset(
    renderer.domElement.clientWidth,
    renderer.domElement.clientHeight,
    ((coords.x + 1.0) / 2.0) * renderer.domElement.clientWidth,
    ((1.0 - coords.y) / 2.0) * renderer.domElement.clientHeight,
    1,
    1
  );

  const currentClearColor = renderer.getClearColor().clone();
  const currentClearAlpha = renderer.getClearAlpha();

  renderer.setRenderTarget(renderTarget);
  renderer.setClearColor(clearColor, clearAlpha);
  renderer.clearColor();
  renderer.render(scene, pickCamera);
  renderer.setRenderTarget(null);

  renderer.setClearColor(currentClearColor, currentClearAlpha);

  renderer.readRenderTargetPixels(renderTarget, 0, 0, 1, 1, pixelBuffer);
  return pixelBuffer;
}
