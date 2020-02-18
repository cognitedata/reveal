/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { CadNode } from './CadNode';

interface PickingStorage {
  renderTarget: THREE.WebGLRenderTarget;
  pixelBuffer: Uint8Array;
}

interface PickingInput {
  event: MouseEvent;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  cadNode: CadNode;
}

function pickTreeIndex(storage: PickingStorage, input: PickingInput) {
  const { renderTarget, pixelBuffer } = storage;
  const { scene, camera, event, renderer, cadNode } = input;

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
  renderer.setRenderTarget(renderTarget);
  renderer.render(scene, pickCamera);
  renderer.setRenderTarget(null);
  cadNode.renderMode = 1;

  renderer.readRenderTargetPixels(renderTarget, 0, 0, 1, 1, pixelBuffer);

  const treeIndex = pixelBuffer[0] * 255 * 255 + pixelBuffer[1] * 255 + pixelBuffer[2];

  return treeIndex;
}

export class CadPicker {
  private readonly _pickingStorage: PickingStorage;

  constructor() {
    this._pickingStorage = {
      renderTarget: new THREE.WebGLRenderTarget(1, 1),
      pixelBuffer: new Uint8Array(4)
    };
  }

  pickTreeIndex(input: PickingInput) {
    return pickTreeIndex(this._pickingStorage, input);
  }
}
