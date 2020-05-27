/*!
 * Copyright 2020 Cognite AS
 */

import { CadMetadataV8, parseCadMetadataV8, CadSectorMetadataV8 } from '@/datamodels/cad/parsers/CadMetadataParserV8';
import { SectorMetadata } from '@/datamodels/cad/sector/types';
import { Box3 } from '@/utilities/Box3';
import { traverseDepthFirst } from '@/utilities/traversal';

import { vec3 } from 'gl-matrix';

type Mutable<T> = { -readonly [P in keyof T]: T[P] };

describe('parseCadMetadataV8', () => {
  test('Metadata without sectors, throws', () => {
    const metadata: CadMetadataV8 = {
      version: 8,
      maxTreeIndex: 103350,
      sectors: []
    };
    expect(() => parseCadMetadataV8(metadata)).toThrow();
  });

  test('Metadata has no root sector with id 0, throws', () => {
    const metadata: CadMetadataV8 = {
      version: 8,
      maxTreeIndex: 103350,
      sectors: [createSectorMetadata(1)]
    };
    expect(() => parseCadMetadataV8(metadata)).toThrow();
  });

  test('Metadata with single root, return valid scene', () => {
    // Arrange
    const sectorRoot = createSectorMetadata(0);
    const metadata: CadMetadataV8 = {
      version: 8,
      maxTreeIndex: 8000,
      sectors: [sectorRoot]
    };
    const expectedRoot: SectorMetadata = {
      id: sectorRoot.id,
      path: sectorRoot.path,
      bounds: new Box3([
        vec3.fromValues(sectorRoot.boundingBox.min.x, sectorRoot.boundingBox.min.y, sectorRoot.boundingBox.min.z),
        vec3.fromValues(sectorRoot.boundingBox.max.x, sectorRoot.boundingBox.max.y, sectorRoot.boundingBox.max.z)
      ]),
      depth: sectorRoot.depth,
      indexFile: sectorRoot.indexFile,
      facesFile: {
        ...sectorRoot.facesFile!,
        recursiveCoverageFactors: sectorRoot.facesFile!.recursiveCoverageFactors!
      },
      children: []
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
    const sectorRoot = createSectorMetadata(0);
    const metadata: CadMetadataV8 = {
      version: 8,
      maxTreeIndex: 8000,
      sectors: [sectorRoot]
    };
    const expectedRoot: SectorMetadata = {
      id: sectorRoot.id,
      path: sectorRoot.path,
      bounds: new Box3([
        vec3.fromValues(sectorRoot.boundingBox.min.x, sectorRoot.boundingBox.min.y, sectorRoot.boundingBox.min.z),
        vec3.fromValues(sectorRoot.boundingBox.max.x, sectorRoot.boundingBox.max.y, sectorRoot.boundingBox.max.z)
      ]),
      depth: sectorRoot.depth,
      indexFile: sectorRoot.indexFile,
      facesFile: { ...sectorRoot.facesFile!, recursiveCoverageFactors: sectorRoot.facesFile!.coverageFactors },
      children: []
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
    const metadata: CadMetadataV8 = {
      version: 8,
      maxTreeIndex: 8000,
      sectors: [
        createSectorMetadata(0),
        createSectorMetadata(1, 0),
        createSectorMetadata(2, 0),
        createSectorMetadata(3, 1),
        createSectorMetadata(4, 3)
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
    const metadata: CadMetadataV8 = {
      version: 8,
      maxTreeIndex: 4,
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
    const scene = parseCadMetadataV8(metadata);

    // Assert
    const sector0 = scene.getSectorById(0);
    const sector1 = scene.getSectorById(1);
    const sector2 = scene.getSectorById(2);
    const sector3 = scene.getSectorById(3);

    expect(sector0).toBeDefined();
    expect(sector0!.children.map(x => x.id).sort()).toEqual([1, 2]);
    expect(sector0!.parent).toBeUndefined();

    expect(sector1).toBeDefined();
    expect(sector1!.children.map(x => x.id)).toEqual([3]);
    expect(sector1!.parent).toBe(sector0);

    expect(sector2).toBeDefined();
    expect(sector2!.children).toBeEmpty();
    expect(sector2!.parent).toBe(sector0);

    expect(sector3).toBeDefined();
    expect(sector3!.children).toBeEmpty();
    expect(sector3!.parent).toBe(sector1);
  });

  test('Single sector without facesFile, creates dummy faces section', () => {
    // Arrange
    const root: Mutable<CadSectorMetadataV8> = createSectorMetadata(0, -1);
    root.facesFile = null;
    const metadata: CadMetadataV8 = {
      version: 8,
      maxTreeIndex: 4,
      sectors: [root]
    };

    // Act
    const result = parseCadMetadataV8(metadata);

    // Assert
    expect(result.getAllSectors().length).toBe(1);
    expect(result.root.facesFile).toBeTruthy();
    expect(result.root.facesFile.fileName).toBeNull();
  });

  test('Metadata is missing facesFile from leafs, creates dummy facesFile with coverage factors from parent', () => {
    // Arrange
    const leaf2: Mutable<CadSectorMetadataV8> = createSectorMetadata(3, 1);
    leaf2.facesFile = null;
    const leaf3: Mutable<CadSectorMetadataV8> = createSectorMetadata(2, 0);
    leaf3.facesFile = null;
    const metadata: CadMetadataV8 = {
      version: 8,
      maxTreeIndex: 4,
      sectors: [
        /*
              0
            /   \
           1     2
          /
         3
         */
        leaf2,
        createSectorMetadata(0),
        leaf3,
        createSectorMetadata(1, 0)
      ]
    };

    // Act
    const result = parseCadMetadataV8(metadata);

    // Assert
    {
      const rootSector = result.getSectorById(0)!;
      const sector = result.getSectorById(2);
      expect(sector).toBeTruthy();
      expect(sector!.facesFile).toBeDefined();
      expect(sector!.facesFile.coverageFactors).toEqual(rootSector.facesFile.recursiveCoverageFactors);
      expect(sector!.facesFile.recursiveCoverageFactors).toEqual(rootSector.facesFile.recursiveCoverageFactors);
      expect(sector!.facesFile.fileName).toBeNull();
    }
    {
      const sector1 = result.getSectorById(1)!;
      const sector = result.getSectorById(3);
      expect(sector).toBeTruthy();
      expect(sector!.facesFile).toBeDefined();
      expect(sector!.facesFile.coverageFactors).toEqual(sector1.facesFile.recursiveCoverageFactors);
      expect(sector!.facesFile.recursiveCoverageFactors).toEqual(sector1.facesFile.recursiveCoverageFactors);
      expect(sector!.facesFile.fileName).toBeNull();
    }
  });

  test('No sectors has faces files, provides dummy values for all', () => {
    // Arrange
    const sectors: Mutable<CadSectorMetadataV8>[] = [
      createSectorMetadata(2, 0),
      createSectorMetadata(0),
      createSectorMetadata(3, 1),
      createSectorMetadata(1, 0)
    ];
    sectors.forEach(x => (x.facesFile = null));
    const metadata: CadMetadataV8 = {
      version: 8,
      maxTreeIndex: 4,
      sectors
    };

    // Act
    const result = parseCadMetadataV8(metadata);

    // Assert
    expect(result.getAllSectors()).toBeArrayOfSize(4);
    for (const sector of result.getAllSectors()) {
      expect(sector.facesFile).toBeTruthy();
      expect(sector.facesFile.fileName).toBeNull();
      expect(sector.facesFile.coverageFactors).not.toBeNull();
      expect(sector.facesFile.recursiveCoverageFactors).not.toBeNull();
    }
  });
});

function createSectorMetadata(id: number, parentId: number = -1): CadSectorMetadataV8 {
  const metadata: CadSectorMetadataV8 = {
    id,
    parentId,
    path: '0/',
    depth: 0,
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
    indexFile: {
      fileName: `sector_${id}.i3d`,
      peripheralFiles: [],
      estimatedDrawCallCount: 10,
      downloadSize: 19996
    },
    facesFile: {
      fileName: `sector_${id}.f3d`,
      quadSize: 0.5,
      coverageFactors: {
        xy: 0.5,
        xz: 0.5,
        yz: 0.5
      },
      recursiveCoverageFactors: {
        xy: 0.6,
        xz: 0.7,
        yz: 0.8
      },
      downloadSize: 1000
    }
  };
  return metadata;
}
