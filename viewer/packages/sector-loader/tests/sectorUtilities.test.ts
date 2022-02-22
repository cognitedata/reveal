/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

import { SectorMetadata, SectorGeometry, TriangleMesh } from '@reveal/cad-parsers';

import { createEmptySector } from '../../../test-utilities/src/emptySector';
import { consumeSectorDetailed, consumeSectorSimple } from '../src/v8/sectorUtilities';
import { SectorQuads, createMaterials, RenderMode } from '@reveal/rendering';

import 'jest-extended';

describe('sectorUtilities', () => {
  const materials = createMaterials(
    RenderMode.Color,
    [],
    new THREE.DataTexture(new Uint8Array(64), 4, 4),
    new THREE.DataTexture(new Uint8Array(64), 4, 4),
    new THREE.DataTexture(new Uint8Array(64), 4, 4)
  );

  describe('consumeSectorDetailed', () => {
    const metadata: SectorMetadata = {
      id: 1,
      depth: 0,
      path: '0/1/2/',
      subtreeBoundingBox: new THREE.Box3(new THREE.Vector3(1, 2, 3), new THREE.Vector3(3, 4, 5)),
      children: [],
      estimatedDrawCallCount: 10,
      estimatedRenderCost: 1000,
      indexFile: {
        fileName: 'sector_1.i3d',
        peripheralFiles: [],
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
        recursiveCoverageFactors: {
          xy: 0.5,
          xz: 0.5,
          yz: 0.5
        },
        downloadSize: 1000
      }
    };
    // const sectorId = 1;

    test('no geometry, does not add new nodes', () => {
      // Arrange
      const sector = createEmptySector();

      // Act
      const { sectorMeshes } = consumeSectorDetailed(sector, metadata, materials, null);

      // Assert
      expect(sectorMeshes.children).toBeEmpty();
    });

    test('single triangle mesh, adds geometry', () => {
      // Arrange
      const triangleMeshes = [newTriangleMesh()];
      const sector: SectorGeometry = Object.assign(createEmptySector(), { triangleMeshes } as SectorGeometry);

      // Act
      const { sectorMeshes } = consumeSectorDetailed(sector, metadata, materials, null);

      // Assert
      expect(sectorMeshes.children.length).toBe(1);
    });

    test('empty sector, produces no geometry', () => {
      // Arrange
      const sector = createEmptySector();

      // Act
      const { sectorMeshes } = consumeSectorDetailed(sector, metadata, materials, null);

      // Assert
      expect(sectorMeshes.children).toBeEmpty();
    });
  });

  describe('consumeSectorSimple', () => {
    test('no geometry, does not add new nodes', () => {
      // Arrange
      const sector: SectorQuads = {
        nodeIdToTreeIndexMap: new Map(),
        treeIndexToNodeIdMap: new Map(),
        buffer: new Float32Array(0)
      };

      const bounds = new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 1));

      // Act
      const { sectorMeshes } = consumeSectorSimple(sector, bounds, materials, null);

      // Assert
      expect(sectorMeshes.children).toBeEmpty();
    });

    test('single valid mesh, adds geometry', () => {
      // Arrange
      const sector: SectorQuads = {
        nodeIdToTreeIndexMap: new Map(),
        treeIndexToNodeIdMap: new Map(),
        buffer: new Float32Array([
          /* eslint-disable prettier/prettier */
        0.0, 0.0, 0.0,
        0.0, 0.0, 0.0,
        42.0,
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
        /* eslint-enable prettier/prettier */
        ])
      };

      const bounds = new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 1));

      // Act
      const { sectorMeshes } = consumeSectorSimple(sector, bounds, materials, null);

      // Assert
      expect(sectorMeshes.children).not.toBeEmpty();
    });

    test('buffer has two elements, success', () => {
      // Arrange
      const sector: SectorQuads = {
        nodeIdToTreeIndexMap: new Map(),
        treeIndexToNodeIdMap: new Map(),
        buffer: new Float32Array([
        /* eslint-disable prettier/prettier */
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
        /* eslint-enable prettier/prettier */
        ])
      };

      const bounds = new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 1));

      // Act
      const { sectorMeshes } = consumeSectorSimple(sector, bounds, materials, null);

      // Assert
      expect(sectorMeshes.children.length).toBe(1);
    });

    test('buffer has extra bytes, throws', () => {
      // Arrange
      const sector: SectorQuads = {
        nodeIdToTreeIndexMap: new Map(),
        treeIndexToNodeIdMap: new Map(),
        buffer: new Float32Array([
        /* eslint-disable prettier/prettier */
        0.0, 0.0, 0.0,
        0.0, 0.0, 0.0,
        42.0,
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0,

        0.13337,
        /* eslint-enable prettier/prettier */
        ])
      };

      const bounds = new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 1));

      // Act
      expect(() => consumeSectorSimple(sector, bounds, materials, null)).toThrowError();
    });

    test('buffer missing bytes, throws', () => {
      // Arrange
      const sector: SectorQuads = {
        nodeIdToTreeIndexMap: new Map(),
        treeIndexToNodeIdMap: new Map(),
        buffer: new Float32Array([
        /* eslint-disable prettier/prettier */
        0.0, 0.0, 0.0,
        /* eslint-enable prettier/prettier */
        ])
      };

      const bounds = new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 1));

      // Act
      expect(() => consumeSectorSimple(sector, bounds, materials, null)).toThrowError();
    });
  });
});

function newTriangleMesh(): TriangleMesh {
  return {
    fileId: 0,
    treeIndices: new Float32Array(10),
    indices: new Uint32Array(10),
    vertices: new Float32Array(5),
    colors: new Uint8Array(30),
    normals: undefined
  };
}
