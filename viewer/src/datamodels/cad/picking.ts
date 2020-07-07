/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';

import { CadNode } from './CadNode';
import { pickPixelColor, PickingInput } from '@/utilities/pickPixelColor';
import { RenderMode } from './rendering/RenderMode';

export interface TreeIndexPickingInput extends PickingInput {
  cadNode: CadNode;
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
  cadNode: CadNode;
  object: THREE.Object3D; // always CadNode
}

const clearColor = new THREE.Color('black');
const clearAlpha = 0.0;

export function intersectCadNodes(cadNodes: CadNode[], input: IntersectCadNodesInput): IntersectCadNodesResult[] {
  const results: IntersectCadNodesResult[] = [];
  for (const cadNode of cadNodes) {
    const result = intersectCadNode(cadNode, input);
    if (result) {
      results.push(result);
    }
  }
  return results.sort((l, r) => l.distance - r.distance);
}

export function intersectCadNode(cadNode: CadNode, input: IntersectCadNodesInput): IntersectCadNodesResult | undefined {
  const { camera, coords, renderer } = input;
  const pickingScene = new THREE.Scene();
  // TODO consider case where parent does not exist
  // TODO add warning if parent has transforms
  const oldParent = cadNode.parent;
  pickingScene.add(cadNode);
  try {
    const pickInput = {
      coords,
      camera,
      renderer,
      scene: pickingScene,
      cadNode
    };
    const treeIndex = pickTreeIndex(pickInput);
    if (treeIndex === undefined) {
      return undefined;
    }
    const depth = pickDepth(pickInput);

    const viewZ = perspectiveDepthToViewZ(depth, camera.near, camera.far);
    const point = getPosition(pickInput, viewZ);
    const distance = new THREE.Vector3().subVectors(point, camera.position).length();
    return {
      distance,
      point,
      treeIndex,
      object: cadNode,
      cadNode
    };
  } finally {
    // Re-add cadNode to previous parent
    if (oldParent) {
      oldParent.add(cadNode);
    }
  }
}

function pickTreeIndex(input: TreeIndexPickingInput): number | undefined {
  const { cadNode } = input;
  const previousRenderMode = cadNode.renderMode;
  cadNode.renderMode = RenderMode.TreeIndex;
  let pixelBuffer: Uint8Array;
  try {
    pixelBuffer = pickPixelColor(input, clearColor, clearAlpha);
  } finally {
    cadNode.renderMode = previousRenderMode;
  }

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

function pickDepth(input: TreeIndexPickingInput): number {
  const { cadNode } = input;
  const previousRenderMode = cadNode.renderMode;
  cadNode.renderMode = RenderMode.Depth;
  const pixelBuffer = pickPixelColor(input, clearColor, clearAlpha);
  cadNode.renderMode = previousRenderMode;

  const depth = unpackRGBAToDepth(pixelBuffer);
  return depth;
}

const projInv = new THREE.Matrix4();

function getPosition(input: TreeIndexPickingInput, viewZ: number): THREE.Vector3 {
  const { camera, coords } = input;
  const position = new THREE.Vector3();
  projInv.getInverse(camera.projectionMatrix);
  position.set(coords.x, coords.y, 0.5).applyMatrix4(projInv);

  position.multiplyScalar(viewZ / position.z);
  position.applyMatrix4(camera.matrixWorld);
  return position;
}
