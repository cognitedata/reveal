/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { SectorMetadata, SectorGeometry } from './types';
import { Box3 } from '../../../utilities/Box3';
import { vec3 } from 'gl-matrix';
import { createEmptySector } from '../../../__testutilities__/emptySector';
import { createMaterials } from '../rendering/materials';
import { RenderMode } from '../rendering/RenderMode';
import { consumeSectorDetailed, consumeSectorSimple, discardSector } from './sectorUtilities';
import { TriangleMesh, InstancedMeshFile, InstancedMesh, SectorQuads } from '../rendering/types';

import 'jest-extended';

describe('sectorUtilities', () => {
  const materials = createMaterials(10, RenderMode.Color, []);

  describe('consumeSectorDetailed', () => {
    const metadata: SectorMetadata = {
      id: 1,
      depth: 0,
      path: '0/1/2/',
      bounds: new Box3([vec3.fromValues(1, 2, 3), vec3.fromValues(3, 4, 5)]),
      children: [],
      estimatedDrawCallCount: 10,
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
      const group = consumeSectorDetailed(sector, metadata, materials);

      // Assert
      expect(group.children).toBeEmpty();
    });

    test('single triangle mesh, adds geometry', () => {
      // Arrange
      const triangleMeshes = [newTriangleMesh()];
      const sector: SectorGeometry = Object.assign(createEmptySector(), { triangleMeshes } as SectorGeometry);

      // Act
      const group = consumeSectorDetailed(sector, metadata, materials);

      // Assert
      expect(group.children.length).toBe(1);
    });

    test('single instance mesh, adds geometry', () => {
      // Arrange
      const instanceMeshes = [newInstanceMeshFile()];
      const sector: SectorGeometry = Object.assign(createEmptySector(), { instanceMeshes } as SectorGeometry);

      // Act
      const group = consumeSectorDetailed(sector, metadata, materials);

      // Assert
      expect(group.children.length).toBe(1);
    });

    test('empty sector, produces no geometry', () => {
      // Arrange
      const sector = createEmptySector();

      // Act
      const group = consumeSectorDetailed(sector, metadata, materials);

      // Assert
      expect(group.children).toBeEmpty();
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

      // Act
      const group = consumeSectorSimple(sector, materials);

      // Assert
      expect(group.children).toBeEmpty();
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

      // Act
      const group = consumeSectorSimple(sector, materials);

      // Assert
      expect(group.children).not.toBeEmpty();
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

      // Act
      const group = consumeSectorSimple(sector, materials);

      // Assert
      expect(group.children.length).toBe(1);
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

      // Act
      expect(() => consumeSectorSimple(sector, materials)).toThrowError();
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

      // Act
      expect(() => consumeSectorSimple(sector, materials)).toThrowError();
    });
  });

  describe('discardSector', () => {
    let node: THREE.Group;

    beforeEach(() => {
      node = new THREE.Group();
      jest.resetAllMocks();
    });

    test('discard undefined request does not throw', () => {
      expect(() => discardSector(node)).not.toThrow();
    });

    test('disposes geometry', () => {
      // Arrange
      const geometryDisposeMock = jest.fn();
      THREE.Geometry.prototype.dispose = geometryDisposeMock;
      const mesh = new THREE.Mesh(new THREE.Geometry(), new THREE.Material());
      node.add(mesh);

      // Act
      discardSector(node);

      // Assert
      expect(geometryDisposeMock).toBeCalledTimes(1);
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

function newInstanceMeshFile(): InstancedMeshFile {
  return {
    fileId: 0,
    indices: new Uint32Array(10),
    vertices: new Float32Array(5),
    normals: new Float32Array(5),
    instances: [newInstanceMesh()]
  };
}

function newInstanceMesh(): InstancedMesh {
  return {
    triangleCount: 4,
    triangleOffset: 0,
    colors: new Uint8Array(4),
    instanceMatrices: new Float32Array(16),
    treeIndices: new Float32Array(1)
  };
}
