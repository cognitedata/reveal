/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { expectContainsSectorsWithLevelOfDetail, generateV8SectorTree, Mutable } from '../../../../../test-utilities';
import { PropType } from '../../utilities/reflection';
import { SectorMetadata, CadModelMetadata, LevelOfDetail, V8SectorMetadata } from '@reveal/cad-parsers';
import { traverseDepthFirst } from '@reveal/utilities';
import { DetermineSectorCostDelegate, PrioritizedWantedSector } from './types';
import { TakenV8SectorTree } from './TakenV8SectorTree';

type FacesFile = PropType<V8SectorMetadata, 'facesFile'>;

describe('TakenV8SectorTree', () => {
  const model: CadModelMetadata = {} as any;
  const determineSectorCost: DetermineSectorCostDelegate = () => ({ downloadSize: 1, drawCalls: 1, renderCost: 1 }); // Flat cost

  test('default tree contains root as simple', () => {
    const root = generateV8SectorTree(2);
    const tree = new TakenV8SectorTree(root, determineSectorCost);
    const wanted = tree.toWantedSectors(model.modelIdentifier, model.modelBaseUrl, null);
    expectContainsSectorsWithLevelOfDetail(wanted, [0], []);
  });

  test('three levels, partial detailed at level 2', () => {
    // Arrange
    const root = generateV8SectorTree(3, 2);
    const tree = new TakenV8SectorTree(root, determineSectorCost);

    // Act
    tree.markSectorDetailed(0, 1);
    tree.markSectorDetailed(findId(root, '0/0/'), 1);

    // Assert
    const expectedDetailed = ['0/', '0/0/'];
    const expectedSimple = ['0/1/', '0/0/0/', '0/0/1/'];
    const wanted = tree.toWantedSectors(model.modelIdentifier, model.modelBaseUrl, null);
    expectHasSectors(wanted, LevelOfDetail.Detailed, expectedDetailed);
    expectHasSectors(wanted, LevelOfDetail.Simple, expectedSimple);
  });

  test('add detailed sectors out of order', () => {
    // Arrange
    const root = generateV8SectorTree(5, 2);
    const tree = new TakenV8SectorTree(root, determineSectorCost);

    // Act
    tree.markSectorDetailed(findId(root, '0/0/0/'), 1);
    tree.markSectorDetailed(findId(root, '0/1/0/'), 1);

    // Assert
    const expectedDetailed = ['0/', '0/0/', '0/0/0/', '0/1/', '0/1/0/'];
    const expectedSimple = ['0/0/0/0/', '0/0/0/1/', '0/1/0/0/', '0/1/0/1/', '0/1/1/'];
    const wanted = tree.toWantedSectors(model.modelIdentifier, model.modelBaseUrl, null);
    expectHasSectors(wanted, LevelOfDetail.Detailed, expectedDetailed);
    expectHasSectors(wanted, LevelOfDetail.Simple, expectedSimple);
  });

  test('Simple data is not added when sector has no f3d file', () => {
    // Arrange
    const root = generateV8SectorTree(3, 2);

    const mutableFacesFile: Mutable<FacesFile> = (root.children[0] as V8SectorMetadata).facesFile;
    mutableFacesFile.fileName = null;
    const tree = new TakenV8SectorTree(root, determineSectorCost);

    // Act
    tree.markSectorDetailed(0, 1);

    // Assert
    const wanted = tree.toWantedSectors(model.modelIdentifier, model.modelBaseUrl, null);
    expectHasSectors(wanted, LevelOfDetail.Detailed, ['0/']);
    expectHasSectors(wanted, LevelOfDetail.Simple, ['0/1/']);
  });

  test('construct with model without F3D for root', () => {
    // Arrange
    const root = generateV8SectorTree(3, 2);
    const mutableFacesFile: Mutable<FacesFile> = root.facesFile;
    mutableFacesFile.fileName = null;

    // Act
    const tree = new TakenV8SectorTree(root, determineSectorCost);

    // Assert
    const wanted = tree.toWantedSectors(model.modelIdentifier, model.modelBaseUrl, null);
    expect(wanted.find(x => x.metadata.path === '0/')?.levelOfDetail).toBe(LevelOfDetail.Discarded);
  });

  test('toWantedSectors includes provided geometryFilterBox', () => {
    const box = new THREE.Box3();
    const root = generateV8SectorTree(2);
    const tree = new TakenV8SectorTree(root, determineSectorCost);
    const wanted = tree.toWantedSectors(model.modelIdentifier, model.modelBaseUrl, box);

    wanted.forEach(x => expect(x.geometryClipBox).toBe(box));
  });

  test('toWantedSectors only returns actual sectors when sectorIds are "sparse"', () => {
    const root = generateV8SectorTree(3, 2) as SectorMetadata;
    traverseDepthFirst(root, x => {
      const mutableSector: Mutable<SectorMetadata> = x;
      mutableSector.id = mutableSector.id * mutableSector.id;
      return true;
    });

    const tree = new TakenV8SectorTree(root as V8SectorMetadata, determineSectorCost);
    const wanted = tree.toWantedSectors(model.modelIdentifier, model.modelBaseUrl, null);

    expect(wanted.length).toBe(7);
  });

  test('construct sparse tree, doesnt throw', () => {
    const root = generateV8SectorTree(3, 2) as SectorMetadata;
    traverseDepthFirst(root, x => {
      const mutable: Mutable<SectorMetadata> = x;
      mutable.id = mutable.id * mutable.id;
      return true;
    });
    expect(() => new TakenV8SectorTree(root as V8SectorMetadata, determineSectorCost)).not.toThrow();
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
