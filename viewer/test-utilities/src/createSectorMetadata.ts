/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { SectorMetadata, V8SectorMetadata, V9SectorMetadata } from '../../packages/cad-parsers/src/metadata/types';

export type SectorTree = [id: number, subtree: SectorTree[], bounds?: THREE.Box3];

const unitBox = new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 1));

export function createV8SectorMetadata(tree: SectorTree, depth: number = 0, path: string = '0/'): V8SectorMetadata {
  const id = tree[0];
  const childIds = tree[1];
  const bounds = tree[2] || unitBox;
  const children = childIds.map((x, i) => {
    return createV8SectorMetadata(x, depth + 1, `${path}${i}/`);
  });

  const root: SectorMetadata = {
    id,
    path,
    depth,
    bounds,
    estimatedDrawCallCount: 100,
    estimatedRenderCost: 1000,
    indexFile: {
      fileName: `sector_${id}.i3d`,
      peripheralFiles: [],
      downloadSize: 1024 * 1024
    },
    facesFile: {
      quadSize: 2.0 / (depth + 1),
      coverageFactors: {
        xy: 0.5,
        yz: 0.5,
        xz: 0.5
      },
      recursiveCoverageFactors: {
        xy: 0.5,
        yz: 0.5,
        xz: 0.5
      },
      fileName: `sector_${id}.f3d`,
      downloadSize: 128 * 1024
    },
    children
  };
  return root;
}

export function generateV8SectorTree(depth: number, childrenPerLevel: number = 4): V8SectorMetadata {
  const bounds = unitBox.clone(); // Bounds doesnt matter for this test

  const firstChildren = generateSectorTreeChildren(depth - 1, bounds, childrenPerLevel, 1);
  const root: SectorTree = [0, firstChildren.children, bounds];

  return createV8SectorMetadata(root, depth);
}

export function createV9SectorMetadata(tree: SectorTree, depth: number = 0, path: string = '0/'): V9SectorMetadata {
  const id = tree[0];
  const childIds = tree[1];
  const bounds = tree[2] || unitBox;
  const children = childIds.map((x, i) => {
    return createV9SectorMetadata(x, depth + 1, `${path}${i}/`);
  });

  const root: SectorMetadata = {
    id,
    path,
    depth,
    bounds,
    estimatedDrawCallCount: 100,
    estimatedRenderCost: 1000,
    downloadSize: 1024 * 1024,
    maxDiagonalLength: 1.0,
    sectorFileName: `${id}.glb`,
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
