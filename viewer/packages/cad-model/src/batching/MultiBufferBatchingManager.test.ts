/*!
 * Copyright 2021 Cognite AS
 */
import type { ParsedGeometry } from '@reveal/sector-parser';
import { RevealGeometryCollectionType } from '@reveal/sector-parser';
import {
  BufferAttribute,
  BufferGeometry,
  Group,
  InstancedMesh,
  InterleavedBuffer,
  InterleavedBufferAttribute
} from 'three';
import { Mock } from 'moq.ts';
import { vi } from 'vitest';
import type { Materials, StyledTreeIndexSets } from '@reveal/rendering';
import { MultiBufferBatchingManager } from './MultiBufferBatchingManager';
import { TreeIndexToSectorsMap } from '../utilities/TreeIndexToSectorsMap';
import { sum } from 'lodash-es';
import { DynamicDefragmentedBuffer, IndexSet, NumericRange } from '@reveal/utilities';
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
    return new MultiBufferBatchingManager(geometryGroup, materials, styledIndexSets, new TreeIndexToSectorsMap(10), {
      initialBufferSize: 1024,
      numberOfInstanceBatches: numberOfInstanceBuffers,
      additionalBufferThresholdBytes
    });
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

  test('dispose() removes all meshes and disposes their geometries', () => {
    manager.batchGeometries([createParsedGeometry(RevealGeometryCollectionType.BoxCollection, 10, 0)], 1);
    manager.batchGeometries([createParsedGeometry(RevealGeometryCollectionType.CircleCollection, 20, 1)], 2);
    const disposeSpies = getMeshes().map(mesh => vi.spyOn(mesh.geometry, 'dispose'));

    manager.dispose();

    expect(geometryGroup.children).toHaveLength(0);
    disposeSpies.forEach(disposeSpy => expect(disposeSpy).toHaveBeenCalledTimes(1));
  });

  test('dispose() frees the batches without removing the sectors from them one by one', () => {
    const removeSpy = vi.spyOn(DynamicDefragmentedBuffer.prototype, 'remove');
    for (let sectorId = 0; sectorId < 20; sectorId++) {
      manager.batchGeometries([createParsedGeometry(RevealGeometryCollectionType.BoxCollection, 10, 0)], sectorId);
    }

    manager.dispose();

    expect(removeSpy).not.toHaveBeenCalled();
    expect(geometryGroup.children).toHaveLength(0);
    removeSpy.mockRestore();
  });

  test('dispose() leaves the removed meshes empty', () => {
    manager.batchGeometries([createParsedGeometry(RevealGeometryCollectionType.BoxCollection, 10, 0)], 1);
    const mesh = getMeshes()[0];

    manager.dispose();

    expect(mesh.count).toBe(0);
    expect(mesh.visible).toBe(false);
    expect(mesh.layers.mask).toBe(0);
    expect(mesh.userData.treeIndices.size).toBe(0);
  });

  test('sectors can be added again after dispose()', () => {
    manager.batchGeometries([createParsedGeometry(RevealGeometryCollectionType.BoxCollection, 10, 0)], 1);
    manager.dispose();

    manager.batchGeometries([createParsedGeometry(RevealGeometryCollectionType.BoxCollection, 10, 0)], 1);

    expect(getMeshes()).toHaveLength(1);
    expect(getMeshes()[0].count).toBe(10);
    expect(() => manager.removeSectorBatches(1)).not.toThrow();
  });

  describe('batch buffer memory', () => {
    const initialBufferSize = 1024;

    function getTreeIndexAttribute(mesh: InstancedMesh): InterleavedBufferAttribute {
      const attribute = mesh.geometry.getAttribute('a_treeIndex');
      assert(attribute instanceof InterleavedBufferAttribute);
      return attribute;
    }

    function batchBoxSector(sectorId: number, treeIndices: number[]): ParsedGeometry {
      const geometry = createParsedGeometryWithTreeIndices(RevealGeometryCollectionType.BoxCollection, treeIndices, 0);
      manager.batchGeometries([geometry], sectorId);
      return geometry;
    }

    test('batchGeometries() lets the instance attributes of a mesh share one interleaved buffer', () => {
      batchBoxSector(1, [1, 2, 3]);

      const [mesh] = getMeshes();
      const interleavedBuffers = ['attribute1', 'attribute2', 'a_treeIndex'].map(name => {
        const attribute = mesh.geometry.getAttribute(name);
        assert(attribute instanceof InterleavedBufferAttribute);
        return attribute.data;
      });
      expect(new Set(interleavedBuffers).size).toBe(1);
    });

    test('batchGeometries() marks only the added range of the mesh buffer for upload', () => {
      const treeIndices = [1, 2, 3];
      const geometry = batchBoxSector(1, treeIndices);

      const [mesh] = getMeshes();
      const meshBuffer = getTreeIndexAttribute(mesh).data;
      expect(meshBuffer.array.byteLength).toBe(initialBufferSize);
      expect(meshBuffer.updateRanges).toEqual([{ start: 0, count: treeIndices.length * FLOATS_PER_ELEMENT }]);

      const sourceAttribute = geometry.geometryBuffer.getAttribute('a_treeIndex');
      assert(sourceAttribute instanceof InterleavedBufferAttribute);
      expect(sourceAttribute.data.updateRanges).toHaveLength(0);
    });

    test('removeSectorBatches() uploads nothing when the removed sector is last in the buffer', () => {
      batchBoxSector(1, [1, 2, 3]);
      batchBoxSector(2, [4, 5, 6]);
      const [mesh] = getMeshes();
      const meshBuffer = getTreeIndexAttribute(mesh).data;
      meshBuffer.clearUpdateRanges();
      const versionBeforeRemoval = meshBuffer.version;

      manager.removeSectorBatches(2);

      expect(meshBuffer.updateRanges).toHaveLength(0);
      expect(meshBuffer.version).toBe(versionBeforeRemoval);
    });

    test('removeSectorBatches() shrinks the mesh buffer and keeps the remaining instances', () => {
      const keptTreeIndices = [10, 20, 30];
      batchBoxSector(1, keptTreeIndices);
      batchBoxSector(2, Array<number>(400).fill(5));
      const [mesh] = getMeshes();
      const grownGeometry = mesh.geometry;
      expect(getTreeIndexAttribute(mesh).data.array.byteLength).toBeGreaterThan(initialBufferSize);

      manager.removeSectorBatches(2);

      const treeIndexAttribute = getTreeIndexAttribute(mesh);
      expect(mesh.geometry).not.toBe(grownGeometry);
      expect(treeIndexAttribute.data.array.byteLength).toBe(initialBufferSize);
      expect(mesh.count).toBe(keptTreeIndices.length);
      expect(keptTreeIndices.map((_, i) => treeIndexAttribute.getX(i))).toEqual(keptTreeIndices);
      expect([...mesh.userData.treeIndices.keys()]).toEqual(keptTreeIndices);
    });

    test('removeSectorBatches() removes the meshes of a geometry type that no sector uses anymore', () => {
      batchBoxSector(1, [1, 2, 3]);
      manager.batchGeometries([createParsedGeometry(RevealGeometryCollectionType.CircleCollection, 20, 1)], 2);
      const [boxMesh, circleMesh] = getMeshes();
      const disposeBoxGeometry = vi.spyOn(boxMesh.geometry, 'dispose');

      manager.removeSectorBatches(1);

      expect(getMeshes()).toEqual([circleMesh]);
      expect(disposeBoxGeometry).toHaveBeenCalledTimes(1);
    });

    test('batchGeometries() creates a new mesh for a geometry type whose meshes were removed', () => {
      const treeIndices = [4, 5, 6];
      batchBoxSector(1, [1, 2, 3]);
      manager.removeSectorBatches(1);
      expect(geometryGroup.children).toHaveLength(0);

      batchBoxSector(2, treeIndices);

      const [mesh] = getMeshes();
      expect(mesh.count).toBe(treeIndices.length);
      expect([...mesh.userData.treeIndices.keys()]).toEqual(treeIndices);
    });
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

describe(`${MultiBufferBatchingManager.name} compact proxies`, () => {
  let geometryGroup: Group;
  let manager: MultiBufferBatchingManager;
  let styledIndexSets: StyledTreeIndexSets;
  let onCompactProxiesRebuilt: () => void;
  let styledSetsVersion: number;

  beforeEach(() => {
    vi.useFakeTimers();
    onCompactProxiesRebuilt = vi.fn();
    styledSetsVersion = 0;
    geometryGroup = new Group();
    styledIndexSets = {
      back: new IndexSet(new NumericRange(0, 100)),
      ghost: new IndexSet(),
      inFront: new IndexSet(),
      visible: new IndexSet([2])
    };
    manager = new MultiBufferBatchingManager(
      geometryGroup,
      new Mock<Materials>().object(),
      styledIndexSets,
      new TreeIndexToSectorsMap(100),
      {
        initialBufferSize: 1024,
        numberOfInstanceBatches: 1,
        compactProxyHooks: { onDeferredRebuild: onCompactProxiesRebuilt, getStyledSetsVersion: () => styledSetsVersion }
      }
    );
    manager.setCompactProxiesEnabled(true);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const batchMesh = (): InstancedMesh => {
    const mesh = geometryGroup.children.find(c => !c.userData.isCompactProxy);
    assert(mesh instanceof InstancedMesh);
    return mesh;
  };
  const proxyMesh = (): InstancedMesh | undefined => {
    const mesh = geometryGroup.children.find(c => c.userData.isCompactProxy);
    assert(mesh === undefined || mesh instanceof InstancedMesh);
    return mesh;
  };
  const requireProxyMesh = (): InstancedMesh => {
    const mesh = proxyMesh();
    assert(mesh !== undefined);
    return mesh;
  };
  const proxyTreeIndices = () => {
    const proxy = requireProxyMesh();
    const attribute = proxy.geometry.getAttribute('a_treeIndex');
    return Array.from({ length: proxy.count }, (_, i) => attribute.getX(i));
  };

  test('updateCompactProxies() draws only visible instances through a proxy', () => {
    manager.batchGeometries([createGeometry([1, 2, 3, 4, 5])], 1);

    manager.updateCompactProxies();

    expect(proxyTreeIndices()).toEqual([2]);
    expect(requireProxyMesh().layers.mask).not.toBe(0);
    expect(batchMesh().layers.mask).toBe(0);
  });

  test('adding a sector with only hidden instances keeps the batch mesh disabled', () => {
    manager.batchGeometries([createGeometry([1, 2, 3, 4, 5])], 1);
    manager.updateCompactProxies();

    manager.batchGeometries([createGeometry([6, 7, 8])], 2);

    expect(batchMesh().layers.mask).toBe(0);
    expect(proxyTreeIndices()).toEqual([2]);
  });

  test('adding a sector with visible instances draws the batch mesh until the proxy is rebuilt', () => {
    manager.batchGeometries([createGeometry([1, 2, 3, 4, 5])], 1);
    manager.updateCompactProxies();

    manager.batchGeometries([createGeometry([2, 9, 10, 11])], 2);
    manager.batchGeometries([createGeometry([12, 13])], 3);

    expect(batchMesh().layers.mask).not.toBe(0);

    vi.advanceTimersByTime(200);

    expect(proxyTreeIndices()).toEqual([2, 2]);
    expect(batchMesh().layers.mask).toBe(0);
  });

  test('removing the sector holding visible instances rebuilds the proxy', () => {
    manager.batchGeometries([createGeometry([1, 3, 4, 5])], 1);
    manager.batchGeometries([createGeometry([2, 6, 7, 8])], 2);
    manager.updateCompactProxies();

    manager.removeSectorBatches(2);
    vi.advanceTimersByTime(200);

    expect(proxyMesh()).toBeUndefined();
    expect(batchMesh().layers.mask).toBe(0);
  });

  test('the deferred rebuild after removing visible instances requests a redraw', () => {
    manager.batchGeometries([createGeometry([1, 3, 4, 5])], 1);
    manager.batchGeometries([createGeometry([2, 6, 7, 8])], 2);
    manager.updateCompactProxies();

    manager.removeSectorBatches(2);

    expect(onCompactProxiesRebuilt).not.toHaveBeenCalled();

    vi.advanceTimersByTime(200);

    expect(onCompactProxiesRebuilt).toHaveBeenCalledTimes(1);
  });

  test('the deferred rebuild after adding visible instances requests a redraw', () => {
    manager.batchGeometries([createGeometry([1, 2, 3, 4, 5])], 1);
    manager.updateCompactProxies();

    manager.batchGeometries([createGeometry([2, 9, 10, 11])], 2);
    vi.advanceTimersByTime(200);

    expect(onCompactProxiesRebuilt).toHaveBeenCalledTimes(1);
  });

  test('adding or removing only hidden instances does not request a redraw', () => {
    manager.batchGeometries([createGeometry([1, 2, 3, 4, 5])], 1);
    manager.updateCompactProxies();

    manager.batchGeometries([createGeometry([6, 7, 8])], 2);
    manager.removeSectorBatches(2);
    vi.advanceTimersByTime(200);

    expect(onCompactProxiesRebuilt).not.toHaveBeenCalled();
  });

  test('a sector added after a styling change is classified with the new visibility', () => {
    manager.batchGeometries([createGeometry([1, 2, 3, 4, 5])], 1);
    manager.updateCompactProxies();

    // The styled sets change, but updateCompactProxies() has not been called yet
    styledIndexSets.visible.add(9);
    styledSetsVersion++;
    manager.batchGeometries([createGeometry([9, 10, 11, 12])], 2);

    expect(batchMesh().layers.mask).not.toBe(0);

    vi.advanceTimersByTime(200);

    expect(proxyTreeIndices()).toEqual([2, 9]);
    expect(batchMesh().layers.mask).toBe(0);
  });

  test('updateCompactProxies() does not recompute batch layers when told they are current', () => {
    manager.batchGeometries([createGeometry([1, 2, 3, 4, 5])], 1);
    const intersectionSpy = vi.spyOn(styledIndexSets.visible, 'hasIntersectionWithMap');

    manager.updateCompactProxies({ batchLayersAreCurrent: true });

    expect(intersectionSpy).not.toHaveBeenCalled();
    expect(proxyTreeIndices()).toEqual([2]);
    expect(batchMesh().layers.mask).toBe(0);
  });

  test('a rebuilt proxy only uploads the instances in use', () => {
    manager.batchGeometries([createGeometry([1, 2, 3, 4, 5])], 1);

    manager.updateCompactProxies();

    const attribute = requireProxyMesh().geometry.getAttribute('a_treeIndex');
    assert(attribute instanceof InterleavedBufferAttribute);
    expect(attribute.data.updateRanges).toEqual([{ start: 0, count: attribute.data.stride }]);
  });

  test('no proxy is used when most instances are visible', () => {
    styledIndexSets.visible.addRange(new NumericRange(1, 4));
    manager.batchGeometries([createGeometry([1, 2, 3, 4, 5])], 1);

    manager.updateCompactProxies();

    expect(proxyMesh()).toBeUndefined();
    expect(batchMesh().layers.mask).not.toBe(0);
  });

  test('removing many sectors in one pass defers the proxy rebuild to a single update', () => {
    for (let sectorId = 1; sectorId <= 20; sectorId++) {
      manager.batchGeometries([createGeometry([2, 50 + sectorId])], sectorId);
    }
    manager.updateCompactProxies();

    for (let sectorId = 1; sectorId <= 19; sectorId++) {
      manager.removeSectorBatches(sectorId);
    }

    // Not rebuilt yet: the proxy still holds the visible instance of every sector
    expect(onCompactProxiesRebuilt).not.toHaveBeenCalled();
    expect(requireProxyMesh().count).toBe(20);
    expect(requireProxyMesh().layers.mask).not.toBe(0);

    vi.advanceTimersByTime(200);

    expect(onCompactProxiesRebuilt).toHaveBeenCalledTimes(1);
    expect(requireProxyMesh().count).toBe(1);
    expect(batchMesh().count).toBe(2);
  });

  test('when disabled, layers are recomputed immediately on removal as in the original behaviour', () => {
    manager.setCompactProxiesEnabled(false);
    manager.batchGeometries([createGeometry([2, 3])], 1);
    manager.batchGeometries([createGeometry([4, 5])], 2);
    expect(batchMesh().layers.mask).not.toBe(0);

    manager.removeSectorBatches(1);

    expect(batchMesh().layers.mask).toBe(0);
    expect(proxyMesh()).toBeUndefined();
  });

  test('when disabled, adding visible instances enables layers immediately', () => {
    manager.setCompactProxiesEnabled(false);
    manager.batchGeometries([createGeometry([4, 5])], 1);
    expect(batchMesh().layers.mask).toBe(0);

    manager.batchGeometries([createGeometry([2, 6])], 2);

    expect(batchMesh().layers.mask).not.toBe(0);
    expect(proxyMesh()).toBeUndefined();
  });

  test('disabling removes existing proxies and renders the batch mesh again', () => {
    manager.batchGeometries([createGeometry([1, 2, 3, 4, 5])], 1);
    manager.updateCompactProxies();
    expect(proxyMesh()).toBeDefined();

    manager.setCompactProxiesEnabled(false);

    expect(proxyMesh()).toBeUndefined();
    expect(batchMesh().layers.mask).not.toBe(0);
  });

  test('dispose() removes proxies, releases their geometry and cancels a pending rebuild', () => {
    manager.batchGeometries([createGeometry([1, 3, 4, 5])], 1);
    manager.batchGeometries([createGeometry([2, 6, 7, 8])], 2);
    manager.batchGeometries([createGeometry([2, 9, 10, 11])], 3);
    manager.updateCompactProxies();
    // Removing visible instances leaves a rebuild pending
    manager.removeSectorBatches(3);
    const disposeSpy = vi.spyOn(requireProxyMesh().geometry, 'dispose');

    manager.dispose();
    vi.advanceTimersByTime(200);

    expect(geometryGroup.children).toHaveLength(0);
    expect(disposeSpy).toHaveBeenCalledTimes(1);
    expect(onCompactProxiesRebuilt).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  test('a removed proxy releases its geometry', () => {
    manager.batchGeometries([createGeometry([1, 2, 3, 4, 5])], 1);
    manager.updateCompactProxies();
    const disposeSpy = vi.spyOn(requireProxyMesh().geometry, 'dispose');

    manager.setCompactProxiesEnabled(false);

    expect(disposeSpy).toHaveBeenCalledTimes(1);
  });

  test('a proxy owns copies of the template attributes of the batch', () => {
    const geometry = createGeometry([1, 2, 3, 4, 5]);
    geometry.geometryBuffer.setAttribute('position', new BufferAttribute(new Float32Array([0, 1, 2]), 3));
    geometry.geometryBuffer.setIndex([0]);
    manager.batchGeometries([geometry], 1);

    manager.updateCompactProxies();

    const proxyGeometry = requireProxyMesh().geometry;
    const batchGeometry = batchMesh().geometry;
    expect(proxyGeometry.getAttribute('position')).not.toBe(batchGeometry.getAttribute('position'));
    expect(Array.from(proxyGeometry.getAttribute('position').array)).toEqual([0, 1, 2]);
    expect(proxyGeometry.getIndex()).not.toBe(batchGeometry.getIndex());
    const proxyIndex = proxyGeometry.getIndex();
    assert(proxyIndex !== null);
    expect(Array.from(proxyIndex.array)).toEqual([0]);
  });

  test('a newly filled batch mesh is never in the default render layer', () => {
    manager.batchGeometries([createGeometry([1, 2, 3, 4, 5])], 1);

    expect(batchMesh().layers.isEnabled(0)).toBe(false);
    expect(batchMesh().layers.mask).not.toBe(0);
  });

  function createGeometry(treeIndices: number[]) {
    return createParsedGeometryWithTreeIndices(RevealGeometryCollectionType.BoxCollection, treeIndices, 0);
  }
});

test(`${MultiBufferBatchingManager.name} does not create compact proxies by default`, () => {
  const geometryGroup = new Group();
  const visible = new IndexSet([2]);
  // The lookup of visible nodes is built from the ranges of the visible set
  const visibleRangesSpy = vi.spyOn(visible, 'toRangeArray');
  const manager = new MultiBufferBatchingManager(
    geometryGroup,
    new Mock<Materials>().object(),
    {
      back: new IndexSet(new NumericRange(0, 100)),
      ghost: new IndexSet(),
      inFront: new IndexSet(),
      visible
    },
    new TreeIndexToSectorsMap(100),
    { initialBufferSize: 1024, numberOfInstanceBatches: 1 }
  );
  manager.batchGeometries(
    [createParsedGeometryWithTreeIndices(RevealGeometryCollectionType.BoxCollection, [1, 2, 3, 4, 5], 0)],
    1
  );

  manager.updateCompactProxies();
  manager.removeSectorBatches(1);

  expect(geometryGroup.children.some(child => child.userData.isCompactProxy)).toBe(false);
  expect(visibleRangesSpy).not.toHaveBeenCalled();
});

test(`${MultiBufferBatchingManager.name} renders batches in their render layers by default`, () => {
  const geometryGroup = new Group();
  const manager = new MultiBufferBatchingManager(
    geometryGroup,
    new Mock<Materials>().object(),
    {
      back: new IndexSet(new NumericRange(0, 100)),
      ghost: new IndexSet(),
      inFront: new IndexSet(),
      visible: new IndexSet([2])
    },
    new TreeIndexToSectorsMap(100),
    { initialBufferSize: 1024, numberOfInstanceBatches: 1 }
  );

  manager.batchGeometries(
    [createParsedGeometryWithTreeIndices(RevealGeometryCollectionType.BoxCollection, [1, 2, 3, 4, 5], 0)],
    1
  );

  expect(geometryGroup.children[0].layers.mask).not.toBe(0);
  expect(geometryGroup.children[0].layers.isEnabled(0)).toBe(false);
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
