/*!
 * Copyright 2020 Cognite AS
 */

import { SectorMetadata, SectorGeometry } from '@/datamodels/cad/sector/types';
import { Box3 } from '@/utilities/Box3';
import { vec3 } from 'gl-matrix';
import { createEmptySector } from '../../../models/cad/emptySector';
import { createMaterials } from '@/datamodels/cad/rendering/materials';
import 'jest-extended';
import { RenderMode } from '@/datamodels/cad/rendering/RenderMode';
import { consumeSectorDetailed } from '@/datamodels/cad/sector/sectorUtilities';
import { TriangleMesh, InstancedMeshFile, InstancedMesh } from '@/datamodels/cad/rendering/types';

const materials = createMaterials(10, RenderMode.Color, []);

describe('consumeSectorDetailed', () => {
  const metadata: SectorMetadata = {
    id: 1,
    depth: 0,
    path: '0/1/2/',
    bounds: new Box3([vec3.fromValues(1, 2, 3), vec3.fromValues(3, 4, 5)]),
    children: [],
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
