/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { InstancedMesh, InstancedMeshFile } from '@reveal/cad-parsers';

import { InstancedMeshManager } from './InstancedMeshManager';
import { CadMaterialManager, Materials } from '@reveal/rendering';
import { It, Mock } from 'moq.ts';

describe('intersectCadNodes', () => {
  let group: THREE.Group;
  let meshManager: InstancedMeshManager;

  beforeEach(() => {
    const materialManager = new Mock<CadMaterialManager>()
      .setup(p => p.getModelMaterials(It.IsAny()))
      .returns(new Mock<Materials>().object());
    group = new THREE.Group();

    meshManager = new InstancedMeshManager(group, materialManager.object());
  });

  test('Adding instanced mesh from sector is correctly managed', () => {
    // Arrange
    const instanceMesh: InstancedMesh = {
      triangleOffset: 0,
      triangleCount: 3,
      treeIndices: new Float32Array([0]),
      colors: new Uint8Array([1, 0, 0, 0]),
      instanceMatrices: new Float32Array(new THREE.Matrix4().toArray())
    };

    const instancedMeshFile: InstancedMeshFile = {
      fileId: 0,
      vertices: new Float32Array([0, 0, 0, 0, 1, 0, 1, 1, 0]),
      indices: new Uint32Array([0, 1, 2]),
      instances: [instanceMesh]
    };

    const sectorId = 123;

    // Act
    meshManager.addInstanceMeshes(instancedMeshFile, 'testModel', sectorId);

    // Assert
    const instancedGeometryMap: Map<number, any> = (meshManager as any)._instancedGeometryMap;
    expect(instancedGeometryMap.size).toBe(1);

    const instancedGeometryVertices: THREE.Float32BufferAttribute = instancedGeometryMap.get(0)!.vertices;
    expect(instancedGeometryVertices.array.length).toBe(instancedMeshFile.vertices.length);

    for (let i = 0; i < instancedMeshFile.vertices.length; i++) {
      expect(instancedGeometryVertices.array[i]).toBe(instancedMeshFile.vertices[i]);
    }

    const instancedGeometryIndices: THREE.Uint32BufferAttribute = instancedGeometryMap.get(0)!.indices;
    expect(instancedGeometryIndices.array.length).toBe(instancedMeshFile.indices.length);

    for (let i = 0; i < instancedMeshFile.indices.length; i++) {
      expect(instancedGeometryIndices.array[i]).toBe(instancedMeshFile.indices[i]);
    }

    const processedSectorMap: Map<number, any> = (meshManager as any)._processedSectorMap;

    expect(processedSectorMap.has(sectorId)).toBeTrue();

    expect(group.children.length).toBe(1);
  });

  test('Adding instanced mesh from sector, then removing should be properly managed', () => {
    // Arrange
    const instanceMesh: InstancedMesh = {
      triangleOffset: 0,
      triangleCount: 3,
      treeIndices: new Float32Array([0]),
      colors: new Uint8Array([1, 0, 0, 0]),
      instanceMatrices: new Float32Array(new THREE.Matrix4().toArray())
    };

    const instancedMeshFile: InstancedMeshFile = {
      fileId: 0,
      vertices: new Float32Array([0, 0, 0, 0, 1, 0, 1, 1, 0]),
      indices: new Uint32Array([0, 1, 2]),
      instances: [instanceMesh]
    };

    const sectorId = 123;

    // Act
    meshManager.addInstanceMeshes(instancedMeshFile, 'testModel', sectorId);
    meshManager.removeSectorInstancedMeshes(sectorId);

    // Assert
    const processedSectorMap: Map<number, any> = (meshManager as any)._processedSectorMap;

    expect(processedSectorMap.has(sectorId)).toBeFalse();
  });
});
