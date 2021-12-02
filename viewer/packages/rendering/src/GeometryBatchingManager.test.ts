/*!
 * Copyright 2021 Cognite AS
 */
import { ParsedGeometry, RevealGeometryCollectionType } from '@reveal/sector-parser';
import * as THREE from 'three';
import { RenderMode } from './rendering/RenderMode';
import { GeometryBatchingManager } from './GeometryBatchingManager';
import { createMaterials } from './rendering/materials';

describe(GeometryBatchingManager.name, () => {
  let geometryGroup: THREE.Group;
  let manager: GeometryBatchingManager;

  beforeEach(() => {
    geometryGroup = new THREE.Group();
    const materials = createMaterials(
      RenderMode.Color,
      [],
      new THREE.DataTexture(),
      new THREE.DataTexture(),
      new THREE.DataTexture()
    );
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

  test('removeSectorBatches() removes meshes', () => {
    const geometries1 = [createParsedGeometry(RevealGeometryCollectionType.BoxCollection, 10, 0)];
    const geometries2 = [createParsedGeometry(RevealGeometryCollectionType.BoxCollection, 20, 0)];
    manager.batchGeometries(geometries1, 1);
    manager.batchGeometries(geometries2, 2);

    manager.removeSectorBatches(1);

    expect((geometryGroup.children[0] as THREE.InstancedMesh).count).toBe(20);
  });

  test('removeSectorBatches() ignores invalid sectorId', () => {
    expect(() => manager.removeSectorBatches(2)).not.toThrow();
  });
});

function createParsedGeometry(type: RevealGeometryCollectionType, elementCount: number, instanceId: number) {
  const buffer = new THREE.InterleavedBuffer(new Float32Array(2 * elementCount), 2);
  const geometryBuffer = new THREE.BufferGeometry();
  geometryBuffer.setAttribute('attribute1', new THREE.InterleavedBufferAttribute(buffer, 1, 0));
  geometryBuffer.setAttribute('attribute2', new THREE.InterleavedBufferAttribute(buffer, 1, 1));
  const result: ParsedGeometry = {
    type,
    geometryBuffer,
    instanceId: `${instanceId}`
  };
  return result;
}
