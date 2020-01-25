/*!
 * Copyright 2020 Cognite AS
 */

import { RevealSector3D } from '@cognite/sdk';
import { buildSectorMetadata } from '../../../../datasources/cognitesdk/cad/buildSectorMetadata';
import { LocalSimpleCadMetadataResponse } from '../../../../datasources/local/cad/loadLocalSimpleSectorMetadata';

describe('buildSectorMetadata', () => {
  test('no sectors, throws', () => {
    expect(() => buildSectorMetadata([], new Map())).toThrowError();
  });

  test('sectors is missing root, throws', () => {
    const sector = createSector(0, 5, '0/1/');
    const simpleSector = createSimpleSector(0, 5);
    expect(() => buildSectorMetadata([sector], new Map([[0, simpleSector]]))).toThrowError();
  });

  test('single root sector, works', async () => {
    const sector = createSector(0, -1, '0/');
    const simpleSector = createSimpleSector(0, -1);
    const root = buildSectorMetadata([sector], new Map([[0, simpleSector]]));
    expect(root).not.toBeFalsy();
  });

  test('valid sector tree', async () => {
    const sectors = [
      createSector(0, -1, '0/'),
      createSector(1, 0, '0/0/'),
      createSector(2, 0, '0/1/'),
      createSector(3, 1, '0/0/1/')
    ];
    const simpleSectors: [number, LocalSimpleCadMetadataResponse][] = [
      [0, createSimpleSector(0, -1)],
      [1, createSimpleSector(1, 0)],
      [2, createSimpleSector(2, 0)],
      [3, createSimpleSector(3, 1)]
    ];
    const scene = buildSectorMetadata(sectors, new Map(simpleSectors));
    const root = scene.root;

    expect(root).toBeTruthy();
    expect(root!.children.map(x => x.id)).toContainAllValues([2, 1]);
    expect(root!.children.find(x => x.id === 1)!.children.map(x => x.id)).toContainAllValues([3]);
  });
});

function createSector(id: number, parentId: number, path: string): RevealSector3D {
  const sector: RevealSector3D = {
    id,
    path,
    parentId,
    depth: 0,
    boundingBox: { min: [0, 0, 0], max: [1, 1, 1] },
    threedFiles: []
  };
  return sector;
}

function createSimpleSector(id: number, parentId: number): LocalSimpleCadMetadataResponse {
  return {
    sector_id: id,
    parent_sector_id: parentId,
    bbox_min: [0, 0, 0],
    bbox_max: [0, 0, 0]
  };
}
