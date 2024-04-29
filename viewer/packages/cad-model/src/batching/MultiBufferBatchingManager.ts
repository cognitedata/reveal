/*!
 * Copyright 2023 Cognite AS
 */
import assert from 'assert';
import minBy from 'lodash/minBy';
import {
  BufferGeometry,
  Group,
  InstancedMesh,
  InterleavedBufferAttribute,
  RawShaderMaterial,
  Sphere,
  type Camera,
  type Matrix4,
  type Mesh,
  type Vector3
} from 'three';
import { Materials, setModelRenderLayers, StyledTreeIndexSets } from '@reveal/rendering';
import { ParsedGeometry, RevealGeometryCollectionType } from '@reveal/sector-parser';
import {
  decrementOrDeleteIndex,
  DynamicDefragmentedBuffer,
  incrementOrInsertIndex,
  TypedArray
} from '@reveal/utilities';
import { GeometryBufferUtils } from '../utilities/GeometryBufferUtils';
import { getShaderMaterial } from '../utilities/getShaderMaterial';
import { TreeIndexToSectorsMap } from '../utilities/TreeIndexToSectorsMap';
import { DrawCallBatchingManager } from './DrawCallBatchingManager';

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
};

/**
 * Structure containing the DefragmentedBuffer (where the data is actually stored), and the mesh
 * which uses this buffer.
 */
type BatchBuffer = {
  mesh: InstancedMesh;
  buffer: DynamicDefragmentedBuffer<Uint8Array>;
};

/**
 * The objective of this class is to batch together instances
 * of the same type from different sectors.
 * This is done to reduce the number of draw calls that have to be issued during rendering.
 * Essentially this works by allocating n (numberOfInstanceBatches) buffers for each unique instanced type
 * and continually filling / ejecting data from those buffers when new sectors are added / removed.
 */
export class MultiBufferBatchingManager implements DrawCallBatchingManager {
  private readonly _sectorBatches: Map<number, SectorBatch>;
  private readonly _instanceBatches: Map<string, InstanceBatch>;
  private readonly _materials: Materials;
  private readonly _batchGroup: Group;
  private readonly _styledTreeIndexSets: StyledTreeIndexSets;

  constructor(
    batchGroup: Group,
    materials: Materials,
    styleTreeIndexSets: StyledTreeIndexSets,
    private readonly treeIndexToSectorsMap: TreeIndexToSectorsMap,
    private readonly initialBufferSize = 1024,
    private readonly numberOfInstanceBatches = 2
  ) {
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
      this.removeTreeIndicesFromMeshUserData(mesh, batchUpdateRange, instanceAttributes);

      const defragBufferUpdateRange = buffer.remove(batchId);

      this.updateInstanceAttributes(instanceAttributes, {
        byteOffset: defragBufferUpdateRange.byteOffset,
        byteCount: defragBufferUpdateRange.byteCount
      });

      mesh.count -= instanceCount;

      mesh.visible = mesh.count > 0;

      setModelRenderLayers(batchBuffer.mesh, this._styledTreeIndexSets);
    });

    this._sectorBatches.delete(sectorId);
  }

  public dispose(): void {
    for (const sectorId of this._sectorBatches.keys()) {
      this.removeSectorBatches(sectorId);
    }

    for (const { buffers } of this._instanceBatches.values()) {
      buffers.forEach(batchBuffer => {
        this._batchGroup.remove(batchBuffer.mesh);
        batchBuffer.mesh.geometry.dispose();
      });
    }

    this._sectorBatches.clear();
    this._instanceBatches.clear();
  }

  private removeTreeIndicesFromMeshUserData(
    mesh: Mesh,
    updateRange: { byteOffset: number; byteCount: number },
    instanceAttributes: { name: string; attribute: InterleavedBufferAttribute }[]
  ): void {
    const { byteOffset, byteCount } = updateRange;

    const treeIndexAttribute = this.getTreeIndexAttribute(instanceAttributes);
    const typedArray = treeIndexAttribute.data.array as TypedArray;
    const instanceByteSize = treeIndexAttribute.data.stride * typedArray.BYTES_PER_ELEMENT;

    const firstWholeInstanceIndex = byteOffset / instanceByteSize;
    const firstInvalidInstanceIndex = (byteOffset + byteCount) / instanceByteSize;

    for (let i = firstWholeInstanceIndex; i < firstInvalidInstanceIndex; i++) {
      const treeIndex = treeIndexAttribute.getX(i);
      decrementOrDeleteIndex(mesh.userData.treeIndices, treeIndex);
    }
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

    GeometryBufferUtils.getAttributes(batchBuffer.mesh.geometry, InterleavedBufferAttribute).forEach(
      ({ attribute }) => {
        attribute.data.needsUpdate = true;
      }
    );

    const sourceInstanceAttributes = GeometryBufferUtils.getAttributes(bufferGeometry, InterleavedBufferAttribute);

    this.addTreeIndicesToMeshUserData(sourceInstanceAttributes, batchBuffer);

    if (bufferIsReallocated) {
      this.reallocateBufferGeometry(batchBuffer);
    } else {
      this.updateInstanceAttributes(sourceInstanceAttributes, updateRange);
    }

    const instanceCount = sourceInstanceAttributes[0].attribute.count;
    sectorInstanceData.instanceCount = instanceCount;

    batchBuffer.mesh.visible = true;
    batchBuffer.mesh.count += instanceCount;

    setModelRenderLayers(batchBuffer.mesh, this._styledTreeIndexSets);
  }

  private addTreeIndicesToMeshUserData(
    sourceInstanceAttributes: { name: string; attribute: InterleavedBufferAttribute }[],
    batchBuffer: BatchBuffer
  ) {
    const treeIndexInterleavedAttribute = this.getTreeIndexAttribute(sourceInstanceAttributes);

    for (let i = 0; i < treeIndexInterleavedAttribute.count; i++) {
      incrementOrInsertIndex(batchBuffer.mesh.userData.treeIndices, treeIndexInterleavedAttribute.getX(i));
    }
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
    return smallestBuffer;
  }

  private getOrCreateInstanceBatch(parsedGeometry: Required<ParsedGeometry>) {
    const instanceBatch = this._instanceBatches.get(parsedGeometry.instanceId);

    if (instanceBatch !== undefined) {
      return instanceBatch;
    }

    const batchBuffers: BatchBuffer[] = Array.from(Array(this.numberOfInstanceBatches)).map(() =>
      this.createBatchBuffer(parsedGeometry.geometryBuffer, parsedGeometry.type)
    );

    const newInstanceBatch: InstanceBatch = { buffers: batchBuffers };
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
    defragmentedAttributeBuffer: DynamicDefragmentedBuffer<Uint8Array>
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
