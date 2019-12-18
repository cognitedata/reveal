/*!
 * Copyright 2019 Cognite AS
 */

import { RevealSector3D } from '@cognite/sdk';
import { buildSectorMetadata } from '../../../../datasources/cognitesdk/sector/buildSectorMetadata';

describe('buildSectorMetadata', () => {
  test('no sectors, throws', () => {
    expect(() => buildSectorMetadata([])).toThrowError();
  });

  test('sectors is missing root, throws', () => {
    const sector = createSector(0, 5, '0/1/');
    expect(() => buildSectorMetadata([sector])).toThrowError();
  });

  test('single root sector, works', async () => {
    const sector = createSector(0, -1, '0/');
    const root = buildSectorMetadata([sector]);
    expect(root).not.toBeFalsy();
  });

  test('valid sector tree', async () => {
    const sectors = [
      createSector(0, -1, '0/'),
      createSector(1, 0, '0/0/'),
      createSector(2, 0, '0/1/'),
      createSector(3, 1, '0/0/1/')
    ];
    const scene = buildSectorMetadata(sectors);
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
