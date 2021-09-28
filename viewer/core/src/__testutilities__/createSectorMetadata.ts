/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { SectorMetadata } from '../datamodels/cad';

export type SectorTree = [number, SectorTree[], THREE.Box3?];

const unitBox = new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 1));

export function createSectorMetadata(tree: SectorTree, depth: number = 0, path: string = '0/'): SectorMetadata {
  const id = tree[0];
  const childIds = tree[1];
  const bounds = tree[2] || unitBox;
  const children = childIds.map((x, i) => {
    return createSectorMetadata(x, depth + 1, `${path}${i}/`);
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

export function generateSectorTree(depth: number, childrenPerLevel: number = 4): SectorMetadata {
  const bounds = unitBox.clone(); // Bounds doesnt matter for this test

  const firstChildren = generateSectorTreeChildren(depth - 1, bounds, childrenPerLevel, 1);
  const root: SectorTree = [0, firstChildren.children, bounds];

  return createSectorMetadata(root, depth);
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
