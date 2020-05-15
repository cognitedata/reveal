/*!
 * Copyright 2020 Cognite AS
 */

import { TakenSectorTree } from '@/dataModels/cad/internal/sector/culling/TakenSectorTree';
import { SectorMetadata } from '@/dataModels/cad/internal/sector/types';
import { PrioritizedWantedSector, DetermineSectorCostDelegate } from '@/dataModels/cad/internal/sector/culling/types';
import { LevelOfDetail } from '@/dataModels/cad/internal/sector/LevelOfDetail';
import { CadModelMetadata } from '@/dataModels/cad/internal';
import { traverseDepthFirst } from '@/utilities/traversal';

import { expectContainsSectorsWithLevelOfDetail } from '../expects';
import { generateSectorTree } from '../testUtils/createSectorMetadata';

type PropType<TObj, TProp extends keyof TObj> = TObj[TProp];
type Mutable<T> = { -readonly [P in keyof T]: T[P] };

describe('TakenSectorTree', () => {
  const model: CadModelMetadata = {} as any;
  const determineSectorCost: DetermineSectorCostDelegate = () => 1; // Flat cost

  test('default tree contains root as simple', () => {
    const root = generateSectorTree(2);
    const tree = new TakenSectorTree(root, determineSectorCost);
    const wanted = tree.toWantedSectors(model);
    expectContainsSectorsWithLevelOfDetail(wanted, [0], []);
  });

  test('three levels, partial detailed at level 2', () => {
    // Arrange
    const root = generateSectorTree(3, 2);
    const tree = new TakenSectorTree(root, determineSectorCost);

    // Act
    tree.markSectorDetailed(0, 1);
    tree.markSectorDetailed(findId(root, '0/0/'), 1);

    // Assert
    const expectedDetailed = ['0/', '0/0/'];
    const expectedSimple = ['0/1/', '0/0/0/', '0/0/1/'];
    const wanted = tree.toWantedSectors(model);
    expectHasSectors(wanted, LevelOfDetail.Detailed, expectedDetailed);
    expectHasSectors(wanted, LevelOfDetail.Simple, expectedSimple);
  });

  test('add detailed sectors out of order', () => {
    // Arrange
    const root = generateSectorTree(5, 2);
    const tree = new TakenSectorTree(root, determineSectorCost);

    // Act
    tree.markSectorDetailed(findId(root, '0/0/0/'), 1);
    tree.markSectorDetailed(findId(root, '0/1/0/'), 1);

    // Assert
    const expectedDetailed = ['0/', '0/0/', '0/0/0/', '0/1/', '0/1/0/'];
    const expectedSimple = ['0/0/0/0/', '0/0/0/1/', '0/1/0/0/', '0/1/0/1/', '0/1/1/'];
    const wanted = tree.toWantedSectors(model);
    expectHasSectors(wanted, LevelOfDetail.Detailed, expectedDetailed);
    expectHasSectors(wanted, LevelOfDetail.Simple, expectedSimple);
  });

  test('Simple data is not added when sector has no f3d file', () => {
    // Arrange
    const root = generateSectorTree(3, 2);
    // Apply trickery to ditch readonly
    const mutableFacesFile: Mutable<PropType<SectorMetadata, 'facesFile'>> = root.children[0].facesFile;
    mutableFacesFile.fileName = null;
    const tree = new TakenSectorTree(root, determineSectorCost);

    // Act
    tree.markSectorDetailed(0, 1);

    // Assert
    const wanted = tree.toWantedSectors(model);
    expectHasSectors(wanted, LevelOfDetail.Detailed, ['0/']);
    expectHasSectors(wanted, LevelOfDetail.Simple, ['0/1/']);
  });
});

function findId(root: SectorMetadata, path: string): number {
  let id = -1;
  traverseDepthFirst(root, x => {
    if (x.path === path) {
      id = x.id;
    }
    return id === -1;
  });
  return id;
}

function expectHasSectors(sectors: PrioritizedWantedSector[], lod: LevelOfDetail, expectedPaths: string[]) {
  const ids = sectors
    .filter(x => x.levelOfDetail === lod)
    .map(x => {
      return x.metadata.path;
    })
    .sort();
  expectedPaths.sort();
  ids.sort();
  expect(ids).toEqual(expectedPaths);
}
