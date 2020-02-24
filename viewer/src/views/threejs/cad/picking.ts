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
  coords: {
    x: number;
    y: number;
  };
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
}

export interface IntersectCadNodesResult {
  distance: number;
  point: THREE.Vector3;
  treeIndex: number;
}

const clearColor = new THREE.Color('black');
const clearAlpha = 0.0;

export function intersectCadNodes(cadNodes: CadNode[], input: IntersectCadNodesInput): IntersectCadNodesResult[] {
  const results: IntersectCadNodesResult[] = [];
  for (const cadNode of cadNodes) {
    const result = pickCadNode(cadNode, input);
    if (result) {
      results.push(result);
    }
  }
  return results;
}

export function pickCadNode(cadNode: CadNode, input: IntersectCadNodesInput): TreeIndexPickingResult | undefined {
  const { camera, coords, renderer } = input;
  const pickingScene = new THREE.Scene();
  // TODO consider case where parent does not exist
  // TODO add warning if parent has transforms
  const oldParent = cadNode.parent!;
  pickingScene.add(cadNode);
  const pickInput = {
    coords,
    camera,
    renderer,
    scene: pickingScene,
    cadNode
  };
  const treeIndex = pickTreeIndex(pickInput);
  if (treeIndex === undefined) {
    oldParent.add(cadNode);
    return;
  }
  const depth = pickDepth(pickInput);

  const viewZ = perspectiveDepthToViewZ(depth, camera.near, camera.far);
  const point = getPosition(pickInput, viewZ);
  const distance = new THREE.Vector3().subVectors(point, camera.position).length();

  oldParent.add(cadNode);
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

const rgbaVector = new THREE.Vector4();
const unpackDownscale = 255 / 256;
const unpackFactors = new THREE.Vector4(
  unpackDownscale / (256 * 256 * 256),
  unpackDownscale / (256 * 256),
  unpackDownscale / 256,
  unpackDownscale
);

function unpackRGBAToDepth(rgbaBuffer: Uint8Array) {
  return rgbaVector
    .fromArray(rgbaBuffer)
    .multiplyScalar(1 / 255)
    .dot(unpackFactors);
}

function perspectiveDepthToViewZ(invClipZ: number, near: number, far: number) {
  return (near * far) / ((far - near) * invClipZ - far);
}

export function pickDepth(input: TreeIndexPickingInput): number {
  const { cadNode } = input;
  const previousRenderMode = cadNode.renderMode;
  cadNode.renderMode = RenderMode.Depth;
  const pixelBuffer = pickPixelColor(input, clearColor, clearAlpha);
  cadNode.renderMode = previousRenderMode;

  const depth = unpackRGBAToDepth(pixelBuffer);
  return depth;
}

const projInv = new THREE.Matrix4();

export function getPosition(input: TreeIndexPickingInput, viewZ: number): THREE.Vector3 {
  const { camera, coords } = input;
  const position = new THREE.Vector3();
  projInv.getInverse(camera.projectionMatrix);
  position.set(coords.x, coords.y, 0.5).applyMatrix4(projInv);

  position.multiplyScalar(viewZ / position.z);
  position.applyMatrix4(camera.matrixWorld);
  return position;
}
