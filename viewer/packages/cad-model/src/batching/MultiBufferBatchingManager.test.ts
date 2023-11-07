/*!
 * Copyright 2021 Cognite AS
 */
import { ParsedGeometry, RevealGeometryCollectionType } from '@reveal/sector-parser';
import * as THREE from 'three';
import { Mock } from 'moq.ts';
import { Materials, StyledTreeIndexSets } from '@reveal/rendering';
import { MultiBufferBatchingManager } from './MultiBufferBatchingManager';
import { TreeIndexToSectorsMap } from '../utilities/TreeIndexToSectorsMap';
import sum from 'lodash/sum';
import { IndexSet } from '@reveal/utilities';

describe(MultiBufferBatchingManager.name, () => {
  let geometryGroup: THREE.Group;
  let manager: MultiBufferBatchingManager;
  const numberOfInstanceBuffers = 2;
  beforeEach(() => {
    geometryGroup = new THREE.Group();
    const materials = new Mock<Materials>().object();
    const styledIndexSets: StyledTreeIndexSets = {
      back: new IndexSet(),
      ghost: new IndexSet(),
      inFront: new IndexSet(),
      visible: new IndexSet()
    };
    manager = new MultiBufferBatchingManager(
      geometryGroup,
      materials,
      styledIndexSets,
      new TreeIndexToSectorsMap(10),
      1024,
      numberOfInstanceBuffers
    );
  });

  test('batchGeometries() first time adds new geometry to group', () => {
    const geometries = [createParsedGeometry(RevealGeometryCollectionType.BoxCollection, 10, 0)];
    manager.batchGeometries(geometries, 1);

    expect(geometryGroup.children.length).toBe(numberOfInstanceBuffers);
  });

  test('batchGeometries() second time with same geometry type doesnt add new geometry to group', () => {
    const geometries1 = [createParsedGeometry(RevealGeometryCollectionType.BoxCollection, 10, 0)];
    const geometries2 = [createParsedGeometry(RevealGeometryCollectionType.BoxCollection, 20, 0)];
    const geometries3 = [createParsedGeometry(RevealGeometryCollectionType.BoxCollection, 30, 0)];

    manager.batchGeometries(geometries1, 1);
    manager.batchGeometries(geometries2, 2);
    manager.batchGeometries(geometries3, 3);

    expect(geometryGroup.children.length).toBe(numberOfInstanceBuffers);
    expect(sum(geometryGroup.children.map(mesh => (mesh as THREE.InstancedMesh).count))).toBe(60);
  });

  test('batchGeometries() adds new geometry to group for new geometry type', () => {
    const geometries1 = [createParsedGeometry(RevealGeometryCollectionType.BoxCollection, 10, 0)];
    const geometries2 = [createParsedGeometry(RevealGeometryCollectionType.CircleCollection, 20, 1)];
    manager.batchGeometries(geometries1, 1);
    manager.batchGeometries(geometries2, 2);

    expect(geometryGroup.children.length).toBe(2 * numberOfInstanceBuffers);
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

    expect(geometryGroup.children.filter(mesh => mesh.visible).length).toBe(1);
    expect(sum(geometryGroup.children.map(mesh => mesh as THREE.InstancedMesh).map(mesh => mesh.count))).toBe(20);
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

    expect(geometryGroup.children[0].userData.treeIndices.size).toBe(0);

    expect(geometryGroup.children[1].userData.treeIndices.keys()).not.toContain(treeIndices1[0]);
    expect(geometryGroup.children[1].userData.treeIndices.keys()).not.toContain(treeIndices1[1]);
    expect(geometryGroup.children[1].userData.treeIndices.keys()).not.toContain(treeIndices1[2]);
    expect(geometryGroup.children[1].userData.treeIndices.keys()).toContain(treeIndices2[0]);
    expect(geometryGroup.children[1].userData.treeIndices.keys()).toContain(treeIndices2[1]);
    expect(geometryGroup.children[1].userData.treeIndices.keys()).toContain(treeIndices2[2]);
  });

  test('removeSectorBatches() preserves indices added more than once', () => {
    const treeIndices1 = [10, 20];
    const treeIndices2 = [30, 40];
    const treeIndices3 = [10, 50];

    const geometries1 = [
      createParsedGeometryWithTreeIndices(RevealGeometryCollectionType.BoxCollection, treeIndices1, 0)
    ];
    const geometries2 = [
      createParsedGeometryWithTreeIndices(RevealGeometryCollectionType.BoxCollection, treeIndices2, 0)
    ];
    const geometries3 = [
      createParsedGeometryWithTreeIndices(RevealGeometryCollectionType.BoxCollection, treeIndices3, 0)
    ];

    manager.batchGeometries(geometries1, 1);
    manager.batchGeometries(geometries2, 2);
    manager.batchGeometries(geometries3, 3);

    manager.removeSectorBatches(3);

    expect(geometryGroup.children[0].userData.treeIndices.size).toBe(2);
    expect(geometryGroup.children[0].userData.treeIndices.keys()).toContain(treeIndices1[0]);
    expect(geometryGroup.children[0].userData.treeIndices.keys()).toContain(treeIndices1[1]);
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
