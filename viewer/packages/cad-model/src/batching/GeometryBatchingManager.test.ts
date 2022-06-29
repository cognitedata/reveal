/*!
 * Copyright 2021 Cognite AS
 */
import { ParsedGeometry, RevealGeometryCollectionType } from '@reveal/sector-parser';
import * as THREE from 'three';
import { GeometryBatchingManager } from './GeometryBatchingManager';
import { Mock } from 'moq.ts';
import { Materials } from '@reveal/rendering';

describe(GeometryBatchingManager.name, () => {
  let geometryGroup: THREE.Group;
  let manager: GeometryBatchingManager;

  beforeEach(() => {
    geometryGroup = new THREE.Group();
    const materials = new Mock<Materials>().object();
    manager = new GeometryBatchingManager(geometryGroup, materials);
  });

  test('batchGeometries() first time adds new geometry to group', () => {
    const geometries = [createParsedGeometry(RevealGeometryCollectionType.BoxCollection, 10, 0)];
    manager.batchGeometries(geometries, 1);

    expect(geometryGroup.children.length).toBe(1);
  });

  test('batchGeometries() second time with same geometry type doesnt add new geometry to group', () => {
    const geometries1 = [createParsedGeometry(RevealGeometryCollectionType.BoxCollection, 10, 0)];
    const geometries2 = [createParsedGeometry(RevealGeometryCollectionType.BoxCollection, 20, 0)];
    manager.batchGeometries(geometries1, 1);
    manager.batchGeometries(geometries2, 2);

    expect(geometryGroup.children.length).toBe(1);
    expect((geometryGroup.children[0] as THREE.InstancedMesh).count).toBe(30);
  });

  test('batchGeometries() adds new geometry to group for new geometry type', () => {
    const geometries1 = [createParsedGeometry(RevealGeometryCollectionType.BoxCollection, 10, 0)];
    const geometries2 = [createParsedGeometry(RevealGeometryCollectionType.CircleCollection, 20, 1)];
    manager.batchGeometries(geometries1, 1);
    manager.batchGeometries(geometries2, 2);

    expect(geometryGroup.children.length).toBe(2);
  });

  test('batchGeometries() adds relevant tree indices to mesh', () => {
    const treeIndices = [2, 4, 8];
    const geometries1 = [
      createParsedGeometryWithTreeIndices(RevealGeometryCollectionType.BoxCollection, treeIndices, 0)
    ];

    manager.batchGeometries(geometries1, 1);

    for (const i of treeIndices) {
      expect(geometryGroup.children[0].userData.treeIndices.keys()).toContain(i);
    }
  });

  test('removeSectorBatches() removes meshes', () => {
    const geometries1 = [createParsedGeometry(RevealGeometryCollectionType.BoxCollection, 10, 0)];
    const geometries2 = [createParsedGeometry(RevealGeometryCollectionType.BoxCollection, 20, 0)];
    manager.batchGeometries(geometries1, 1);
    manager.batchGeometries(geometries2, 2);

    manager.removeSectorBatches(1);

    expect((geometryGroup.children[0] as THREE.InstancedMesh).count).toBe(20);
  });

  test('removeSectorBatches() removes only relevant treeIndices', () => {
    const treeIndices1 = [10, 20, 30];
    const treeIndices2 = [40, 50, 60];

    const geometries1 = [
      createParsedGeometryWithTreeIndices(RevealGeometryCollectionType.BoxCollection, treeIndices1, 0)
    ];
    const geometries2 = [
      createParsedGeometryWithTreeIndices(RevealGeometryCollectionType.BoxCollection, treeIndices2, 0)
    ];

    manager.batchGeometries(geometries1, 1);
    manager.batchGeometries(geometries2, 2);

    manager.removeSectorBatches(1);

    for (const i of treeIndices2) {
      expect(geometryGroup.children[0].userData.treeIndices.keys()).toContain(i);
    }

    for (const i of treeIndices1) {
      expect(geometryGroup.children[0].userData.treeIndices.keys()).not.toContain(i);
    }
  });

  test('removeSectorBatches() preserves indices added more than once', () => {
    const treeIndices1 = [10, 20];
    const treeIndices2 = [20, 30];

    const geometries1 = [
      createParsedGeometryWithTreeIndices(RevealGeometryCollectionType.BoxCollection, treeIndices1, 0)
    ];
    const geometries2 = [
      createParsedGeometryWithTreeIndices(RevealGeometryCollectionType.BoxCollection, treeIndices2, 0)
    ];

    manager.batchGeometries(geometries1, 1);
    manager.batchGeometries(geometries2, 2);

    manager.removeSectorBatches(1);

    for (const i of treeIndices2) {
      expect(geometryGroup.children[0].userData.treeIndices.keys()).toContain(i);
    }
  });

  test('removeSectorBatches() ignores invalid sectorId', () => {
    expect(() => manager.removeSectorBatches(2)).not.toThrow();
  });
});

function createParsedGeometry(type: RevealGeometryCollectionType, elementCount: number, instanceId: number) {
  return createParsedGeometryWithTreeIndices(type, Array<number>(elementCount), instanceId);
}

function createParsedGeometryWithTreeIndices(
  type: RevealGeometryCollectionType,
  treeIndices: number[],
  instanceId: number
): ParsedGeometry {
  const buffer = new THREE.InterleavedBuffer(new Float32Array(3 * treeIndices.length), 3);
  const geometryBuffer = new THREE.BufferGeometry();
  geometryBuffer.setAttribute('attribute1', new THREE.InterleavedBufferAttribute(buffer, 1, 0));
  geometryBuffer.setAttribute('attribute2', new THREE.InterleavedBufferAttribute(buffer, 1, 1));

  const treeIndexAttribute = new THREE.InterleavedBufferAttribute(buffer, 1, 2);

  for (let i = 0; i < treeIndices.length; i++) {
    treeIndexAttribute.setX(i, treeIndices[i]);
  }

  geometryBuffer.setAttribute('a_treeIndex', treeIndexAttribute);

  const result: ParsedGeometry = {
    type,
    geometryBuffer,
    instanceId: `${instanceId}`
  };

  return result;
}
