/*!
 * Copyright 2023 Cognite AS
 */
import { assert } from '@reveal/utilities/assert';
import { minBy } from 'lodash-es';
import type { Group, RawShaderMaterial } from 'three';
import {
  BufferAttribute,
  BufferGeometry,
  InstancedMesh,
  InterleavedBufferAttribute,
  Object3D,
  Sphere,
  type Camera,
  type Matrix4,
  type Mesh,
  type Vector3
} from 'three';
import type { Materials, StyledTreeIndexSets } from '@reveal/rendering';
import { setModelRenderLayers } from '@reveal/rendering';
import type { ParsedGeometry, RevealGeometryCollectionType } from '@reveal/sector-parser';
import type { TypedArray } from '@reveal/utilities';
import { decrementOrDeleteIndex, DynamicDefragmentedBuffer, incrementOrInsertIndex } from '@reveal/utilities';
import { GeometryBufferUtils } from '../utilities/GeometryBufferUtils';
import { getShaderMaterial } from '../utilities/getShaderMaterial';
import type { TreeIndexToSectorsMap } from '../utilities/TreeIndexToSectorsMap';
import type { DrawCallBatchingManager } from './DrawCallBatchingManager';

/**
 * Maps all the instances(by and id: string) that a sector has to a SectorInstanceData that point to underlying batches
 */
type SectorBatch = {
  instanceBatches: Map<string, SectorInstanceData>;
};

/**
 * Contains information of a specific instance in a specific sector.
 * batchBuffer is a reference to the underlying buffer, and batchId
 * is a reference to the position and size of the data within the underlying DefragmentedBuffer
 */
type SectorInstanceData = {
  batchBuffer: BatchBuffer;
  batchId: number;
  instanceCount: number;
};

/**
 * References all the underlying data buffers for a specific instance
 */
type InstanceBatch = {
  buffers: BatchBuffer[];
  type: RevealGeometryCollectionType;
};

/**
 * Structure containing the DefragmentedBuffer (where the data is actually stored), and the mesh
 * which uses this buffer.
 */
type BatchBuffer = {
  mesh: InstancedMesh;
  buffer: DynamicDefragmentedBuffer<Uint8Array<ArrayBuffer>>;
  compactProxy?: CompactProxy;
};

/**
 * Instanced mesh holding a copy of only the visible instances of a batch.
 * Rendered instead of the batch mesh when few of its instances are visible,
 * so hidden instances are not processed by the GPU.
 */
type CompactProxy = {
  mesh: InstancedMesh;
  data: Uint8Array<ArrayBuffer>;
};

/**
 * Hooks to the owner of the batching manager, used when compact proxies are enabled.
 */
export type CompactProxyHooks = {
  /**
   * Called when compact proxies have been rebuilt outside a call from the owner (the deferred
   * rebuild after sectors are added or removed), so the owner can request a redraw.
   */
  onDeferredRebuild?: () => void;
  /**
   * Returns a number that changes whenever the set of visible nodes changes. Used to detect that the
   * cached lookup of visible nodes is outdated, and to skip rebuilding compact proxies when a
   * styling change keeps the visible nodes as they are.
   */
  getVisibleNodesVersion?: () => number;
};

/**
 * Optional settings for {@link MultiBufferBatchingManager}.
 */
export type MultiBufferBatchingManagerOptions = {
  /** Initial size of each batch buffer. Default 1024. */
  initialBufferSize?: number;
  /** Maximum number of buffers (draw calls) per instanced type. Default 2. */
  numberOfInstanceBatches?: number;
  /** Size each buffer of a type must reach before the type gets another buffer. Default 256 KiB. */
  additionalBufferThresholdBytes?: number;
  /** Hooks used when compact proxies are enabled. */
  compactProxyHooks?: CompactProxyHooks;
};

const compactProxyMaxVisibleRatio = 0.5;
const compactProxyUpdateThrottleDelay = 75;

/**
 * The objective of this class is to batch together instances
 * of the same type from different sectors.
 * This is done to reduce the number of draw calls that have to be issued during rendering.
 * Essentially this works by allocating up to n (numberOfInstanceBatches) buffers for each unique instanced type
 * and continually filling / ejecting data from those buffers when new sectors are added / removed.
 * Each buffer is a draw call, so a type starts with one buffer and gets another one only when its buffers hold
 * at least additionalBufferThresholdBytes each.
 */
export class MultiBufferBatchingManager implements DrawCallBatchingManager {
  private readonly _sectorBatches: Map<number, SectorBatch>;
  private readonly _instanceBatches: Map<string, InstanceBatch>;
  private readonly _materials: Materials;
  private readonly _batchGroup: Group;
  private readonly _styledTreeIndexSets: StyledTreeIndexSets;
  private readonly _dirtyCompactProxyBuffers = new Set<BatchBuffer>();
  private _compactProxyFlushTimer: ReturnType<typeof setTimeout> | undefined;
  private _visibleLookup = new Uint8Array(0);
  private _visibleLookupNeedsUpdate = true;
  private _visibleLookupVersion = 0;
  // Visible nodes version all compact proxies were last rebuilt with; undefined forces a full rebuild
  private _compactProxiesVisibleNodesVersion: number | undefined;
  private readonly _layerMaskScratch = new Object3D();
  private _compactProxiesEnabled = false;
  private readonly initialBufferSize: number;
  private readonly numberOfInstanceBatches: number;
  private readonly additionalBufferThresholdBytes: number;
  private readonly compactProxyHooks: CompactProxyHooks;

  constructor(
    batchGroup: Group,
    materials: Materials,
    styleTreeIndexSets: StyledTreeIndexSets,
    private readonly treeIndexToSectorsMap: TreeIndexToSectorsMap,
    options: MultiBufferBatchingManagerOptions = {}
  ) {
    this.initialBufferSize = options.initialBufferSize ?? 1024;
    this.numberOfInstanceBatches = options.numberOfInstanceBatches ?? 2;
    this.additionalBufferThresholdBytes = options.additionalBufferThresholdBytes ?? 256 * 1024;
    this.compactProxyHooks = options.compactProxyHooks ?? {};
    assert(this.additionalBufferThresholdBytes >= 0, 'additionalBufferThresholdBytes must be zero or greater');
    this._sectorBatches = new Map();
    this._instanceBatches = new Map();
    this._materials = materials;
    this._batchGroup = batchGroup;
    this._styledTreeIndexSets = styleTreeIndexSets;
  }

  public batchGeometries(geometryBatchingQueue: ParsedGeometry[], sectorId: number): void {
    if (this._sectorBatches.has(sectorId)) {
      return;
    }
    const sectorBatch = this.createSectorBatch(sectorId);
    geometryBatchingQueue.forEach(parsedGeometry => {
      // If instanceId is undefined, then the current geometry is a unique mesh
      // and should not be runtime batched.
      if (parsedGeometry.instanceId === undefined) {
        return;
      }
      this.processGeometries(parsedGeometry as Required<ParsedGeometry>, sectorBatch, sectorId);
    });
  }

  public removeSectorBatches(sectorId: number): void {
    const sectorBatch = this._sectorBatches.get(sectorId);

    if (sectorBatch === undefined) {
      return;
    }

    sectorBatch.instanceBatches.forEach(({ batchBuffer, batchId, instanceCount }) => {
      const { buffer, mesh } = batchBuffer;

      const instanceAttributes = GeometryBufferUtils.getAttributes(mesh.geometry, InterleavedBufferAttribute);
      const batchUpdateRange = buffer.getRangeForBatchId(batchId);
      const removedVisibleInstances = this.removeTreeIndicesFromMeshUserData(
        mesh,
        batchUpdateRange,
        instanceAttributes
      );

      const { byteOffset, byteCount, bufferIsReallocated } = buffer.remove(batchId);

      if (bufferIsReallocated) {
        this.reallocateBufferGeometry(batchBuffer);
      } else {
        this.updateInstanceAttributes(instanceAttributes, { byteOffset, byteCount });
      }

      mesh.count -= instanceCount;

      mesh.visible = mesh.count > 0;

      if (!this._compactProxiesEnabled) {
        setModelRenderLayers(batchBuffer.mesh, this._styledTreeIndexSets);
        return;
      }
      // Removing instances can only remove render layers, so nothing visible is skipped while the
      // rebuild is pending. A proxy keeps drawing removed visible instances until the deferred
      // rebuild, which requests a redraw when done.
      this.onBatchContentChanged(batchBuffer, removedVisibleInstances);
    });

    this._sectorBatches.delete(sectorId);

    sectorBatch.instanceBatches.forEach((_, instanceId) => this.disposeInstanceBatchIfEmpty(instanceId));
  }

  /**
   * Enables or disables rendering only the visible instances of a batch through a compact proxy.
   * Disabled by default, in which case batches are rendered as in the original implementation.
   */
  public setCompactProxiesEnabled(enabled: boolean): void {
    if (this._compactProxiesEnabled === enabled) {
      return;
    }
    this._compactProxiesEnabled = enabled;
    this._compactProxiesVisibleNodesVersion = undefined;
    this.updateCompactProxies();
  }

  /**
   * Updates the compact proxies of all batches after node styling has changed. Proxies are fully
   * rebuilt when the visible nodes have changed (or no version hook is given). Otherwise only their
   * render layers are updated, and batches with a pending rebuild are rebuilt now.
   * @param options Update options.
   * @param options.batchLayersAreCurrent Set when the render layers of the batch meshes have just
   * been recomputed by the caller, to avoid computing them a second time.
   */
  public updateCompactProxies(options?: { batchLayersAreCurrent?: boolean }): void {
    const batchLayersAreCurrent = options?.batchLayersAreCurrent ?? false;
    const visibleNodesVersion = this.compactProxyHooks.getVisibleNodesVersion?.();
    if (
      this._compactProxiesEnabled &&
      visibleNodesVersion !== undefined &&
      visibleNodesVersion === this._compactProxiesVisibleNodesVersion
    ) {
      this.updateCompactProxiesKeepingVisibility(batchLayersAreCurrent);
      return;
    }

    this._visibleLookupNeedsUpdate = true;
    this.cancelCompactProxyFlush();
    this._compactProxiesVisibleNodesVersion = undefined;
    if (!this._compactProxiesEnabled && !this.hasCompactProxies()) {
      return;
    }
    for (const { buffers } of this._instanceBatches.values()) {
      buffers.forEach(batchBuffer => this.updateCompactProxy(batchBuffer, batchLayersAreCurrent));
    }
    if (this._compactProxiesEnabled) {
      this._compactProxiesVisibleNodesVersion = visibleNodesVersion;
    }
  }

  // The visible nodes are unchanged since every proxy was last built, so a proxy that is not
  // pending a rebuild still holds the right instances and only needs the new render layers.
  private updateCompactProxiesKeepingVisibility(batchLayersAreCurrent: boolean): void {
    for (const { buffers } of this._instanceBatches.values()) {
      buffers.forEach(batchBuffer => {
        const { mesh, compactProxy } = batchBuffer;
        if (this._dirtyCompactProxyBuffers.has(batchBuffer)) {
          this.updateCompactProxy(batchBuffer, batchLayersAreCurrent);
          return;
        }
        if (!batchLayersAreCurrent) {
          setModelRenderLayers(mesh, this._styledTreeIndexSets);
        }
        if (compactProxy === undefined) {
          return;
        }
        if (mesh.layers.mask === 0) {
          this.disposeCompactProxy(batchBuffer);
          return;
        }
        compactProxy.mesh.layers.mask = mesh.layers.mask;
        mesh.layers.disableAll();
      });
    }
    // Every pending rebuild has just been done
    this.cancelCompactProxyFlush();
  }

  private hasCompactProxies(): boolean {
    for (const { buffers } of this._instanceBatches.values()) {
      if (buffers.some(batchBuffer => batchBuffer.compactProxy !== undefined)) {
        return true;
      }
    }
    return false;
  }

  public dispose(): void {
    this.cancelCompactProxyFlush();

    // Everything is thrown away, so the batches are freed as they are. Removing the sectors one by
    // one first would, for every sector, move the rest of each buffer it is in to close the gap it
    // leaves, which takes many seconds for a large model and is work on data nobody will use.
    for (const { buffers } of this._instanceBatches.values()) {
      buffers.forEach(({ mesh }) => {
        mesh.count = 0;
        mesh.visible = false;
        mesh.layers.disableAll();
        (mesh.userData.treeIndices as Map<number, number>).clear();
      });
      this.disposeBatchBuffers(buffers);
    }

    this._sectorBatches.clear();
    this._instanceBatches.clear();
  }

  private disposeInstanceBatchIfEmpty(instanceId: string): void {
    const instanceBatch = this._instanceBatches.get(instanceId);
    if (instanceBatch === undefined || instanceBatch.buffers.some(({ buffer }) => buffer.batchCount > 0)) {
      return;
    }

    this.disposeBatchBuffers(instanceBatch.buffers);
    this._instanceBatches.delete(instanceId);
  }

  private disposeBatchBuffers(buffers: BatchBuffer[]): void {
    buffers.forEach(batchBuffer => {
      this._dirtyCompactProxyBuffers.delete(batchBuffer);
      this.disposeCompactProxy(batchBuffer);
      this._batchGroup.remove(batchBuffer.mesh);
      batchBuffer.mesh.geometry.dispose();
    });
  }

  // Until the deferred rebuild runs, the batch mesh is rendered as well (its layers include all
  // added visible instances), so newly added instances are never missing - only drawn redundantly.
  private markCompactProxyDirty(batchBuffer: BatchBuffer): void {
    this._dirtyCompactProxyBuffers.add(batchBuffer);
    // Always deferred: sector loading/unloading adds and removes many sectors in one synchronous
    // pass, and rebuilding inside that pass would rescan large batches once per sector.
    this._compactProxyFlushTimer ??= setTimeout(() => {
      this._compactProxyFlushTimer = undefined;
      const dirty = [...this._dirtyCompactProxyBuffers];
      this._dirtyCompactProxyBuffers.clear();
      dirty.forEach(dirtyBuffer => this.updateCompactProxy(dirtyBuffer));
      // The frame drawn before this rebuild may show removed instances or draw added ones twice
      this.compactProxyHooks.onDeferredRebuild?.();
    }, compactProxyUpdateThrottleDelay);
  }

  private cancelCompactProxyFlush(): void {
    if (this._compactProxyFlushTimer !== undefined) {
      clearTimeout(this._compactProxyFlushTimer);
      this._compactProxyFlushTimer = undefined;
    }
    this._dirtyCompactProxyBuffers.clear();
  }

  /**
   * Byte-per-tree-index lookup of visible nodes. IndexSet.contains() is too slow to call
   * per instance when sectors with hundreds of thousands of instances are added/removed.
   * The lookup is rebuilt when the visible nodes have changed since it was made, so sectors added or
   * removed between a styling change and the updateCompactProxies() call that follows it are
   * classified with the current visibility.
   */
  private getVisibleLookup(): Uint8Array {
    const version = this.compactProxyHooks.getVisibleNodesVersion?.() ?? 0;
    if (!this._visibleLookupNeedsUpdate && version === this._visibleLookupVersion) {
      return this._visibleLookup;
    }
    this._visibleLookupVersion = version;
    const ranges = this._styledTreeIndexSets.visible.toRangeArray();
    const size = ranges.reduce((max, range) => Math.max(max, range.toInclusive + 1), 0);
    if (this._visibleLookup.length < size) {
      this._visibleLookup = new Uint8Array(size);
    } else {
      this._visibleLookup.fill(0);
    }
    ranges.forEach(range => this._visibleLookup.fill(1, range.from, range.toInclusive + 1));
    this._visibleLookupNeedsUpdate = false;
    return this._visibleLookup;
  }

  // The proxy is an independent copy of the visible instances, so it stays exact when only
  // hidden instances are added or removed; the batch mesh can then remain disabled.
  private onBatchContentChanged(batchBuffer: BatchBuffer, changeTouchesVisibleInstances: boolean): void {
    if (
      batchBuffer.compactProxy !== undefined &&
      !changeTouchesVisibleInstances &&
      !this._dirtyCompactProxyBuffers.has(batchBuffer) &&
      this._compactProxiesEnabled
    ) {
      batchBuffer.mesh.layers.disableAll();
      return;
    }
    if (batchBuffer.compactProxy === undefined && batchBuffer.mesh.layers.mask === 0) {
      return;
    }
    this.markCompactProxyDirty(batchBuffer);
  }

  private updateCompactProxy(batchBuffer: BatchBuffer, batchLayersAreCurrent = false): void {
    const { mesh } = batchBuffer;
    if (!batchLayersAreCurrent) {
      setModelRenderLayers(mesh, this._styledTreeIndexSets);
    }
    // From here on the batch mesh holds the layers it should be drawn in if it gets no proxy
    const layerMask = mesh.layers.mask;

    if (!this._compactProxiesEnabled || layerMask === 0 || mesh.count === 0) {
      this.disposeCompactProxy(batchBuffer);
      return;
    }

    const visibleLookup = this.getVisibleLookup();
    const treeIndexCounts = mesh.userData.treeIndices as Map<number, number>;
    let visibleInstanceCount = 0;
    for (const [treeIndex, count] of treeIndexCounts) {
      if (isVisibleInLookup(visibleLookup, treeIndex)) {
        visibleInstanceCount += count;
      }
    }

    if (visibleInstanceCount > mesh.count * compactProxyMaxVisibleRatio) {
      this.disposeCompactProxy(batchBuffer);
      return;
    }

    const instanceAttributes = GeometryBufferUtils.getAttributes(mesh.geometry, InterleavedBufferAttribute);
    const treeIndexAttribute = this.getTreeIndexAttribute(instanceAttributes);
    const instanceByteSize =
      treeIndexAttribute.data.stride * (treeIndexAttribute.data.array as TypedArray).BYTES_PER_ELEMENT;

    const proxy = this.getOrCreateCompactProxy(
      batchBuffer,
      visibleInstanceCount * instanceByteSize,
      instanceAttributes
    );
    const source = batchBuffer.buffer.bufferView;
    const treeIndexArray = treeIndexAttribute.data.array as TypedArray;
    const treeIndexStride = treeIndexAttribute.data.stride;
    const treeIndexOffset = treeIndexAttribute.offset;
    let compactCount = 0;
    // Copy each run of consecutive visible instances with one set() instead of one per instance
    let runStart = -1;
    const instanceCount = mesh.count;
    for (let i = 0; i <= instanceCount; i++) {
      const visible =
        i < instanceCount && isVisibleInLookup(visibleLookup, treeIndexArray[i * treeIndexStride + treeIndexOffset]);
      if (visible) {
        if (runStart < 0) {
          runStart = i;
        }
      } else if (runStart >= 0) {
        proxy.data.set(
          source.subarray(runStart * instanceByteSize, i * instanceByteSize),
          compactCount * instanceByteSize
        );
        compactCount += i - runStart;
        runStart = -1;
      }
    }

    // Only upload the part of the proxy buffer that is in use, not its whole capacity
    const usedByteSize = compactCount * instanceByteSize;
    GeometryBufferUtils.getAttributes(proxy.mesh.geometry, InterleavedBufferAttribute).forEach(({ attribute }) => {
      attribute.data.clearUpdateRanges();
      if (usedByteSize > 0) {
        attribute.data.addUpdateRange(0, usedByteSize / (attribute.data.array as TypedArray).BYTES_PER_ELEMENT);
        attribute.data.needsUpdate = true;
      }
    });

    proxy.mesh.count = compactCount;
    proxy.mesh.visible = compactCount > 0;
    proxy.mesh.layers.mask = layerMask;
    mesh.layers.disableAll();
  }

  private getOrCreateCompactProxy(
    batchBuffer: BatchBuffer,
    requiredByteSize: number,
    instanceAttributes: { name: string; attribute: InterleavedBufferAttribute }[]
  ): CompactProxy {
    const existing = batchBuffer.compactProxy;
    if (
      existing !== undefined &&
      existing.data.byteLength >= requiredByteSize &&
      existing.mesh.material === batchBuffer.mesh.material
    ) {
      return existing;
    }
    this.disposeCompactProxy(batchBuffer);

    const capacity = Math.pow(2, Math.ceil(Math.log2(Math.max(requiredByteSize, 1024))));
    const data = new Uint8Array(capacity);
    const geometry = createOwnedTemplateGeometry(batchBuffer.mesh.geometry);
    GeometryBufferUtils.setInstanceAttributeDescriptors(instanceAttributes, geometry, data.buffer);

    const sourceMesh = batchBuffer.mesh;
    const proxyMesh = new InstancedMesh(geometry, sourceMesh.material, 0);
    proxyMesh.name = 'Compact visible instances';
    proxyMesh.frustumCulled = false;
    proxyMesh.boundingSphere = new Sphere();
    proxyMesh.onBeforeRender = (...args) => sourceMesh.onBeforeRender(...args);
    proxyMesh.userData.isCompactProxy = true;
    this._batchGroup.add(proxyMesh);
    proxyMesh.updateMatrixWorld(true);

    batchBuffer.compactProxy = { mesh: proxyMesh, data };
    return batchBuffer.compactProxy;
  }

  // Does not touch the layers of the batch mesh; callers decide how it is drawn afterwards.
  private disposeCompactProxy(batchBuffer: BatchBuffer): void {
    const proxy = batchBuffer.compactProxy;
    if (proxy === undefined) {
      return;
    }
    this._batchGroup.remove(proxy.mesh);
    // Safe to dispose: the proxy owns all its attributes (see createOwnedTemplateGeometry).
    proxy.mesh.geometry.dispose();
    batchBuffer.compactProxy = undefined;
  }

  private removeTreeIndicesFromMeshUserData(
    mesh: Mesh,
    updateRange: { byteOffset: number; byteCount: number },
    instanceAttributes: { name: string; attribute: InterleavedBufferAttribute }[]
  ): boolean {
    const { byteOffset, byteCount } = updateRange;

    const treeIndexAttribute = this.getTreeIndexAttribute(instanceAttributes);
    const typedArray = treeIndexAttribute.data.array as TypedArray;
    const instanceByteSize = treeIndexAttribute.data.stride * typedArray.BYTES_PER_ELEMENT;

    const firstWholeInstanceIndex = byteOffset / instanceByteSize;
    const firstInvalidInstanceIndex = (byteOffset + byteCount) / instanceByteSize;

    const visibleLookup = this._compactProxiesEnabled ? this.getVisibleLookup() : undefined;
    let removedVisibleInstances = false;
    for (let i = firstWholeInstanceIndex; i < firstInvalidInstanceIndex; i++) {
      const treeIndex = treeIndexAttribute.getX(i);
      decrementOrDeleteIndex(mesh.userData.treeIndices, treeIndex);
      removedVisibleInstances ||= visibleLookup !== undefined && isVisibleInLookup(visibleLookup, treeIndex);
    }
    return removedVisibleInstances;
  }

  private processGeometries(parsedGeometry: Required<ParsedGeometry>, sectorBatch: SectorBatch, sectorId: number) {
    const instanceBatch = this.getOrCreateInstanceBatch(parsedGeometry);
    this.batchInstanceAttributes(parsedGeometry.geometryBuffer, parsedGeometry.instanceId, instanceBatch, sectorBatch);
    this.updateTreeIndexToSectorsMap(parsedGeometry, sectorId);
  }

  private batchInstanceAttributes(
    bufferGeometry: BufferGeometry,
    instanceId: string,
    instanceBatch: InstanceBatch,
    sectorBatch: SectorBatch
  ) {
    const interleavedBufferView = GeometryBufferUtils.getInstanceAttributesSharedView(bufferGeometry);
    const batchBuffer = this.getBatchBufferToFill(instanceBatch);

    const length = interleavedBufferView.byteLength;
    const offset = interleavedBufferView.byteOffset;
    const interleavedAttributesView = new Uint8Array(interleavedBufferView.buffer, offset, length);

    const { batchId, bufferIsReallocated, updateRange } = batchBuffer.buffer.add(interleavedAttributesView);

    const sectorInstanceData: SectorInstanceData = { batchBuffer, batchId, instanceCount: 0 };

    sectorBatch.instanceBatches.set(instanceId, sectorInstanceData);

    const sourceInstanceAttributes = GeometryBufferUtils.getAttributes(bufferGeometry, InterleavedBufferAttribute);

    const addedVisibleTreeIndices = this.addTreeIndicesToMeshUserData(sourceInstanceAttributes, batchBuffer);

    if (bufferIsReallocated) {
      this.reallocateBufferGeometry(batchBuffer);
    } else {
      const batchInstanceAttributes = GeometryBufferUtils.getAttributes(
        batchBuffer.mesh.geometry,
        InterleavedBufferAttribute
      );
      this.updateInstanceAttributes(batchInstanceAttributes, updateRange);
    }

    const instanceCount = sourceInstanceAttributes[0].attribute.count;
    sectorInstanceData.instanceCount = instanceCount;

    batchBuffer.mesh.visible = true;
    batchBuffer.mesh.count += instanceCount;

    if (!this._compactProxiesEnabled) {
      setModelRenderLayers(batchBuffer.mesh, this._styledTreeIndexSets);
      return;
    }
    // Only the added instances can introduce new render layers, so avoid rescanning the whole
    // batch here; a full recompute is done once per load burst in updateCompactProxy.
    if (addedVisibleTreeIndices.size > 0) {
      batchBuffer.mesh.layers.mask |= this.computeRenderLayerMask(addedVisibleTreeIndices);
    }
    this.onBatchContentChanged(batchBuffer, addedVisibleTreeIndices.size > 0);
  }

  private computeRenderLayerMask(treeIndices: Map<number, number>): number {
    const scratch = this._layerMaskScratch;
    scratch.userData.treeIndices = treeIndices;
    setModelRenderLayers(scratch, this._styledTreeIndexSets);
    scratch.userData.treeIndices = undefined;
    return scratch.layers.mask;
  }

  private addTreeIndicesToMeshUserData(
    sourceInstanceAttributes: { name: string; attribute: InterleavedBufferAttribute }[],
    batchBuffer: BatchBuffer
  ): Map<number, number> {
    const treeIndexInterleavedAttribute = this.getTreeIndexAttribute(sourceInstanceAttributes);
    // Visibility is only tracked for compact proxies; skipped when disabled to keep the original cost.
    const visibleLookup = this._compactProxiesEnabled ? this.getVisibleLookup() : undefined;
    const addedVisibleTreeIndices = new Map<number, number>();

    for (let i = 0; i < treeIndexInterleavedAttribute.count; i++) {
      const treeIndex = treeIndexInterleavedAttribute.getX(i);
      incrementOrInsertIndex(batchBuffer.mesh.userData.treeIndices, treeIndex);
      if (visibleLookup !== undefined && isVisibleInLookup(visibleLookup, treeIndex)) {
        incrementOrInsertIndex(addedVisibleTreeIndices, treeIndex);
      }
    }
    return addedVisibleTreeIndices;
  }

  private updateTreeIndexToSectorsMap(parsedGeometry: ParsedGeometry, sectorId: number) {
    const sourceInstanceAttributes = GeometryBufferUtils.getAttributes(
      parsedGeometry.geometryBuffer,
      InterleavedBufferAttribute
    );
    const treeIndexInterleavedAttribute = this.getTreeIndexAttribute(sourceInstanceAttributes);

    if (this.treeIndexToSectorsMap.isCompleted(sectorId, parsedGeometry.type)) {
      return;
    }

    // Update mapping from tree indices to sector ids
    for (let i = 0; i < treeIndexInterleavedAttribute.count; i++) {
      const treeIndex = treeIndexInterleavedAttribute.getX(i);
      this.treeIndexToSectorsMap.set(treeIndex, sectorId);
    }
    this.treeIndexToSectorsMap.markCompleted(sectorId, parsedGeometry.type);
  }

  private reallocateBufferGeometry({ buffer, mesh }: BatchBuffer) {
    const defragmentedBufferGeometry = this.createDefragmentedBufferGeometry(mesh.geometry, buffer);
    mesh.geometry.dispose();
    mesh.geometry = defragmentedBufferGeometry;
  }

  private updateInstanceAttributes(
    instanceAttributes: {
      name: string;
      attribute: InterleavedBufferAttribute;
    }[],
    updateRange: {
      byteOffset: number;
      byteCount: number;
    }
  ) {
    if (updateRange.byteCount === 0) {
      return;
    }
    instanceAttributes.forEach(namedAttribute => {
      const attribute = namedAttribute.attribute;
      this.extendUpdateRange(attribute, updateRange);
      attribute.data.needsUpdate = true;
    });
  }

  private extendUpdateRange(
    attribute: InterleavedBufferAttribute,
    updateRange: {
      byteOffset: number;
      byteCount: number;
    }
  ) {
    const typeSize = (attribute.data.array as TypedArray).BYTES_PER_ELEMENT;
    const newOffset = updateRange.byteOffset / typeSize;
    const newCount = updateRange.byteCount / typeSize;

    if (attribute.data.updateRanges.length === 0) {
      attribute.data.clearUpdateRanges();
      attribute.data.updateRanges.push({ start: newOffset, count: newCount });
      attribute.data.needsUpdate = true;
      return;
    }

    const { start: oldOffset, count: oldCount } = attribute.data.updateRanges[0];
    const start = Math.min(oldOffset, newOffset);
    const count = Math.max(oldOffset + oldCount, newOffset + newCount) - start;

    attribute.data.clearUpdateRanges();
    attribute.data.updateRanges.push({ start, count });
  }

  private getBatchBufferToFill(instanceBatch: InstanceBatch): BatchBuffer {
    const smallestBuffer = minBy(instanceBatch.buffers, batchBuffer => batchBuffer.buffer.length);
    assert(smallestBuffer !== undefined);

    const canAddBuffer = instanceBatch.buffers.length < this.numberOfInstanceBatches;
    if (canAddBuffer && smallestBuffer.buffer.length >= this.additionalBufferThresholdBytes) {
      const additionalBuffer = this.createBatchBuffer(instanceBatch.buffers[0].mesh.geometry, instanceBatch.type);
      instanceBatch.buffers.push(additionalBuffer);
      return additionalBuffer;
    }
    return smallestBuffer;
  }

  private getOrCreateInstanceBatch(parsedGeometry: Required<ParsedGeometry>) {
    const instanceBatch = this._instanceBatches.get(parsedGeometry.instanceId);

    if (instanceBatch !== undefined) {
      return instanceBatch;
    }

    const batchBuffers: BatchBuffer[] = [this.createBatchBuffer(parsedGeometry.geometryBuffer, parsedGeometry.type)];

    const newInstanceBatch: InstanceBatch = { buffers: batchBuffers, type: parsedGeometry.type };
    this._instanceBatches.set(parsedGeometry.instanceId, newInstanceBatch);
    return newInstanceBatch;
  }

  private createBatchBuffer(bufferGeometry: BufferGeometry, type: RevealGeometryCollectionType): BatchBuffer {
    const material = getShaderMaterial(type, this._materials);
    const defragBuffer = new DynamicDefragmentedBuffer(this.initialBufferSize, Uint8Array);
    const instanceBufferGeometry = this.createDefragmentedBufferGeometry(bufferGeometry, defragBuffer);
    const instancedMesh = this.createInstanceMesh(instanceBufferGeometry, material);
    return { buffer: defragBuffer, mesh: instancedMesh };
  }

  private createInstanceMesh(instanceBufferGeometry: BufferGeometry, material: RawShaderMaterial) {
    const instancedMesh = new InstancedMesh(instanceBufferGeometry, material, 0);
    instancedMesh.visible = false;
    // Render layers are assigned when instances are added. Start with none (three.js enables layer 0
    // by default), as the compact proxy logic treats an empty mask as "nothing visible in this batch".
    instancedMesh.layers.disableAll();
    instancedMesh.frustumCulled = false;
    instancedMesh.boundingSphere = new Sphere(); // Unused, to avoid a calculated sphere on first render

    instancedMesh.onBeforeRender = (_0, _1, camera: Camera) => {
      (material.uniforms.inverseModelMatrix?.value as Matrix4)?.copy(instancedMesh.matrixWorld).invert();
      (material.uniforms.cameraPosition?.value as Vector3)?.copy(camera.position);
    };

    instancedMesh.userData.treeIndices = new Map<number, number>();

    this._batchGroup.add(instancedMesh);
    instancedMesh.updateMatrixWorld(true);
    return instancedMesh;
  }

  private createDefragmentedBufferGeometry(
    bufferGeometry: BufferGeometry,
    defragmentedAttributeBuffer: DynamicDefragmentedBuffer<Uint8Array<ArrayBuffer>>
  ): BufferGeometry {
    const instanceBufferGeometry = GeometryBufferUtils.copyGeometryWithBufferAttributes(bufferGeometry);
    const instanceAttributes = GeometryBufferUtils.getAttributes(bufferGeometry, InterleavedBufferAttribute);
    GeometryBufferUtils.setInstanceAttributeDescriptors(
      instanceAttributes,
      instanceBufferGeometry,
      defragmentedAttributeBuffer.bufferView.buffer
    );
    return instanceBufferGeometry;
  }

  private getTreeIndexAttribute(
    instanceAttributes: { name: string; attribute: InterleavedBufferAttribute }[]
  ): InterleavedBufferAttribute {
    const treeIndexAttribute = instanceAttributes.filter(att => att.name === 'a_treeIndex');

    return treeIndexAttribute[0].attribute;
  }

  private createSectorBatch(sectorId: number): SectorBatch {
    const sectorBatch: SectorBatch = {
      instanceBatches: new Map()
    };

    this._sectorBatches.set(sectorId, sectorBatch);

    return sectorBatch;
  }
}

/**
 * Copies the non-instanced template attributes (and index) of a batch geometry. The batch mesh
 * shares these with geometries it replaced, so a proxy needs its own copies to be safely disposed;
 * template geometries are small (a single primitive), so the copies are cheap.
 */
function createOwnedTemplateGeometry(source: BufferGeometry): BufferGeometry {
  const geometry = new BufferGeometry();
  GeometryBufferUtils.getAttributes(source, BufferAttribute).forEach(({ name, attribute }) => {
    geometry.setAttribute(name, attribute.clone());
  });
  const index = source.getIndex();
  if (index !== null) {
    geometry.setIndex(index.clone());
  }
  return geometry;
}

// The lookup only reaches the highest visible tree index, so hidden tree indices are often beyond
// its end. Reading a typed array out of bounds is several times slower than checking the length
// first, and this runs once per instance.
function isVisibleInLookup(visibleLookup: Uint8Array, treeIndex: number): boolean {
  return treeIndex < visibleLookup.length && visibleLookup[treeIndex] === 1;
}
