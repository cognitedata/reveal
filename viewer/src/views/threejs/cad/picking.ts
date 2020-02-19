/*!
 * Copyright 2020 Cognite AS
 */

import { CadNode } from './CadNode';
import { pickPixelColor, PickingInput } from '../pickPixelColor';
import { RenderMode } from '../materials';
import * as THREE from 'three';

export interface TreeIndexPickingInput extends PickingInput {
  cadNode: CadNode;
}

export interface TreeIndexPickingResult {
  distance: number;
  point: THREE.Vector3;
  treeIndex: number;
}

const clearColor = new THREE.Color('black');
const clearAlpha = 0.0;

export function pickCadNode(input: TreeIndexPickingInput): TreeIndexPickingResult | undefined {
  const treeIndex = pickTreeIndex(input);
  if (treeIndex === undefined) {
    return;
  }
  const distance = pickDepth(input);
  const point = getPosition(input, distance);
  return {
    distance,
    point,
    treeIndex
  };
}

export function pickTreeIndex(input: TreeIndexPickingInput): number | undefined {
  const { cadNode } = input;
  const previousRenderMode = cadNode.renderMode;
  cadNode.renderMode = RenderMode.TreeIndex;
  const pixelBuffer = pickPixelColor(input, clearColor, clearAlpha);
  cadNode.renderMode = previousRenderMode;

  if (pixelBuffer[3] === 0) {
    return;
  }

  const treeIndex = pixelBuffer[0] * 255 * 255 + pixelBuffer[1] * 255 + pixelBuffer[2];
  return treeIndex;
}

export function pickDepth(input: TreeIndexPickingInput): number {
  const { cadNode } = input;
  const previousRenderMode = cadNode.renderMode;
  cadNode.renderMode = RenderMode.Depth;
  const pixelBuffer = pickPixelColor(input, clearColor, clearAlpha);
  cadNode.renderMode = previousRenderMode;

  const depth = pixelBuffer[0] / 255 + pixelBuffer[1] / (255 * 255) + pixelBuffer[2] / (255 * 255 * 255);
  return depth;
}

export function getPosition(input: TreeIndexPickingInput, depth: number): THREE.Vector3 {
  const { camera, event, renderer } = input;
  const canvasRect = renderer.domElement.getBoundingClientRect();
  const screenZ = 2 * depth - 1;
  const { width, height } = renderer.getSize(new THREE.Vector2());
  const screenX = ((event.clientX - canvasRect.left) / width) * 2 - 1;
  const screenY = ((event.clientX - canvasRect.left) / height) * -2 + 1;

  return new THREE.Vector3(screenX, screenY, screenZ).unproject(camera);
}
