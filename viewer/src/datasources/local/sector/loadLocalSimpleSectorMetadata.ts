/*!
 * Copyright 2019 Cognite AS
 */

import { RevealSector3D, BoundingBox3D, Versioned3DFile } from '@cognite/sdk';
import { vec3 } from 'gl-matrix';

export interface LocalSimpleSectorMetadataResponse {
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

export async function loadLocalSimpleSectorMetadata(
  sectorsMetadataUrl: string
): Promise<Map<number, LocalSimpleSectorMetadataResponse>> {
  const response = await fetch(sectorsMetadataUrl);
  if (!response.ok) {
    throw new Error(`Could not fetch ${sectorsMetadataUrl}, got ${response.status}`);
  }

  const content = await response.text();
  const sectors: Map<number, LocalSimpleSectorMetadataResponse> = content
    .split('\n')
    .filter(x => x.trim() !== '')
    .reduce((map, chunk) => {
      const sector: LocalSimpleSectorMetadataResponse = JSON.parse(chunk);
      map.set(sector.sector_id, sector);
      return map;
    }, new Map<number, LocalSimpleSectorMetadataResponse>());
  return sectors;
}

function transformBbox(sector: LocalSimpleSectorMetadataResponse): BoundingBox3D {
  const rMin = sector.bbox_min;
  const rMax = sector.bbox_max;
  return { min: [rMin[0], rMin[1], rMin[2]], max: [rMax[0], rMax[1], rMax[2]] };
}
