/*!
 * Copyright 2020 Cognite AS
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
    const facesFile =
      simpleSector && simpleSector.sector_contents
        ? {
            quadSize: simpleSector.sector_contents.grid_increment,
            // Unknowns
            coverageFactors: {
              xy: 0.5,
              xz: 0.5,
              yz: 0.5
            },
            filename: `sector_${x.id}.f3d`,
            downloadSize: -1
          }
        : undefined;
    const indexFile = {
      fileName: `sector_${x.id}.i3d`,
      peripheralFiles: [],
      estimatedDrawCallCount: 10,
      downloadSize: -1
    };

    const bbox = x.boundingBox;
    const boundsMin = vec3.fromValues(bbox.min[0], bbox.min[1], bbox.min[2]);
    const boundsMax = vec3.fromValues(bbox.max[0], bbox.max[1], bbox.max[2]);

    const bounds = new Box3([boundsMin, boundsMax]);
    const id: number = x.id;
    const metadata: SectorMetadata = {
      id,
      depth: x.depth,
      path: x.path,
      bounds,
      parent: undefined,
      children: [],
      facesFile,
      indexFile
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
    version: 8,
    maxTreeIndex: -1,
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
