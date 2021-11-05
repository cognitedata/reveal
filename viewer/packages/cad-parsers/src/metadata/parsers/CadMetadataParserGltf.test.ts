/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { traverseDepthFirst } from '@reveal/utilities';
import { V9SectorMetadata } from '../types';
import { parseCadMetadataGltf } from './CadMetadataParserGltf';
import { CadSceneRootMetadata, V9SceneSectorMetadata } from './types';

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
      sectors: [createSectorMetadata(1)]
    };
    expect(() => parseCadMetadataGltf(metadata)).toThrow();
  });

  test('Metadata with single root, return valid scene', () => {
    // Arrange
    const sectorRoot = createSectorMetadata(0);
    const metadata: CadSceneRootMetadata = {
      version: 9,
      maxTreeIndex: 8000,
      unit: 'Meters',
      sectors: [sectorRoot]
    };
    const expectedRoot: V9SectorMetadata = {
      id: sectorRoot.id,
      path: sectorRoot.path,
      bounds: new THREE.Box3(
        new THREE.Vector3(sectorRoot.boundingBox.min.x, sectorRoot.boundingBox.min.y, sectorRoot.boundingBox.min.z),
        new THREE.Vector3(sectorRoot.boundingBox.max.x, sectorRoot.boundingBox.max.y, sectorRoot.boundingBox.max.z)
      ),
      depth: sectorRoot.depth,
      children: [],
      estimatedDrawCallCount: 10,
      estimatedRenderCost: 10,
      downloadSize: 1000,
      maxDiagonalLength: 10,
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
        createSectorMetadata(0),
        createSectorMetadata(1, 0),
        createSectorMetadata(2, 0),
        createSectorMetadata(3, 1),
        createSectorMetadata(4, 3)
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
        createSectorMetadata(2, 0),
        createSectorMetadata(0),
        createSectorMetadata(3, 1),
        createSectorMetadata(1, 0)
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
      sectors: [createSectorMetadata(0)]
    };

    // Act
    const result = parseCadMetadataGltf(metadata);

    // Assert
    expect(result.unit).toBe('AU');
  });
});

function createSectorMetadata(id: number, parentId: number = -1): V9SceneSectorMetadata {
  const metadata: V9SceneSectorMetadata = {
    id,
    parentId,
    path: '0/',
    depth: 0,
    estimatedDrawCallCount: 10,
    estimatedTriangleCount: 10,
    boundingBox: {
      min: {
        x: 0.0,
        y: 0.0,
        z: 0.0
      },
      max: {
        x: 1.0,
        y: 1.0,
        z: 1.0
      }
    },
    downloadSize: 1000,
    maxDiagonalLength: 10,
    sectorFileName: `${id}.glb`
  };
  return metadata;
}
