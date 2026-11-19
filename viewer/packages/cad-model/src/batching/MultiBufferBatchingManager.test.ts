/*!
 * Copyright 2021 Cognite AS
 */
import type { ParsedGeometry } from '@reveal/sector-parser';
import { RevealGeometryCollectionType } from '@reveal/sector-parser';
import { BufferGeometry, Group, InstancedMesh, InterleavedBuffer, InterleavedBufferAttribute } from 'three';
import { Mock } from 'moq.ts';
import type { Materials, StyledTreeIndexSets } from '@reveal/rendering';
import { MultiBufferBatchingManager } from './MultiBufferBatchingManager';
import { TreeIndexToSectorsMap } from '../utilities/TreeIndexToSectorsMap';
import { sum } from 'lodash-es';
import { IndexSet } from '@reveal/utilities';
import { assert } from '@reveal/utilities/assert';

describe(MultiBufferBatchingManager.name, () => {
  let geometryGroup: Group;
  let manager: MultiBufferBatchingManager;
  const numberOfInstanceBuffers = 2;

  function createManager(additionalBufferThresholdBytes?: number): MultiBufferBatchingManager {
    const materials = new Mock<Materials>().object();
    const styledIndexSets: StyledTreeIndexSets = {
      back: new IndexSet(),
      ghost: new IndexSet(),
      inFront: new IndexSet(),
      visible: new IndexSet()
    };
    return new MultiBufferBatchingManager(
      geometryGroup,
      materials,
      styledIndexSets,
      new TreeIndexToSectorsMap(10),
      1024,
      numberOfInstanceBuffers,
      additionalBufferThresholdBytes
    );
  }

  function getMeshes(): InstancedMesh[] {
    return geometryGroup.children.map(child => {
      assert(child instanceof InstancedMesh);
      return child;
    });
  }

  beforeEach(() => {
    geometryGroup = new Group();
    manager = createManager();
  });

  test('batchGeometries() first time adds new geometry to group', () => {
    const geometries = [createParsedGeometry(RevealGeometryCollectionType.BoxCollection, 10, 0)];
    manager.batchGeometries(geometries, 1);

    expect(geometryGroup.children.length).toBe(1);
  });

  test('batchGeometries() second time with same geometry type doesnt add new geometry to group', () => {
    const geometries1 = [createParsedGeometry(RevealGeometryCollectionType.BoxCollection, 10, 0)];
    const geometries2 = [createParsedGeometry(RevealGeometryCollectionType.BoxCollection, 20, 0)];
    const geometries3 = [createParsedGeometry(RevealGeometryCollectionType.BoxCollection, 30, 0)];

    manager.batchGeometries(geometries1, 1);
    manager.batchGeometries(geometries2, 2);
    manager.batchGeometries(geometries3, 3);

    expect(geometryGroup.children.length).toBe(1);
    expect(sum(getMeshes().map(mesh => mesh.count))).toBe(60);
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

    expect(geometryGroup.children.filter(mesh => mesh.visible).length).toBe(1);
    expect(sum(getMeshes().map(mesh => mesh.count))).toBe(20);
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

    expect(geometryGroup.children[0].userData.treeIndices.size).toBe(treeIndices2.length);

    expect(geometryGroup.children[0].userData.treeIndices.keys()).not.toContain(treeIndices1[0]);
    expect(geometryGroup.children[0].userData.treeIndices.keys()).not.toContain(treeIndices1[1]);
    expect(geometryGroup.children[0].userData.treeIndices.keys()).not.toContain(treeIndices1[2]);
    expect(geometryGroup.children[0].userData.treeIndices.keys()).toContain(treeIndices2[0]);
    expect(geometryGroup.children[0].userData.treeIndices.keys()).toContain(treeIndices2[1]);
    expect(geometryGroup.children[0].userData.treeIndices.keys()).toContain(treeIndices2[2]);
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

    expect(geometryGroup.children[0].userData.treeIndices.size).toBe(4);
    expect(geometryGroup.children[0].userData.treeIndices.keys()).toContain(treeIndices1[0]);
    expect(geometryGroup.children[0].userData.treeIndices.keys()).toContain(treeIndices1[1]);
    expect(geometryGroup.children[0].userData.treeIndices.keys()).not.toContain(treeIndices3[1]);
  });

  test('removeSectorBatches() ignores invalid sectorId', () => {
    expect(() => manager.removeSectorBatches(2)).not.toThrow();
  });

  describe('with additional buffers allocated on demand', () => {
    const elementsPerSector = 10;
    const bytesPerSector = elementsPerSector * BYTES_PER_ELEMENT;

    function batchBoxSector(sectorId: number, treeIndices: number[] = Array<number>(elementsPerSector)): void {
      const geometries = [
        createParsedGeometryWithTreeIndices(RevealGeometryCollectionType.BoxCollection, treeIndices, 0)
      ];
      manager.batchGeometries(geometries, sectorId);
    }

    test.each([Number.NaN, -1])('constructor throws for an additional buffer threshold of %s', threshold => {
      expect(() => createManager(threshold)).toThrow('additionalBufferThresholdBytes must be zero or greater');
    });

    test('batchGeometries() keeps a single mesh while the buffer is smaller than the threshold', () => {
      manager = createManager(3 * bytesPerSector + 1);

      batchBoxSector(1);
      batchBoxSector(2);
      batchBoxSector(3);

      expect(geometryGroup.children.length).toBe(1);
      expect(getMeshes()[0].count).toBe(3 * elementsPerSector);
    });

    test('batchGeometries() adds a mesh and fills it once the buffer has reached the threshold', () => {
      manager = createManager(bytesPerSector);

      batchBoxSector(1);
      expect(geometryGroup.children.length).toBe(1);

      batchBoxSector(2);

      expect(geometryGroup.children.length).toBe(2);
      expect(getMeshes().map(mesh => mesh.count)).toEqual([elementsPerSector, elementsPerSector]);
      expect(getMeshes().every(mesh => mesh.visible)).toBe(true);
    });

    test('batchGeometries() gives the added mesh the same attributes as the first one', () => {
      manager = createManager(bytesPerSector);

      batchBoxSector(1);
      batchBoxSector(2);

      const [firstMesh, addedMesh] = getMeshes();
      expect(Object.keys(addedMesh.geometry.attributes)).toEqual(Object.keys(firstMesh.geometry.attributes));
    });

    test('batchGeometries() never adds more meshes than the number of instance buffers', () => {
      manager = createManager(bytesPerSector);

      for (let sectorId = 1; sectorId <= 6; sectorId++) {
        batchBoxSector(sectorId);
      }

      expect(geometryGroup.children.length).toBe(numberOfInstanceBuffers);
      expect(sum(getMeshes().map(mesh => mesh.count))).toBe(6 * elementsPerSector);
    });

    test('batchGeometries() adds tree indices to the added mesh only', () => {
      manager = createManager(3 * BYTES_PER_ELEMENT);
      const treeIndices1 = [10, 20, 30];
      const treeIndices2 = [40, 50, 60];

      batchBoxSector(1, treeIndices1);
      batchBoxSector(2, treeIndices2);

      const [firstMesh, addedMesh] = getMeshes();
      expect([...firstMesh.userData.treeIndices.keys()]).toEqual(treeIndices1);
      expect([...addedMesh.userData.treeIndices.keys()]).toEqual(treeIndices2);
    });

    test('removeSectorBatches() removes a sector from the added mesh', () => {
      manager = createManager(bytesPerSector);
      batchBoxSector(1);
      batchBoxSector(2);

      manager.removeSectorBatches(2);

      const [firstMesh, addedMesh] = getMeshes();
      expect(firstMesh.count).toBe(elementsPerSector);
      expect(firstMesh.visible).toBe(true);
      expect(addedMesh.count).toBe(0);
      expect(addedMesh.visible).toBe(false);
      expect(addedMesh.userData.treeIndices.size).toBe(0);
    });
  });
});

const FLOATS_PER_ELEMENT = 3;
const BYTES_PER_ELEMENT = FLOATS_PER_ELEMENT * Float32Array.BYTES_PER_ELEMENT;

function createParsedGeometry(type: RevealGeometryCollectionType, elementCount: number, instanceId: number) {
  return createParsedGeometryWithTreeIndices(type, Array<number>(elementCount), instanceId);
}

function createParsedGeometryWithTreeIndices(
  type: RevealGeometryCollectionType,
  treeIndices: number[],
  instanceId: number
): ParsedGeometry {
  const buffer = new InterleavedBuffer(new Float32Array(3 * treeIndices.length), 3);
  const geometryBuffer = new BufferGeometry();
  geometryBuffer.setAttribute('attribute1', new InterleavedBufferAttribute(buffer, 1, 0));
  geometryBuffer.setAttribute('attribute2', new InterleavedBufferAttribute(buffer, 1, 1));

  const treeIndexAttribute = new InterleavedBufferAttribute(buffer, 1, 2);

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
