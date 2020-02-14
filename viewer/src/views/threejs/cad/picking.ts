/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { CadNode } from './CadNode';

type PickDelegate = (scene: THREE.Scene, camera: THREE.PerspectiveCamera, event: MouseEvent) => number;

export class CadPicker {
  private readonly _picker: {
    pick: PickDelegate;
  };

  constructor(renderer: THREE.WebGLRenderer, cadNode: CadNode) {
    this._picker = createCadPicker(renderer, cadNode);
  }

  pick(scene: THREE.Scene, camera: THREE.PerspectiveCamera, event: MouseEvent) {
    return this._picker.pick(scene, camera, event);
  }
}

export function createCadPicker(renderer: THREE.WebGLRenderer, cadNode: CadNode) {
  const pickingTarget = new THREE.WebGLRenderTarget(1, 1);
  const pixelBuffer = new Uint8Array(4);

  const pick = (scene: THREE.Scene, camera: THREE.PerspectiveCamera, event: MouseEvent) => {
    const pickCamera = camera.clone();

    const canvasRect = renderer.domElement.getBoundingClientRect();
    pickCamera.setViewOffset(
      renderer.domElement.clientWidth,
      renderer.domElement.clientHeight,
      renderer.getPixelRatio() * (event.clientX - canvasRect.left),
      renderer.getPixelRatio() * (event.clientY - canvasRect.top),
      1,
      1
    );

    cadNode.renderMode = 3;
    renderer.setRenderTarget(pickingTarget);
    renderer.render(scene, pickCamera);
    renderer.setRenderTarget(null);
    cadNode.renderMode = 1;

    renderer.readRenderTargetPixels(pickingTarget, 0, 0, 1, 1, pixelBuffer);

    const treeIndex = pixelBuffer[0] * 255 * 255 + pixelBuffer[1] * 255 + pixelBuffer[2];

    return treeIndex;
  };
  return {
    pick
  };
}
