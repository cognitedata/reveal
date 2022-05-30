/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

import { ParsedGeometry, RevealGeometryCollectionType } from '@reveal/sector-parser';
import assert from 'assert';
import {
  assertNever,
  DynamicDefragmentedBuffer,
  TypedArray,
  TypedArrayConstructor,
  incrementOrInsertIndex,
  decrementOrDeleteIndex
} from '@reveal/utilities';
import { Materials } from '@reveal/rendering';

type BatchedBuffer = {
  defragBuffer: DynamicDefragmentedBuffer<Uint8Array>;
  mesh: THREE.InstancedMesh;
};

export class GeometryBatchingManager {
  private readonly _batchedGeometriesGroup: THREE.Group;

  private readonly _materials: Materials;

  private readonly _instancedTypeMap: Map<string, BatchedBuffer>;
  private readonly _sectorMap: Map<number, [string, number, number][]>;

  private static readonly TypedArrayViews = new Map<number, TypedArrayConstructor>([
    [1, Uint8Array],
    [4, Float32Array]
  ]);

  constructor(group: THREE.Group, materials: Materials) {
    this._batchedGeometriesGroup = group;
    this._materials = materials;
    this._instancedTypeMap = new Map();
    this._sectorMap = new Map();
  }

  public dispose(): void {
    for (const sectorId of this._sectorMap.keys()) {
      this.removeSectorBatches(sectorId);
    }

    for (const mesh of this._batchedGeometriesGroup.children) {
      if (mesh instanceof THREE.Mesh) {
        mesh.geometry.dispose();

        delete mesh.geometry;
      }
    }

    this._batchedGeometriesGroup.clear();
  }

  public batchGeometries(geometryBatchingQueue: ParsedGeometry[], sectorId: number): void {
    if (this._sectorMap.get(sectorId) !== undefined) {
      return;
    }

    geometryBatchingQueue.forEach(geometry => {
      const { type, geometryBuffer, instanceId } = geometry;
      this.processGeometries(geometryBuffer, instanceId, type, sectorId);
    });
  }

  public removeSectorBatches(sectorId: number): void {
    const typeBatches = this._sectorMap.get(sectorId);

    if (typeBatches === undefined) {
      return;
    }

    typeBatches.forEach(typeBatch => {
      const [type, batchId, instanceCount] = typeBatch;

      const geometry = this._instancedTypeMap.get(type);

      if (geometry === undefined) {
        return;
      }

      const { defragBuffer, mesh } = geometry;

      const batchUpdateRange = defragBuffer.getRangeForBatchId(batchId);

      this.removeTreeIndicesFromMeshUserData(mesh, batchUpdateRange);

      const defragBufferUpdateRange = defragBuffer.remove(batchId);

      this.updateInstanceAttributes(mesh, defragBufferUpdateRange);

      mesh.count -= instanceCount;
    });

    this._sectorMap.delete(sectorId);
  }

  private processGeometries(
    sectorBufferGeometry: THREE.BufferGeometry,
    instanceId: string | undefined,
    type: RevealGeometryCollectionType,
    sectorId: number
  ) {
    const instanceAttributes = this.getAttributes(sectorBufferGeometry, THREE.InterleavedBufferAttribute);
    const interleavedBufferView = this.getInstanceAttributesSharedView(instanceAttributes);
    const treeIndexInterleavedAttribute = this.getTreeIndexAttribute(instanceAttributes);

    assert(instanceId !== undefined);

    const instanceMeshGeometry =
      this._instancedTypeMap.get(instanceId) ?? this.createInstanceMeshGeometry(sectorBufferGeometry, type, instanceId);

    const interleavedArrayBuffer = interleavedBufferView.buffer;

    const { defragBuffer, mesh } = instanceMeshGeometry;

    const length = interleavedBufferView.byteLength;
    const offset = interleavedBufferView.byteOffset;

    const interleavedAttributesView = new Uint8Array(interleavedArrayBuffer, offset, length);

    const { batchId, bufferIsReallocated, updateRange } = defragBuffer.add(interleavedAttributesView);

    const inputBufferByteStride = interleavedBufferView.BYTES_PER_ELEMENT * instanceAttributes[0].attribute.data.stride;

    assert(updateRange.byteCount % inputBufferByteStride === 0);
    assert(updateRange.byteOffset % inputBufferByteStride === 0);

    for (let i = 0; i < treeIndexInterleavedAttribute.count; i++) {
      incrementOrInsertIndex(mesh.userData.treeIndices, treeIndexInterleavedAttribute.getX(i));
    }

    const sectorBatches = this._sectorMap.get(sectorId) ?? this.createSectorBatch(sectorId);

    assert(instanceAttributes.length > 0);

    const instanceCount = instanceAttributes[0].attribute.count;
    sectorBatches.push([instanceId, batchId, instanceCount]);

    if (bufferIsReallocated) {
      this.reallocateBufferGeometry(mesh, defragBuffer);
    } else {
      this.updateInstanceAttributes(mesh, updateRange);
    }

    mesh.count += instanceCount;
  }

  private updateInstanceAttributes(
    mesh: THREE.InstancedMesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>,
    updateRange: {
      byteOffset: number;
      byteCount: number;
    }
  ) {
    this.getAttributes(mesh.geometry, THREE.InterleavedBufferAttribute).forEach(namedAttribute => {
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

  private reallocateBufferGeometry(
    mesh: THREE.InstancedMesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>,
    defragBuffer: DynamicDefragmentedBuffer<Uint8Array>
  ) {
    const defragmentedBufferGeometry = this.createDefragmentedBufferGeometry(mesh.geometry, defragBuffer);
    mesh.geometry.dispose();
    mesh.geometry = defragmentedBufferGeometry;
  }

  private createSectorBatch(sectorId: number) {
    const sectorBatchInstance: [string, number, number][] = [];
    this._sectorMap.set(sectorId, sectorBatchInstance);
    return sectorBatchInstance;
  }

  private createInstanceMeshGeometry(
    sectorBufferGeometry: THREE.BufferGeometry,
    type: RevealGeometryCollectionType,
    instanceId: string
  ): BatchedBuffer {
    const interleavedAttributesDefragBuffer = new DynamicDefragmentedBuffer(64, Uint8Array);
    const defragmentedBufferGeometry = this.createDefragmentedBufferGeometry(
      sectorBufferGeometry,
      interleavedAttributesDefragBuffer
    );
    const material = this.getShaderMaterial(type, this._materials);
    const instanceMesh = this.createInstanceMesh(
      this._batchedGeometriesGroup,
      defragmentedBufferGeometry,
      material,
      instanceId
    );

    const buffer: BatchedBuffer = { defragBuffer: interleavedAttributesDefragBuffer, mesh: instanceMesh };
    this._instancedTypeMap.set(instanceId, buffer);

    return buffer;
  }

  private getInstanceAttributesSharedView(
    instanceAttributes: { name: string; attribute: THREE.InterleavedBufferAttribute }[]
  ) {
    assert(instanceAttributes.length > 0);

    const interleavedBufferView = instanceAttributes[0].attribute.array as TypedArray;

    for (let i = 1; i < instanceAttributes.length; i++) {
      const instanceAttributeBufferView = instanceAttributes[i].attribute.array;
      assert(interleavedBufferView.buffer.byteLength === (instanceAttributeBufferView as TypedArray).buffer.byteLength);
    }
    return interleavedBufferView;
  }

  private getTreeIndexAttribute(
    instanceAttributes: { name: string; attribute: THREE.InterleavedBufferAttribute }[]
  ): THREE.InterleavedBufferAttribute {
    const treeIndexAttribute = instanceAttributes.filter(att => att.name === 'a_treeIndex');

    assert(treeIndexAttribute.length > 0);

    return treeIndexAttribute[0].attribute;
  }

  private removeTreeIndicesFromMeshUserData(
    mesh: THREE.Mesh,
    updateRange: { byteOffset: number; byteCount: number }
  ): void {
    const { byteOffset, byteCount } = updateRange;

    const interleavedAttributes = this.getAttributes(mesh.geometry, THREE.InterleavedBufferAttribute);

    const treeIndexAttribute = this.getTreeIndexAttribute(interleavedAttributes);
    const typedArray = treeIndexAttribute.data.array as TypedArray;
    const instanceByteSize = treeIndexAttribute.data.stride * typedArray.BYTES_PER_ELEMENT;

    assert(byteOffset % instanceByteSize === 0);
    assert(byteCount % instanceByteSize === 0);

    const firstWholeInstanceIndex = byteOffset / instanceByteSize;
    const firstInvalidInstanceIndex = (byteOffset + byteCount) / instanceByteSize;

    for (let i = firstWholeInstanceIndex; i < firstInvalidInstanceIndex; i++) {
      const treeIndex = treeIndexAttribute.getX(i);

      assert((mesh.userData.treeIndices as Map<number, number>).has(treeIndex));
      decrementOrDeleteIndex(mesh.userData.treeIndices, treeIndex);
    }
  }

  private createDefragmentedBufferGeometry(
    bufferGeometry: THREE.BufferGeometry,
    defragmentedAttributeBuffer: DynamicDefragmentedBuffer<Uint8Array>
  ): THREE.BufferGeometry {
    const instanceAttributes = this.getAttributes(bufferGeometry, THREE.InterleavedBufferAttribute);

    const geometry = this.copyGeometryWithBufferAttributes(bufferGeometry);

    instanceAttributes.forEach(instanceAttribute => {
      const { name, attribute } = instanceAttribute;

      const stride = attribute.data.stride;
      const componentSize = (attribute.array as TypedArray).BYTES_PER_ELEMENT;

      const underlyingBuffer = defragmentedAttributeBuffer.bufferView.buffer;
      const ComponentType = GeometryBatchingManager.TypedArrayViews.get(componentSize)!;
      const interleavedAttributesBuffer = new THREE.InstancedInterleavedBuffer(
        new ComponentType(underlyingBuffer),
        stride
      );

      geometry.setAttribute(
        name,
        new THREE.InterleavedBufferAttribute(
          interleavedAttributesBuffer,
          attribute.itemSize,
          attribute.offset,
          attribute.normalized
        )
      );
    });

    return geometry;
  }

  private createInstanceMesh(
    group: THREE.Group,
    geometry: THREE.BufferGeometry,
    material: THREE.RawShaderMaterial,
    instanceId: string
  ): THREE.InstancedMesh {
    const mesh = new THREE.InstancedMesh(geometry, material, 0);
    group.add(mesh);
    mesh.frustumCulled = false;
    mesh.name = instanceId;

    mesh.onBeforeRender = (_0, _1, camera: THREE.Camera) => {
      (material.uniforms.inverseModelMatrix?.value as THREE.Matrix4)?.copy(mesh.matrixWorld).invert();
      (material.uniforms.cameraPosition?.value as THREE.Vector3)?.copy(camera.position);
    };

    mesh.userData.treeIndices = new Map<number, number>();

    mesh.updateMatrixWorld(true);

    return mesh;
  }

  private getAttributes<T extends THREE.BufferAttribute | THREE.InterleavedBufferAttribute>(
    geometry: THREE.BufferGeometry,
    filterType: new (...args: any[]) => T
  ): { name: string; attribute: T }[] {
    return Object.entries(geometry.attributes)
      .filter(namedAttribute => namedAttribute[1] instanceof filterType)
      .map(namedAttribute => {
        return { name: namedAttribute[0], attribute: namedAttribute[1] as T };
      });
  }

  private copyGeometryWithBufferAttributes(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
    const newGeometry = new THREE.BufferGeometry();

    this.getAttributes(geometry, THREE.BufferAttribute).forEach(namedAttribute => {
      newGeometry.setAttribute(namedAttribute.name, namedAttribute.attribute);
    });

    newGeometry.setIndex(geometry.getIndex());

    return newGeometry;
  }

  private getShaderMaterial(type: RevealGeometryCollectionType, materials: Materials) {
    switch (type) {
      case RevealGeometryCollectionType.BoxCollection:
        return materials.box;
      case RevealGeometryCollectionType.CircleCollection:
        return materials.circle;
      case RevealGeometryCollectionType.ConeCollection:
        return materials.cone;
      case RevealGeometryCollectionType.EccentricConeCollection:
        return materials.eccentricCone;
      case RevealGeometryCollectionType.EllipsoidSegmentCollection:
        return materials.ellipsoidSegment;
      case RevealGeometryCollectionType.GeneralCylinderCollection:
        return materials.generalCylinder;
      case RevealGeometryCollectionType.GeneralRingCollection:
        return materials.generalRing;
      case RevealGeometryCollectionType.QuadCollection:
        return materials.quad;
      case RevealGeometryCollectionType.TorusSegmentCollection:
        return materials.torusSegment;
      case RevealGeometryCollectionType.TrapeziumCollection:
        return materials.trapezium;
      case RevealGeometryCollectionType.NutCollection:
        return materials.nut;
      case RevealGeometryCollectionType.TriangleMesh:
        return materials.triangleMesh;
      case RevealGeometryCollectionType.InstanceMesh:
        return materials.instancedMesh;
      default:
        assertNever(type);
    }
  }
}
