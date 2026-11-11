/*!
 * Copyright 2021 Cognite AS
 */
import type { ParsedGeometry } from '@reveal/sector-parser';
import { RevealGeometryCollectionType } from '@reveal/sector-parser';
import type { InstancedMesh } from 'three';
import { BufferAttribute, BufferGeometry, Group, InterleavedBuffer, InterleavedBufferAttribute } from 'three';
import { Mock } from 'moq.ts';
import type { Materials, StyledTreeIndexSets } from '@reveal/rendering';
import { MultiBufferBatchingManager } from './MultiBufferBatchingManager';
import { TreeIndexToSectorsMap } from '../utilities/TreeIndexToSectorsMap';
import { sum } from 'lodash-es';
import { IndexSet, NumericRange } from '@reveal/utilities';
import { vi } from 'vitest';

describe(MultiBufferBatchingManager.name, () => {
  let geometryGroup: Group;
  let manager: MultiBufferBatchingManager;
  const numberOfInstanceBuffers = 2;
  beforeEach(() => {
    geometryGroup = new Group();
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
    expect(sum(geometryGroup.children.map(mesh => (mesh as InstancedMesh).count))).toBe(60);
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
    expect(sum(geometryGroup.children.map(mesh => mesh as InstancedMesh).map(mesh => mesh.count))).toBe(20);
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
      1024,
      1,
      { onDeferredRebuild: onCompactProxiesRebuilt, getStyledSetsVersion: () => styledSetsVersion }
    );
    manager.setCompactProxiesEnabled(true);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const batchMesh = () => geometryGroup.children.find(c => !c.userData.isCompactProxy) as InstancedMesh;
  const proxyMesh = () => geometryGroup.children.find(c => c.userData.isCompactProxy) as InstancedMesh | undefined;
  const proxyTreeIndices = () => {
    const proxy = proxyMesh()!;
    const attribute = proxy.geometry.getAttribute('a_treeIndex');
    return Array.from({ length: proxy.count }, (_, i) => attribute.getX(i));
  };

  test('updateCompactProxies() draws only visible instances through a proxy', () => {
    manager.batchGeometries([createGeometry([1, 2, 3, 4, 5])], 1);

    manager.updateCompactProxies();

    expect(proxyTreeIndices()).toEqual([2]);
    expect(proxyMesh()!.layers.mask).not.toBe(0);
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

    const attribute = proxyMesh()!.geometry.getAttribute('a_treeIndex') as InterleavedBufferAttribute;
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
    const updateSpy = vi.spyOn(manager as unknown as { updateCompactProxy: () => void }, 'updateCompactProxy');

    for (let sectorId = 1; sectorId <= 19; sectorId++) {
      manager.removeSectorBatches(sectorId);
    }

    expect(updateSpy).not.toHaveBeenCalled();
    expect(proxyMesh()!.layers.mask).not.toBe(0);

    vi.advanceTimersByTime(200);

    expect(updateSpy).toHaveBeenCalledTimes(1);
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

  test('a removed proxy releases its geometry', () => {
    manager.batchGeometries([createGeometry([1, 2, 3, 4, 5])], 1);
    manager.updateCompactProxies();
    const disposeSpy = vi.spyOn(proxyMesh()!.geometry, 'dispose');

    manager.setCompactProxiesEnabled(false);

    expect(disposeSpy).toHaveBeenCalledTimes(1);
  });

  test('a proxy owns copies of the template attributes of the batch', () => {
    const geometry = createGeometry([1, 2, 3, 4, 5]);
    geometry.geometryBuffer.setAttribute('position', new BufferAttribute(new Float32Array([0, 1, 2]), 3));
    geometry.geometryBuffer.setIndex([0]);
    manager.batchGeometries([geometry], 1);

    manager.updateCompactProxies();

    const proxyGeometry = proxyMesh()!.geometry;
    const batchGeometry = batchMesh().geometry;
    expect(proxyGeometry.getAttribute('position')).not.toBe(batchGeometry.getAttribute('position'));
    expect(Array.from(proxyGeometry.getAttribute('position').array)).toEqual([0, 1, 2]);
    expect(proxyGeometry.getIndex()).not.toBe(batchGeometry.getIndex());
    expect(Array.from(proxyGeometry.getIndex()!.array)).toEqual([0]);
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
    1024,
    1
  );
  const visibleLookupSpy = vi.spyOn(manager as unknown as { getVisibleLookup: () => Uint8Array }, 'getVisibleLookup');
  manager.batchGeometries(
    [createParsedGeometryWithTreeIndices(RevealGeometryCollectionType.BoxCollection, [1, 2, 3, 4, 5], 0)],
    1
  );

  manager.updateCompactProxies();
  manager.removeSectorBatches(1);

  expect(geometryGroup.children.some(child => child.userData.isCompactProxy)).toBe(false);
  expect(visibleLookupSpy).not.toHaveBeenCalled();
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
    1024,
    1
  );

  manager.batchGeometries(
    [createParsedGeometryWithTreeIndices(RevealGeometryCollectionType.BoxCollection, [1, 2, 3, 4, 5], 0)],
    1
  );

  expect(geometryGroup.children[0].layers.mask).not.toBe(0);
  expect(geometryGroup.children[0].layers.isEnabled(0)).toBe(false);
});

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
