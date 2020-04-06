/*!
 * Copyright 2020 Cognite AS
 */

import { SectorMetadata } from '../../models/cad/types';
import { Box3 } from '../../utils/Box3';
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
    path: '',
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
