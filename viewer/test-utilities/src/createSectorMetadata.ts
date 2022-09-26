/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { SectorMetadata, V9SectorMetadata } from '../../packages/cad-parsers/src/metadata/types';

export type SectorTree = [id: number, subtree: SectorTree[], bounds?: THREE.Box3];

const unitBox = new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 1));

export function createV9SectorMetadata(tree: SectorTree, depth: number = 0, path: string = '0/'): V9SectorMetadata {
  const id = tree[0];
  const childIds = tree[1];
  const subtreeBoundingBox = tree[2] || unitBox;
  const children = childIds.map((x, i) => {
    return createV9SectorMetadata(x, depth + 1, `${path}${i}/`);
  });

  const root: SectorMetadata = {
    id,
    path,
    depth,
    subtreeBoundingBox,
    estimatedDrawCallCount: 100,
    estimatedRenderCost: 1000,
    downloadSize: 1024 * 1024,
    maxDiagonalLength: 1.0,
    minDiagonalLength: 0.5,
    sectorFileName: `${id}.glb`,
    geometryBoundingBox: tree[2] || unitBox,
    children
  };
  return root;
}

export function generateV9SectorTree(depth: number, childrenPerLevel: number = 4): V9SectorMetadata {
  const bounds = unitBox.clone(); // Bounds doesnt matter for this test

  const firstChildren = generateSectorTreeChildren(depth - 1, bounds, childrenPerLevel, 1);
  const root: SectorTree = [0, firstChildren.children, bounds];

  return createV9SectorMetadata(root, depth);
}

function generateSectorTreeChildren(
  depth: number,
  bounds: THREE.Box3,
  childCount: number,
  firstId: number
): { children: SectorTree[]; nextId: number } {
  if (depth === 0) {
    return { children: [], nextId: firstId };
  }

  let id = firstId;
  const result = [...Array(childCount)].map(() => {
    const { children, nextId } = generateSectorTreeChildren(depth - 1, bounds, childCount, id + 1);
    const item: SectorTree = [id, children, bounds];
    id = nextId;
    return item;
  });

  return { children: result, nextId: id };
}
