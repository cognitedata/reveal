/*!
 * Copyright 2019 Cognite AS
 */

import { RevealSector3D } from '@cognite/sdk';
import { vec3 } from 'gl-matrix';
import { SectorMetadata, SectorScene } from '../../../models/cad/types';
import { Box3 } from '../../../utils/Box3';
import { LocalSimpleCadMetadataResponse } from '../../local/cad/loadLocalSimpleSectorMetadata';

export function buildSectorMetadata(
  sectors: RevealSector3D[],
  simpleSectors: Map<number, LocalSimpleCadMetadataResponse>
): SectorScene {
  const sectorsMetadata = sectors.reduce((map, x) => {
    const simpleSector = simpleSectors.get(x.id);
    if (!simpleSector) {
      throw new Error(`Could not find corresponding simple sector for sector with ID ${x.id}`);
    }
    const simple = (() => {
      if (!simpleSector.sector_contents) {
        return undefined;
      }
      const size = simpleSector.sector_contents.grid_size;
      const origin = simpleSector.sector_contents.grid_size;
      return {
        gridSize: vec3.fromValues(size[0], size[1], size[2]),
        gridOrigin: vec3.fromValues(origin[0], origin[1], origin[2]),
        gridIncrement: simpleSector.sector_contents.grid_increment,
        nodeCount: simpleSector.sector_contents.node_count
      };
    })();

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
      children: [],
      simple
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
