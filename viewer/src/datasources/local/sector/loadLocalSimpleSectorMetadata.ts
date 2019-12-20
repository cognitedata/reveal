/*!
 * Copyright 2019 Cognite AS
 */

import { RevealSector3D, BoundingBox3D, Versioned3DFile } from '@cognite/sdk';
import { vec3 } from 'gl-matrix';

// TODO move definition out of this file and into sector metadata or similar
export interface SimpleSector3D {
  readonly id: number;
  readonly parentId?: number;
  readonly boundingBox: BoundingBox3D;
  readonly sectorContents?: {
    readonly gridSize: vec3;
    readonly gridOrigin: vec3;
    readonly gridIncrement: number;
    readonly nodeCount: number;
  };
}

interface LocalSimpleSectorMetadataResponse {
  readonly sector_id: number;
  readonly parent_sector_id: number;
  readonly parent_id?: number;
  readonly bbox_min: number[];
  readonly bbox_max: number[];
  readonly sector_contents?: {
    readonly grid_size: number[];
    readonly grid_origin: number[];
    readonly grid_increment: number;
    readonly node_count: number;
  };
}

export async function loadLocalSimpleSectorMetadata(sectorsMetadataUrl: string): Promise<SimpleSector3D[]> {
  const response = await fetch(sectorsMetadataUrl);
  if (!response.ok) {
    throw new Error(`Could not fetch ${sectorsMetadataUrl}, got ${response.status}`);
  }

  const content = await response.text();
  const sectors: LocalSimpleSectorMetadataResponse[] = content
    .split('\n')
    .filter(x => x.trim() !== '')
    .map(chunk => {
      const sector: LocalSimpleSectorMetadataResponse = JSON.parse(chunk);
      return sector;
    });

  const sdkSectors = sectors.map(
    (s): SimpleSector3D => {
      const sectorContents = (() => {
        if (!s.sector_contents) {
          return undefined;
        }
        const size = s.sector_contents.grid_size;
        const origin = s.sector_contents.grid_size;
        return {
          gridSize: vec3.fromValues(size[0], size[1], size[2]),
          gridOrigin: vec3.fromValues(origin[0], origin[1], origin[2]),
          gridIncrement: s.sector_contents.grid_increment,
          nodeCount: s.sector_contents.node_count
        };
      })();

      return {
        id: s.sector_id,
        parentId: s.parent_id,
        boundingBox: transformBbox(s),
        sectorContents
      };
    }
  );
  return sdkSectors;
}

function transformBbox(sector: LocalSimpleSectorMetadataResponse): BoundingBox3D {
  const rMin = sector.bbox_min;
  const rMax = sector.bbox_max;
  return { min: [rMin[0], rMin[1], rMin[2]], max: [rMax[0], rMax[1], rMax[2]] };
}
