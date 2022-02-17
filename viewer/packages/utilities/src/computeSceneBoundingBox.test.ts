/*!
 * Copyright 2022 Cognite AS
 */

import { SectorMetadata } from '@reveal/cad-parsers/src/metadata/types';
import { createRandomBox } from '../../../test-utilities/src/createBoxes';
import { createV9SectorMetadata, SectorTree } from '../../../test-utilities';

import * as SeededRandom from 'random-seed';
import { computeSceneBoundingBox } from './computeSceneBoundingBox';

import * as THREE from 'three';

describe('computeSceneBoundingBox', () => {
  let sectorMetadata: SectorMetadata[];

  beforeEach(() => {
    const rand = SeededRandom.create('some_seed');

    const numSectors = 30;
    sectorMetadata = new Array<SectorMetadata>(numSectors);

    for (let i = 0; i < numSectors; i++) {
      const tree: SectorTree = [i, [], createRandomBox(20, 100, rand)];
      sectorMetadata[i] = createV9SectorMetadata(tree);
    }
  });

  test('returns box that contains all sectors in scene', () => {
    const fullBoundingBox = computeSceneBoundingBox(sectorMetadata);

    expect(sectorMetadata.length).toBeGreaterThan(0);

    for (const sector of sectorMetadata) {
      const convertedBox = sector.bounds;
      expect(fullBoundingBox.containsBox(convertedBox)).toBeTrue();
    }
  });

  test('returned box does not contain a point outside of model', () => {
    const fullBoundingBox = computeSceneBoundingBox(sectorMetadata);

    let maxX = -Infinity;

    for (const sector of sectorMetadata) {
      maxX = Math.max(maxX, sector.bounds.max.x);
    }

    const boxOutside = new THREE.Box3(new THREE.Vector3(maxX, 0, 0), new THREE.Vector3(maxX + 1, 1, 1));

    expect(fullBoundingBox.containsBox(boxOutside)).toBeFalse();
  });
});
