/*!
 * Copyright 2020 Cognite AS
 */

import { SectorSceneImpl, SectorMetadata } from '../../../models/cad/types';
import { createSectorMetadata } from '../../testUtils/createSectorMetadata';
import { traverseDepthFirst } from '../../../utils/traversal';
import { vec3 } from 'gl-matrix';
import { Box3 } from '../../../utils/Box3';

describe('SectorSceneImpl', () => {
  const root = createSectorMetadata([
    0,
    [
      [1, [], new Box3([vec3.fromValues(0, 0, 0), vec3.fromValues(0.5, 1, 1)])],
      [2, [], new Box3([vec3.fromValues(0.5, 0, 0), vec3.fromValues(1, 1, 1)])]
    ],
    new Box3([vec3.fromValues(0, 0, 0), vec3.fromValues(1, 1, 1)])
  ]);
  const sectorsById = new Map<number, SectorMetadata>();
  traverseDepthFirst(root, x => {
    sectorsById.set(x.id, x);
    return true;
  });

  test('getSectorsContainingPoint', () => {
    const scene = new SectorSceneImpl(8, 3, root, sectorsById);

    expect(sectorIds(scene.getSectorsContainingPoint(vec3.fromValues(0.2, 0.5, 0.5)))).toEqual([0, 1]);
    expect(sectorIds(scene.getSectorsContainingPoint(vec3.fromValues(0.75, 0.5, 0.5)))).toEqual([0, 2]);
    expect(sectorIds(scene.getSectorsContainingPoint(vec3.fromValues(2, 0.5, 0.5)))).toEqual([]);
  });
});

function sectorIds(sectors: SectorMetadata[]): number[] {
  return sectors.map(x => x.id).sort();
}
