/*!
 * Copyright 2020 Cognite AS
 */

import { CadMetadataV8, parseCadMetadataV8, CadSectorMetadataV8 } from '../../../models/cad/CadMetadataParserV8';
import { SectorMetadata } from '../../../models/cad/types';
import { Box3 } from '../../../utils/Box3';
import { vec3 } from 'gl-matrix';
import { traverseDepthFirst } from '../../../utils/traversal';

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
      facesFile: sectorRoot.facesFile,
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
      downloadSize: 1000
    }
  };
  return metadata;
}
