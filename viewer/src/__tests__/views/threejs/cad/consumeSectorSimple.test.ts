/*!
 * Copyright 2020 Cognite AS
 */

import { SectorQuads, SectorMetadata } from '../../../../models/cad/types';
import { Box3 } from '../../../../utils/Box3';
import { vec3 } from 'gl-matrix';
import { consumeSectorSimple } from '../../../../views/threejs/cad/consumeSectorSimple';
import { createMaterials } from '../../../../views/threejs/cad/materials';
import 'jest-extended';

const materials = createMaterials();

describe('consumeSectorDetailed', () => {
  const metadata: SectorMetadata = {
    id: 1,
    depth: 0,
    path: '0/1/2/',
    bounds: new Box3([vec3.fromValues(1, 2, 3), vec3.fromValues(3, 4, 5)]),
    indexFile: {
      fileName: 'sector_1.i3d',
      peripheralFiles: [],
      estimatedDrawCallCount: 10,
      downloadSize: 1000
    },
    facesFile: {
      fileName: 'sector_1.f3d',
      quadSize: 0.5,
      coverageFactors: {
        xy: 0.5,
        xz: 0.5,
        yz: 0.5
      },
      downloadSize: 1000
    },
    children: []
  };
  const sectorId = 1;

  test('no geometry, does not add new nodes', () => {
    // Arrange
    const sector: SectorQuads = {
      nodeIdToTreeIndexMap: new Map(),
      treeIndexToNodeIdMap: new Map(),
      buffer: new Float32Array(0)
    };

    // Act
    const group = consumeSectorSimple(sectorId, sector, metadata, materials);

    // Assert
    expect(group.children).toBeEmpty();
  });

  test('single valid mesh, adds geometry', () => {
    // Arrange
    const sector: SectorQuads = {
      nodeIdToTreeIndexMap: new Map(),
      treeIndexToNodeIdMap: new Map(),
      buffer: new Float32Array([
        // tslint:disable: prettier
        0.0, 0.0, 0.0,
        0.0, 0.0, 0.0,
        42.0,
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
        // tslint:enable: prettier
      ])
    };

    // Act
    const group = consumeSectorSimple(sectorId, sector, metadata, materials);

    // Assert
    expect(group.children).not.toBeEmpty();
  });

  test('buffer has two elements, success', () => {
    // Arrange
    const sector: SectorQuads = {
      nodeIdToTreeIndexMap: new Map(),
      treeIndexToNodeIdMap: new Map(),
      buffer: new Float32Array([
        // tslint:disable: prettier
        // First element
        0.0, 0.0, 0.0,
        0.0, 0.0, 0.0,
        42.0,
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0,
        // Second element
        0.0, 0.0, 0.0,
        0.0, 0.0, 0.0,
        42.0,
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
        // tslint:enable: prettier
      ])
    };

    // Act
    const group = consumeSectorSimple(sectorId, sector, metadata, materials);

    // Assert
    expect(group.children.length).toBe(1);
  });

  test('buffer has extra bytes, throws', () => {
    // Arrange
    const sector: SectorQuads = {
      nodeIdToTreeIndexMap: new Map(),
      treeIndexToNodeIdMap: new Map(),
      buffer: new Float32Array([
        // tslint:disable: prettier
        0.0, 0.0, 0.0,
        0.0, 0.0, 0.0,
        42.0,
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0,

        0.13337,
        // tslint:enable: prettier
      ])
    };

    // Act
    expect(() => consumeSectorSimple(sectorId, sector, metadata, materials)).toThrowError();
  });

  test('buffer missing bytes, throws', () => {
    // Arrange
    const sector: SectorQuads = {
      nodeIdToTreeIndexMap: new Map(),
      treeIndexToNodeIdMap: new Map(),
      buffer: new Float32Array([
        // tslint:disable: prettier
        0.0, 0.0, 0.0,
        // tslint:enable: prettier
      ])
    };

    // Act
    expect(() => consumeSectorSimple(sectorId, sector, metadata, materials)).toThrowError();
  });
});
