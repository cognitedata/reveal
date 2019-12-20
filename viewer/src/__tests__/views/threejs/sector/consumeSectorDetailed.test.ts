/*!
 * Copyright 2019 Cognite AS
 */

import {
  SectorMetadata,
  TriangleMesh,
  InstancedMeshFile,
  InstancedMesh,
  SectorModelTransformation
} from '../../../../models/sector/types';
import { Box3 } from '../../../../utils/Box3';
import { vec3 } from 'gl-matrix';
import { consumeSectorDetailed } from '../../../../views/threejs/sector/consumeSectorDetailed';
import { SectorNode } from '../../../../views/threejs/sector/SectorNode';
import 'jest-extended';
import { createEmptySector } from '../../../models/sector/emptySector';

describe('consumeSectorDetailed', () => {
  const metadata: SectorMetadata = {
    id: 1,
    path: '0/1/2/',
    bounds: new Box3([vec3.fromValues(1, 2, 3), vec3.fromValues(3, 4, 5)]),
    children: []
  };
  const sectorId = 1;
  let node: SectorNode;

  beforeEach(() => {
    node = new SectorNode(sectorId, '0/1/2');
  });

  test('no geometry, does not add new nodes', () => {
    // Arrange
    const sector = createEmptySector();

    // Act
    consumeSectorDetailed(sectorId, sector, metadata, node);

    // Assert
    const geometries = extractGeometries(node);
    expect(geometries).toBeEmpty();
  });

  test('single triangle mesh, adds geometry', () => {
    // Arrange
    const sector = createEmptySector();
    sector.triangleMeshes = [newTriangleMesh()];

    // Act
    consumeSectorDetailed(sectorId, sector, metadata, node);

    // Assert
    const geometries = extractGeometries(node);
    expect(geometries.length).toBe(1);
  });

  test('single instance mesh, adds geometry', () => {
    // Arrange
    const sector = createEmptySector();
    sector.instanceMeshes = [newInstanceMeshFile()];

    // Act
    consumeSectorDetailed(sectorId, sector, metadata, node);

    // Assert
    const geometries = extractGeometries(node);
    expect(geometries.length).toBe(1);
  });

  test('empty sector, produces no geometry', () => {
    // Arrange
    const sector = createEmptySector();

    // Act
    consumeSectorDetailed(sectorId, sector, metadata, node);

    // Assert
    expect(node.children).toBeEmpty();
  });
});

function newTriangleMesh(): TriangleMesh {
  return {
    fileId: 0,
    indices: new Uint32Array(10),
    vertices: new Float32Array(5),
    colors: new Float32Array(),
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
    instanceMatrices: new Float32Array(16)
  };
}

function extractGeometries(root: THREE.Object3D): THREE.Object3D[] {
  const geometries: THREE.Object3D[] = [];
  root.traverse(n => {
    if (n.type.indexOf('Mesh') !== -1) {
      geometries.push(n);
    }
  });
  return geometries;
}
