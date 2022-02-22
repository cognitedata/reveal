/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { traverseDepthFirst } from '@reveal/utilities';
import { V9SectorMetadata } from '../types';
import { parseCadMetadataGltf, toThreeBoundingBox } from './CadMetadataParserGltf';
import { CadSceneRootMetadata } from './types';

import { createV9SceneSectorMetadata, createRandomBox } from '../../../../../test-utilities';

import * as SeededRandom from 'random-seed';

describe('CadMetadataParserGltf', () => {
  test('Metadata without sectors, throws', () => {
    const metadata: CadSceneRootMetadata = {
      version: 9,
      maxTreeIndex: 103350,
      unit: 'Meters',
      sectors: []
    };
    expect(() => parseCadMetadataGltf(metadata)).toThrow();
  });

  test('Metadata has no root sector with id 0, throws', () => {
    const metadata: CadSceneRootMetadata = {
      version: 9,
      maxTreeIndex: 103350,
      unit: 'Meters',
      sectors: [createV9SceneSectorMetadata(1)]
    };
    expect(() => parseCadMetadataGltf(metadata)).toThrow();
  });

  test('Metadata with single root, return valid scene', () => {
    // Arrange
    const sectorRoot = createV9SceneSectorMetadata(0);
    const metadata: CadSceneRootMetadata = {
      version: 9,
      maxTreeIndex: 8000,
      unit: 'Meters',
      sectors: [sectorRoot]
    };

    const subtreeBoundingBox = new THREE.Box3(
      new THREE.Vector3(sectorRoot.boundingBox.min.x, sectorRoot.boundingBox.min.y, sectorRoot.boundingBox.min.z),
      new THREE.Vector3(sectorRoot.boundingBox.max.x, sectorRoot.boundingBox.max.y, sectorRoot.boundingBox.max.z)
    );

    const expectedRoot: V9SectorMetadata = {
      id: sectorRoot.id,
      path: sectorRoot.path,
      subtreeBoundingBox,
      geometryBoundingBox: subtreeBoundingBox,
      depth: sectorRoot.depth,
      children: [],
      estimatedDrawCallCount: 10,
      estimatedRenderCost: 10,
      downloadSize: 1000,
      maxDiagonalLength: 10,
      minDiagonalLength: 5,
      sectorFileName: `${sectorRoot.id}.glb`
    };

    // Act
    const scene = parseCadMetadataGltf(metadata);

    // Assert
    expect(scene.version).toBe(9);
    expect(scene.maxTreeIndex).toBe(8000);
    expect(scene.root).toEqual(expectedRoot);
    expect(scene.getSectorById(expectedRoot.id)).toEqual(expectedRoot);
  });

  test('Multiple sectors, relations are established', () => {
    // Arrange
    const metadata: CadSceneRootMetadata = {
      version: 9,
      maxTreeIndex: 8000,
      unit: 'Meters',
      sectors: [
        createV9SceneSectorMetadata(0),
        createV9SceneSectorMetadata(1, 0),
        createV9SceneSectorMetadata(2, 0),
        createV9SceneSectorMetadata(3, 1),
        createV9SceneSectorMetadata(4, 3)
      ]
    };

    // Act
    const scene = parseCadMetadataGltf(metadata);

    // Assert
    const sectors: number[] = [];
    traverseDepthFirst(scene.root, s => {
      sectors.push(s.id);
      return true;
    });
    expect(sectors).toEqual([0, 1, 3, 4, 2]);
  });

  test('Children and parent relations are set', () => {
    // Arrange
    const metadata: CadSceneRootMetadata = {
      version: 8,
      maxTreeIndex: 4,
      unit: 'Meters',
      sectors: [
        /*
              0
            /   \
           1     2
          /
         3
         */
        createV9SceneSectorMetadata(2, 0),
        createV9SceneSectorMetadata(0),
        createV9SceneSectorMetadata(3, 1),
        createV9SceneSectorMetadata(1, 0)
      ]
    };

    // Act
    const scene = parseCadMetadataGltf(metadata);

    // Assert
    const sector0 = scene.getSectorById(0);
    const sector1 = scene.getSectorById(1);
    const sector2 = scene.getSectorById(2);
    const sector3 = scene.getSectorById(3);

    expect(sector0).toBeDefined();
    expect(sector0!.children.map(x => x.id).sort()).toEqual([1, 2]);

    expect(sector1).toBeDefined();
    expect(sector1!.children.map(x => x.id)).toEqual([3]);

    expect(sector2).toBeDefined();
    expect(sector2!.children).toBeEmpty();

    expect(sector3).toBeDefined();
    expect(sector3!.children).toBeEmpty();
  });

  test('Unit is passed through', () => {
    // Arrange
    const metadata: CadSceneRootMetadata = {
      version: 9,
      maxTreeIndex: 4,
      unit: 'AU',
      sectors: [createV9SceneSectorMetadata(0)]
    };

    // Act
    const result = parseCadMetadataGltf(metadata);

    // Assert
    expect(result.unit).toBe('AU');
  });

  test('If geometry bounds is not set, root bounding box is union of all nodes', () => {
    const rand = SeededRandom.create('some_seed');

    const boxSector0 = createRandomBox(10, 20, rand);
    const boxSector1 = createRandomBox(10, 20, rand);
    const boxSector2 = createRandomBox(10, 20, rand);

    // Arrange
    const metadata: CadSceneRootMetadata = {
      version: 8,
      maxTreeIndex: 4,
      unit: 'Meters',
      sectors: [
        createV9SceneSectorMetadata(2, 0, boxSector0),
        createV9SceneSectorMetadata(0, -1, boxSector2),
        createV9SceneSectorMetadata(1, 0, boxSector1)
      ]
    };

    // Act
    const result = parseCadMetadataGltf(metadata);

    // Assert

    const expectedBoundingBox = toThreeBoundingBox(metadata.sectors[0].boundingBox).clone()
      .union(toThreeBoundingBox(metadata.sectors[2].boundingBox));

    const rootBoundingBox = result.root.subtreeBoundingBox;

    expectBoxesEqual(rootBoundingBox, expectedBoundingBox);
  });

  function expectBoxesEqual(box0: THREE.Box3, box1: THREE.Box3) {
    expectVectorsEqual(box0.min, box1.min);
    expectVectorsEqual(box0.max, box1.max);
  }

  function expectVectorsEqual(vec0: THREE.Vector3, vec1: THREE.Vector3) {
    expect(vec0.x).toBe(vec1.x);
    expect(vec0.y).toBe(vec1.y);
    expect(vec0.z).toBe(vec1.z);
  }
});
