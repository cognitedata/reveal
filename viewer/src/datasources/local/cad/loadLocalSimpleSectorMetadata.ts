/*!
 * Copyright 2020 Cognite AS
 */

export interface LocalSimpleCadMetadataResponse {
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

export async function loadLocalSimpleCadMetadata(
  sectorsMetadataUrl: string
): Promise<Map<number, LocalSimpleCadMetadataResponse>> {
  const response = await fetch(sectorsMetadataUrl);
  if (!response.ok) {
    throw new Error(`Could not fetch ${sectorsMetadataUrl}, got ${response.status}`);
  }

  const content = await response.text();
  const sectors: Map<number, LocalSimpleCadMetadataResponse> = content
    .split('\n')
    .filter(x => x.trim() !== '')
    .reduce((map, chunk) => {
      const sector: LocalSimpleCadMetadataResponse = JSON.parse(chunk);
      map.set(sector.sector_id, sector);
      return map;
    }, new Map<number, LocalSimpleCadMetadataResponse>());
  return sectors;
}
