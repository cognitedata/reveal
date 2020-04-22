/*!
 * Copyright 2020 Cognite AS
 */

import { generateSectorTree } from '../testUtils/createSectorMetadata';
import { TakenSectorTree } from '../../culling/TakenSectorTree';
import { SectorMetadata } from '../../models/cad/types';
import { SectorScene } from '../../models/cad/SectorScene';
import { traverseDepthFirst } from '../../utils/traversal';
import { expectContainsSectorsWithLevelOfDetail } from '../expects';
import { PrioritizedWantedSector } from '../../culling/types';
import { LevelOfDetail } from '../../data/model/LevelOfDetail';

describe('TakenSectorTree', () => {
  const scene: SectorScene = {} as any;

  test('default tree contains root as simple', () => {
    const root = generateSectorTree(2);
    const tree = new TakenSectorTree(root);
    const wanted = tree.toWantedSectors(scene);
    expectContainsSectorsWithLevelOfDetail(wanted, [0], []);
  });

  test('three levels, partial detailed at level 2', () => {
    // Arrange
    const root = generateSectorTree(3, 2);
    const tree = new TakenSectorTree(root);

    // Act
    tree.markSectorDetailed(0, 1);
    tree.markSectorDetailed(findId(root, '0/0/'), 1);

    // Assert
    const expectedDetailed = ['0/', '0/0/'];
    const expectedSimple = ['0/1/', '0/0/0/', '0/0/1/'];
    const wanted = tree.toWantedSectors(scene);
    expectHasSectors(wanted, LevelOfDetail.Detailed, expectedDetailed);
    expectHasSectors(wanted, LevelOfDetail.Simple, expectedSimple);
  });

  test('add detailed sectors out of order', () => {
    // Arrange
    const root = generateSectorTree(5, 2);
    const tree = new TakenSectorTree(root);

    // Act
    tree.markSectorDetailed(findId(root, '0/0/0/'), 1);
    tree.markSectorDetailed(findId(root, '0/1/0/'), 1);

    // Assert
    const expectedDetailed = ['0/', '0/0/', '0/0/0/', '0/1/', '0/1/0/'];
    const expectedSimple = ['0/0/0/0/', '0/0/0/1/', '0/1/0/0/', '0/1/0/1/', '0/1/1/'];
    const wanted = tree.toWantedSectors(scene);
    expectHasSectors(wanted, LevelOfDetail.Detailed, expectedDetailed);
    expectHasSectors(wanted, LevelOfDetail.Simple, expectedSimple);
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
