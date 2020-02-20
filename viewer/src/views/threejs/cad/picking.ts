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

export interface IntersectCadNodesInput {
  // event: MouseEvent;
  coords: {
    x: number;
    y: number;
  };
  // scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
}

export interface IntersectCadNodesResult {
  distance: number;
  point: THREE.Vector3;
  treeIndex: number;
  // face
  // faceIndex
  // object
}

const clearColor = new THREE.Color('black');
const clearAlpha = 0.0;

export function intersectCadNodes(cadNodes: CadNode[], input: IntersectCadNodesInput): IntersectCadNodesResult[] {
  const results: IntersectCadNodesResult[] = [];
  const { camera, coords, renderer } = input;
  for (const cadNode of cadNodes) {
    const pickingScene = new THREE.Scene();
    // TODO consider case where parent does not exist
    // TODO add warning if parent has transforms
    const oldParent = cadNode.parent!;
    pickingScene.add(cadNode);
    const pickInput = {
      // event,
      coords,
      camera,
      renderer,
      scene: pickingScene,
      cadNode
    };
    const result = pickCadNode(pickInput);
    oldParent.add(cadNode);
    if (result) {
      results.push(result);
    }
  }
  return results;
}

const distanceVector = new THREE.Vector3();

export function pickCadNode(input: TreeIndexPickingInput): TreeIndexPickingResult | undefined {
  const { camera } = input;
  const treeIndex = pickTreeIndex(input);
  if (treeIndex === undefined) {
    return;
  }
  const depth = pickDepth(input);
  const point = getPosition(input, depth);
  // const distance = distanceVector.subVectors(camera.position, point).length();
  const distance = (() => {
    const n = camera.near;
    const f = camera.far;
    const z = depth;
    return ((f - n) * (2.0 * n)) / (f + n - z * (f - n));
  })();
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
  const depth =
    pixelBuffer[0] * (255 / 256 / (256 * 256 * 256)) +
    pixelBuffer[1] * (255 / 256 / (256 * 256)) +
    pixelBuffer[2] * (255 / 256 / 256);
  // const depth = pixelBuffer[0] / 255 + pixelBuffer[1] / (255 * 255) + pixelBuffer[2] / (255 * 255 * 255);
  console.log('RAW DEPTH', depth);
  return depth;
}

export function getPosition(input: TreeIndexPickingInput, depth: number): THREE.Vector3 {
  const { camera, coords } = input;
  // const canvasRect = renderer.domElement.getBoundingClientRect();
  const screenZ = 2 * depth - 1;
  // const { width, height } = renderer.getSize(new THREE.Vector2());
  // const screenX = ((event.clientX - canvasRect.left) / width) * 2 - 1;
  // const screenY = ((event.clientX - canvasRect.left) / height) * -2 + 1;

  return new THREE.Vector3(coords.x, coords.y, screenZ).unproject(camera);
}
