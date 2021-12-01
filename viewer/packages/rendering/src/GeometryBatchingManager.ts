/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

import { ParsedGeometry, RevealGeometryCollectionType } from '@reveal/sector-parser';
import assert from 'assert';
import { assertNever, DynamicDefragmentedBuffer, TypedArray, TypedArrayConstructor } from '@reveal/utilities';
import { Materials } from './rendering/materials';

export class GeometryBatchingManager {
  private readonly _batchedGeometriesGroup: THREE.Group;

  private readonly _materials: Materials;

  private readonly _instancedTypeMap: Map<string, [DynamicDefragmentedBuffer<Uint8Array>, THREE.InstancedMesh]>;
  private readonly _sectorMap: Map<number, [string, number, number][]>;

  private readonly _views = new Map<number, TypedArrayConstructor>([
    [1, Uint8Array],
    [4, Float32Array]
  ]);

  constructor(group: THREE.Group, materials: Materials) {
    this._batchedGeometriesGroup = group;
    this._materials = materials;
    this._instancedTypeMap = new Map();
    this._sectorMap = new Map();
  }

  public batchGeometries(geometryBatchingQueue: ParsedGeometry[], sectorId: number) {
    if (this._sectorMap.get(sectorId) !== undefined) {
      return;
    }

    geometryBatchingQueue.forEach(geometry => {
      const { type, geometryBuffer, instanceId } = geometry;
      this.processGeometries(geometryBuffer, instanceId, type, sectorId);
    });
  }

  public removeSectorBatches(sectorId: number) {
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

      const [defragBuffer, mesh] = geometry;
      defragBuffer.remove(batchId);

      const instanceAttributes = this.getAttributes(mesh.geometry, THREE.InterleavedBufferAttribute);

      instanceAttributes.forEach(namedAttribute => {
        namedAttribute.attribute.needsUpdate = true;
      });

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

    assert(instanceId !== undefined);

    const instanceMeshGeometry =
      this._instancedTypeMap.get(instanceId) ?? this.createInstanceMeshGeometry(sectorBufferGeometry, type, instanceId);

    const interleavedArrayBuffer = interleavedBufferView.buffer;

    const [defragBuffer, mesh] = instanceMeshGeometry;
    const length = interleavedBufferView.byteLength;
    const offset = interleavedBufferView.byteOffset;

    const interleavedAttributesView = new Uint8Array(interleavedArrayBuffer, offset, length);
    const { batchId, bufferIsReallocated } = defragBuffer.add(interleavedAttributesView);
    const sectorBatches = this._sectorMap.get(sectorId) ?? this.createSectorBatch(sectorId);

    assert(instanceAttributes.length > 0);

    const instanceCount = instanceAttributes[0].attribute.count;
    sectorBatches.push([instanceId, batchId, instanceCount]);

    if (bufferIsReallocated) {
      this.reallocateBufferGeometry(mesh, defragBuffer);
    } else {
      this.updateInstanceAttributes(mesh);
    }

    mesh.count += instanceCount;
  }

  private updateInstanceAttributes(mesh: THREE.InstancedMesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>) {
    this.getAttributes(mesh.geometry, THREE.InterleavedBufferAttribute).forEach(namedAttribute => {
      namedAttribute.attribute.data.needsUpdate = true;
    });
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
  ): [
    DynamicDefragmentedBuffer<Uint8Array>,
    THREE.InstancedMesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>
  ] {
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

    this._instancedTypeMap.set(instanceId, [interleavedAttributesDefragBuffer, instanceMesh]);

    return [interleavedAttributesDefragBuffer, instanceMesh];
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
      const ComponentType = this._views.get(componentSize)!;
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
    material: THREE.ShaderMaterial,
    instanceId: string
  ): THREE.InstancedMesh {
    const mesh = new THREE.InstancedMesh(geometry, material, 0);
    group.add(mesh);
    mesh.frustumCulled = false;
    mesh.name = instanceId;

    mesh.onBeforeRender = (_0, _1, camera: THREE.Camera) => {
      (material.uniforms.inverseModelMatrix?.value as THREE.Matrix4)?.copy(mesh.matrixWorld).invert();
      (material.uniforms.modelMatrix?.value as THREE.Matrix4)?.copy(mesh.matrixWorld);
      (material.uniforms.viewMatrix?.value as THREE.Matrix4)?.copy(camera.matrixWorld).invert();
      (material.uniforms.projectionMatrix?.value as THREE.Matrix4)?.copy(camera.projectionMatrix);
      (material.uniforms.normalMatrix?.value as THREE.Matrix3)?.copy(mesh.normalMatrix);
      (material.uniforms.cameraPosition?.value as THREE.Vector3)?.copy(camera.position);
    };

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
