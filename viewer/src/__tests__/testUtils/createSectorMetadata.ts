/*!
 * Copyright 2020 Cognite AS
 */

import { SectorMetadata } from '../../dataModels/cad/internal/sector/types';
import { Box3 } from '../../utilities/Box3';
import { vec3 } from 'gl-matrix';

export type SectorTree = [number, SectorTree[], Box3?];

const unitBox = new Box3([vec3.zero(vec3.create()), vec3.fromValues(1, 1, 1)]);

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
    indexFile: {
      fileName: `sector_${id}.i3d`,
      peripheralFiles: [],
      estimatedDrawCallCount: 100,
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
  children.forEach(x => {
    x.parent = root;
  });
  return root;
}

export function generateSectorTree(depth: number, childrenPerLevel: number = 4): SectorMetadata {
  const bounds = Box3.fromBounds(0, 0, 0, 1, 1, 1); // Bounds doesnt matter for this test

  const firstChildren = generateSectorTreeChildren(depth - 1, bounds, childrenPerLevel, 1);
  const root: SectorTree = [0, firstChildren.children, bounds];

  return createSectorMetadata(root, depth);
}

function generateSectorTreeChildren(
  depth: number,
  bounds: Box3,
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
