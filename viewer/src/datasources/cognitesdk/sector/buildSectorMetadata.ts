/*!
 * Copyright 2019 Cognite AS
 */

import { RevealSector3D } from '@cognite/sdk';
import { vec3, mat4 } from 'gl-matrix';
import { SectorMetadata, SectorScene } from '../../../models/sector/types';
import { Box3 } from '../../../utils/Box3';

export function buildSectorMetadata(sectors: RevealSector3D[]): SectorScene {
  const sectorsMetadata = sectors.reduce((map, x) => {
    const bbox = x.boundingBox;
    const boundsMin = vec3.fromValues(bbox.min[0], bbox.min[1], bbox.min[2]);
    const boundsMax = vec3.fromValues(bbox.max[0], bbox.max[1], bbox.max[2]);

    const bounds = new Box3([boundsMin, boundsMax]);
    const id: number = x.id;
    const metadata: SectorMetadata = {
      id,
      path: x.path,
      bounds,
      parent: undefined,
      children: []
    };

    map.set(x.path, metadata);
    return map;
  }, new Map<string, SectorMetadata>());

  const sectorMap = new Map<number, SectorMetadata>();

  // Initialize relationships
  for (const [path, data] of sectorsMetadata) {
    sectorMap.set(data.id, data);

    const parentPath = parentOf(path);
    if (parentPath === '') {
      continue;
    }
    const parent = sectorsMetadata.get(parentPath);
    parent!.children.push(data);
    data.parent = parent;
  }

  const root = sectorsMetadata.get('0/');
  if (!root) {
    throw new Error('No root sector');
  }
  return {
    root,
    sectors: sectorMap
  };
}

function parentOf(path: string): string {
  if (path.length <= 2) {
    return '';
  }
  return path.slice(0, path.length - 2);
}
