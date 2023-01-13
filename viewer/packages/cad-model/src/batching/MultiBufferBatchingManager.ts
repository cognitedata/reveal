/*!
 * Copyright 2023 Cognite AS
 */
import { Materials } from '@reveal/rendering';
import { ParsedGeometry, RevealGeometryCollectionType } from '@reveal/sector-parser';
import {
  decrementOrDeleteIndex,
  DynamicDefragmentedBuffer,
  incrementOrInsertIndex,
  TypedArray
} from '@reveal/utilities';
import { BufferGeometry, Group, InstancedMesh, InterleavedBufferAttribute, RawShaderMaterial } from 'three';
import { GeometryBufferUtils } from '../utilities/GeometryBufferUtils';
import { getShaderMaterial } from '../utilities/getShaderMaterial';
import { DrawCallBatchingManager } from './DrawCallBatchingManager';

type SectorBatch = {
  instanceBatches: Map<string, SectorInstanceData>;
};

type SectorInstanceData = {
  batchBuffer: BatchBuffer;
  batchId: number;
  instanceCount: number;
};

type InstanceBatch = {
  buffers: BatchBuffer[];
};

type BatchBuffer = {
  mesh: InstancedMesh;
  buffer: DynamicDefragmentedBuffer<Uint8Array>;
};

export class MultiBufferBatchingManager implements DrawCallBatchingManager {
  private readonly _sectorBatches: Map<number, SectorBatch>;
  private readonly _instanceBatches: Map<string, InstanceBatch>;
  private readonly _materials: Materials;
  private readonly _batchGroup: Group;

  constructor(
    batchGroup: Group,
    materials: Materials,
    private readonly initialBufferSize = 1024,
    private readonly numberOfInstanceBatches = 2
  ) {
    this._sectorBatches = new Map();
    this._instanceBatches = new Map();
    this._materials = materials;
    this._batchGroup = batchGroup;
  }

  public batchGeometries(geometryBatchingQueue: ParsedGeometry[], sectorId: number): void {
    if (this._sectorBatches.has(sectorId)) {
      return;
    }
    const sectorBatch = this.createSectorBatch(sectorId);
    geometryBatchingQueue.forEach(parsedGeometry => {
      if (parsedGeometry.instanceId === undefined) {
        return;
      }
      this.processGeometries(parsedGeometry as Required<ParsedGeometry>, sectorBatch);
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
    });

    this._sectorBatches.delete(sectorId);
  }

  private removeTreeIndicesFromMeshUserData(
    mesh: THREE.Mesh,
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

  public dispose(): void {
    throw new Error('Method not implemented.');
  }

  private processGeometries(parsedGeometry: Required<ParsedGeometry>, sectorBatch: SectorBatch) {
    const instanceBatch = this.getOrCreateInstanceBatch(parsedGeometry);
    this.batchInstanceAttributes(parsedGeometry.geometryBuffer, parsedGeometry.instanceId, instanceBatch, sectorBatch);
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

    const treeIndexInterleavedAttribute = this.getTreeIndexAttribute(sourceInstanceAttributes);

    for (let i = 0; i < treeIndexInterleavedAttribute.count; i++) {
      incrementOrInsertIndex(batchBuffer.mesh.userData.treeIndices, treeIndexInterleavedAttribute.getX(i));
    }

    if (bufferIsReallocated) {
      this.reallocateBufferGeometry(batchBuffer);
    } else {
      this.updateInstanceAttributes(sourceInstanceAttributes, updateRange);
    }

    const instanceCount = sourceInstanceAttributes[0].attribute.count;
    sectorInstanceData.instanceCount = instanceCount;

    batchBuffer.mesh.visible = true;
    batchBuffer.mesh.count += instanceCount;
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
    attribute: THREE.InterleavedBufferAttribute,
    updateRange: {
      byteOffset: number;
      byteCount: number;
    }
  ) {
    const typeSize = (attribute.data.array as TypedArray).BYTES_PER_ELEMENT;
    const newOffset = updateRange.byteOffset / typeSize;
    const newCount = updateRange.byteCount / typeSize;

    const { offset: oldOffset, count: oldCount } = attribute.data.updateRange;
    if (oldCount === -1) {
      attribute.data.updateRange = { offset: newOffset, count: newCount };
      attribute.data.needsUpdate = true;
      return;
    }

    const offset = Math.min(oldOffset, newOffset);
    const count = Math.max(oldOffset + oldCount, newOffset + newCount) - offset;

    attribute.data.updateRange = { offset, count };
  }

  private getBatchBufferToFill(instanceBatch: InstanceBatch) {
    return instanceBatch.buffers.sort((a, b) => {
      const aBufferSize = a.buffer.bufferView.length;
      const bBufferSize = b.buffer.bufferView.length;
      if (aBufferSize !== bBufferSize) {
        return aBufferSize - bBufferSize;
      }
      return a.buffer.length - b.buffer.length;
    })[0];
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

    instancedMesh.onBeforeRender = (_0, _1, camera: THREE.Camera) => {
      (material.uniforms.inverseModelMatrix?.value as THREE.Matrix4)?.copy(instancedMesh.matrixWorld).invert();
      (material.uniforms.cameraPosition?.value as THREE.Vector3)?.copy(camera.position);
    };

    instancedMesh.userData.treeIndices = new Map<number, number>();

    this._batchGroup.add(instancedMesh);
    instancedMesh.updateMatrixWorld(true);
    return instancedMesh;
  }

  private createDefragmentedBufferGeometry(
    bufferGeometry: THREE.BufferGeometry,
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
    instanceAttributes: { name: string; attribute: THREE.InterleavedBufferAttribute }[]
  ): THREE.InterleavedBufferAttribute {
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
