/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

import { parseCadMetadataV8 } from './CadMetadataParserV8';
import { SectorMetadata, V8SectorMetadata } from '../types';
import { traverseDepthFirst } from '@reveal/utilities';

import { Mutable } from '../../../../../test-utilities/src/reflection';
import { CadSceneRootMetadata, V8SceneSectorMetadata } from './types';

import { createV8SceneSectorMetadata } from '../../../../../test-utilities';

describe('parseCadMetadataV8', () => {
  test('Metadata without sectors, throws', () => {
    const metadata: CadSceneRootMetadata = {
      version: 8,
      maxTreeIndex: 103350,
      unit: 'Meters',
      sectors: []
    };
    expect(() => parseCadMetadataV8(metadata)).toThrow();
  });

  test('Metadata has no root sector with id 0, throws', () => {
    const metadata: CadSceneRootMetadata = {
      version: 8,
      maxTreeIndex: 103350,
      unit: 'Meters',
      sectors: [createV8SceneSectorMetadata(1)]
    };
    expect(() => parseCadMetadataV8(metadata)).toThrow();
  });

  test('Metadata with single root, return valid scene', () => {
    // Arrange
    const sectorRoot = createV8SceneSectorMetadata(0);
    const metadata: CadSceneRootMetadata = {
      version: 8,
      maxTreeIndex: 8000,
      unit: 'Meters',
      sectors: [sectorRoot]
    };
    const expectedRoot: SectorMetadata = {
      id: sectorRoot.id,
      path: sectorRoot.path,
      subtreeBoundingBox: new THREE.Box3(
        new THREE.Vector3(sectorRoot.boundingBox.min.x, sectorRoot.boundingBox.min.y, sectorRoot.boundingBox.min.z),
        new THREE.Vector3(sectorRoot.boundingBox.max.x, sectorRoot.boundingBox.max.y, sectorRoot.boundingBox.max.z)
      ),
      depth: sectorRoot.depth,
      indexFile: sectorRoot.indexFile,
      facesFile: {
        ...sectorRoot.facesFile!,
        recursiveCoverageFactors: sectorRoot.facesFile!.recursiveCoverageFactors!
      },
      children: [],
      estimatedDrawCallCount: 10,
      estimatedRenderCost: 10
    };

    // Act
    const scene = parseCadMetadataV8(metadata);

    // Assert
    expect(scene.version).toBe(8);
    expect(scene.maxTreeIndex).toBe(8000);
    expect(scene.root).toEqual(expectedRoot);
    expect(scene.getSectorById(expectedRoot.id)).toEqual(expectedRoot);
  });

  test('Metadata with missing recursiveCoverageFactors, falls back to coverageFactors', () => {
    // Arrange
    const sectorRoot = createV8SceneSectorMetadata(0);
    const metadata: CadSceneRootMetadata = {
      version: 8,
      maxTreeIndex: 8000,
      unit: 'Meters',
      sectors: [sectorRoot]
    };
    const expectedRoot: SectorMetadata = {
      id: sectorRoot.id,
      path: sectorRoot.path,
      subtreeBoundingBox: new THREE.Box3(
        new THREE.Vector3(sectorRoot.boundingBox.min.x, sectorRoot.boundingBox.min.y, sectorRoot.boundingBox.min.z),
        new THREE.Vector3(sectorRoot.boundingBox.max.x, sectorRoot.boundingBox.max.y, sectorRoot.boundingBox.max.z)
      ),
      depth: sectorRoot.depth,
      indexFile: sectorRoot.indexFile,
      facesFile: { ...sectorRoot.facesFile!, recursiveCoverageFactors: sectorRoot.facesFile!.coverageFactors },
      children: [],
      estimatedDrawCallCount: 10,
      estimatedRenderCost: 10
    };

    // Act
    (sectorRoot.facesFile as any).recursiveCoverageFactors = undefined;
    const scene = parseCadMetadataV8(metadata);

    // Assert
    expect(scene.version).toBe(8);
    expect(scene.maxTreeIndex).toBe(8000);
    expect(scene.root).toEqual(expectedRoot);
    expect(scene.getSectorById(expectedRoot.id)).toEqual(expectedRoot);
  });

  test('Multiple sectors, relations are established', () => {
    // Arrange
    const metadata: CadSceneRootMetadata = {
      version: 8,
      maxTreeIndex: 8000,
      unit: 'Meters',
      sectors: [
        createV8SceneSectorMetadata(0),
        createV8SceneSectorMetadata(1, 0),
        createV8SceneSectorMetadata(2, 0),
        createV8SceneSectorMetadata(3, 1),
        createV8SceneSectorMetadata(4, 3)
      ]
    };

    // Act
    const scene = parseCadMetadataV8(metadata);

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
        createV8SceneSectorMetadata(2, 0),
        createV8SceneSectorMetadata(0),
        createV8SceneSectorMetadata(3, 1),
        createV8SceneSectorMetadata(1, 0)
      ]
    };

    // Act
    const scene = parseCadMetadataV8(metadata);

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

  test('Single sector without facesFile, creates dummy faces section', () => {
    // Arrange
    const root: Mutable<V8SceneSectorMetadata> = createV8SceneSectorMetadata(0, -1);
    root.facesFile = null;
    const metadata: CadSceneRootMetadata = {
      version: 8,
      maxTreeIndex: 4,
      unit: 'Meters',
      sectors: [root]
    };

    // Act
    const result = parseCadMetadataV8(metadata);

    // Assert
    expect(result.getAllSectors().length).toBe(1);

    const resultRoot = result.root as V8SectorMetadata;

    expect(resultRoot.facesFile).toBeTruthy();
    expect(resultRoot.facesFile.fileName).toBeNull();
  });

  test('Metadata is missing facesFile from leafs, creates dummy facesFile with coverage factors from parent', () => {
    // Arrange
    const leaf2: Mutable<V8SceneSectorMetadata> = createV8SceneSectorMetadata(3, 1);
    leaf2.facesFile = null;
    const leaf3: Mutable<V8SceneSectorMetadata> = createV8SceneSectorMetadata(2, 0);
    leaf3.facesFile = null;
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
        leaf2,
        createV8SceneSectorMetadata(0),
        leaf3,
        createV8SceneSectorMetadata(1, 0)
      ]
    };

    // Act
    const result = parseCadMetadataV8(metadata);

    // Assert
    {
      const rootSector = result.getSectorById(0)! as V8SectorMetadata;
      const sector = result.getSectorById(2) as V8SectorMetadata;
      expect(sector).toBeTruthy();
      expect(sector!.facesFile).toBeDefined();
      expect(sector!.facesFile.coverageFactors).toEqual(rootSector.facesFile.recursiveCoverageFactors);
      expect(sector!.facesFile.recursiveCoverageFactors).toEqual(rootSector.facesFile.recursiveCoverageFactors);
      expect(sector!.facesFile.fileName).toBeNull();
    }
    {
      const sector1 = result.getSectorById(1)! as V8SectorMetadata;
      const sector = result.getSectorById(3) as V8SectorMetadata;
      expect(sector).toBeTruthy();
      expect(sector!.facesFile).toBeDefined();
      expect(sector!.facesFile.coverageFactors).toEqual(sector1.facesFile.recursiveCoverageFactors);
      expect(sector!.facesFile.recursiveCoverageFactors).toEqual(sector1.facesFile.recursiveCoverageFactors);
      expect(sector!.facesFile.fileName).toBeNull();
    }
  });

  test('No sectors has faces files, provides dummy values for all', () => {
    // Arrange
    const sectors: Mutable<V8SceneSectorMetadata>[] = [
      createV8SceneSectorMetadata(2, 0),
      createV8SceneSectorMetadata(0),
      createV8SceneSectorMetadata(3, 1),
      createV8SceneSectorMetadata(1, 0)
    ];
    sectors.forEach(x => (x.facesFile = null));
    const metadata: CadSceneRootMetadata = {
      version: 8,
      maxTreeIndex: 4,
      unit: 'Meters',
      sectors
    };

    // Act
    const result = parseCadMetadataV8(metadata);

    // Assert
    expect(result.getAllSectors()).toBeArrayOfSize(4);
    for (let sector of result.getAllSectors()) {
      sector = sector as V8SectorMetadata;
      expect(sector.facesFile).toBeTruthy();
      expect(sector.facesFile.fileName).toBeNull();
      expect(sector.facesFile.coverageFactors).not.toBeNull();
      expect(sector.facesFile.recursiveCoverageFactors).not.toBeNull();
    }
  });

  test('Unit is passed through', () => {
    // Arrange
    const metadata: CadSceneRootMetadata = {
      version: 8,
      maxTreeIndex: 4,
      unit: 'AU',
      sectors: [createV8SceneSectorMetadata(0)]
    };

    // Act
    const result = parseCadMetadataV8(metadata);

    // Assert
    expect(result.unit).toBe('AU');
  });
});
