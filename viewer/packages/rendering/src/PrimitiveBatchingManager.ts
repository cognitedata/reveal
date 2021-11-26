/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

import { RevealGeometryCollectionType } from '@reveal/sector-parser';
import assert from 'assert';
import { assertNever, DynamicDefragmentedBuffer } from '@reveal/utilities';
import { Materials } from './rendering/materials';

type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array;

type TypedArrayConstructor =
  | Int8ArrayConstructor
  | Uint8ArrayConstructor
  | Int16ArrayConstructor
  | Uint16ArrayConstructor
  | Int32ArrayConstructor
  | Uint32ArrayConstructor
  | Uint8ClampedArrayConstructor
  | Float32ArrayConstructor
  | Float64ArrayConstructor;

export class PrimitiveBatchingManager {
  private readonly _primtivesGroup: THREE.Group;

  private readonly _materials: Materials;

  private readonly _map: Map<string, [DynamicDefragmentedBuffer<Uint8Array>, THREE.InstancedMesh]>;
  private readonly _sectorMap: Map<number, [string, number, number][]>;

  private readonly _views = new Map<number, TypedArrayConstructor>([
    [1, Uint8Array],
    [4, Float32Array]
  ]);

  constructor(group: THREE.Group, materials: Materials) {
    this._primtivesGroup = group;
    this._materials = materials;
    this._map = new Map();
    this._sectorMap = new Map();
  }

  public batchPrimitives(
    primitives: [RevealGeometryCollectionType, THREE.BufferGeometry, string | undefined][],
    sectorId: number
  ) {
    if (this._sectorMap.get(sectorId) !== undefined) {
      return;
    }

    primitives.forEach(primitive => {
      const [type, buffer, instanceId] = primitive;
      this.processPrimitive(buffer, instanceId, type, sectorId);
    });
  }

  public removeSectorBatches(sectorId: number) {
    const typeBatches = this._sectorMap.get(sectorId);

    if (typeBatches === undefined) {
      return;
    }

    typeBatches.forEach(typeBatch => {
      const [type, batchId, instanceCount] = typeBatch;

      const geometry = this._map.get(type);

      if (geometry === undefined) {
        return;
      }

      const [defragBuffer, mesh] = geometry;
      defragBuffer.remove(batchId);

      const instanceAttributes = this.getAttributes(mesh.geometry, THREE.InterleavedBufferAttribute);

      instanceAttributes.forEach(p => {
        p.attribute.needsUpdate = true;
      });

      mesh.count -= instanceCount;
    });

    this._sectorMap.delete(sectorId);
  }

  private processPrimitive(
    rawSectorBufferGeometry: THREE.BufferGeometry,
    instanceId: string | undefined,
    type: RevealGeometryCollectionType,
    sectorId: number
  ) {
    const instanceAttributes = this.getAttributes(rawSectorBufferGeometry, THREE.InterleavedBufferAttribute);
    const interleavedBufferView = this.getInstanceAttributesSharedView(instanceAttributes);

    assert(instanceId !== undefined);

    let payload = this._map.get(instanceId);

    const interleavedArrayBuffer = interleavedBufferView.buffer;

    if (payload === undefined) {
      const interleavedAttributesDefragBuffer = new DynamicDefragmentedBuffer(64, Uint8Array);
      const defragmentedBufferGeometry = this.createDefragmentedBufferGeometry(
        rawSectorBufferGeometry,
        interleavedAttributesDefragBuffer
      );
      const material = this.getShaderMaterial(type, this._materials);
      const instanceMesh = this.createInstanceMesh(
        this._primtivesGroup,
        defragmentedBufferGeometry,
        material,
        instanceId
      );

      payload = [interleavedAttributesDefragBuffer, instanceMesh];

      this._map.set(instanceId, [interleavedAttributesDefragBuffer, instanceMesh]);
    }

    const [defragBuffer, mesh] = payload;
    const length = interleavedBufferView.byteLength;
    const offset = interleavedBufferView.byteOffset;

    const interleavedAttributesView = new Uint8Array(interleavedArrayBuffer, offset, length);
    const { batchId, bufferIsReallocated } = defragBuffer.add(interleavedAttributesView);
    let sectorBatches = this._sectorMap.get(sectorId);

    if (sectorBatches === undefined) {
      const sectorBatchInstance: [string, number, number][] = [];
      this._sectorMap.set(sectorId, sectorBatchInstance);
      sectorBatches = sectorBatchInstance;
    }

    const instanceCount = instanceAttributes[0].attribute.count;
    sectorBatches.push([instanceId, batchId, instanceCount]);

    if (bufferIsReallocated) {
      const defragmentedBufferGeometry = this.createDefragmentedBufferGeometry(mesh.geometry, defragBuffer);
      mesh.geometry.dispose();
      mesh.geometry = defragmentedBufferGeometry;
    } else {
      this.getAttributes(mesh.geometry, THREE.InterleavedBufferAttribute).forEach(namedAttribute => {
        namedAttribute.attribute.data.needsUpdate = true;
      });
    }

    mesh.count += instanceCount;
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

    const geometry = this.createGeometry(bufferGeometry);

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

    mesh.onBeforeRender = (_1, _2, camera: THREE.Camera) => {
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
      .filter(p => p[1] instanceof filterType)
      .map(p => {
        return { name: p[0], attribute: p[1] as T };
      });
  }

  private createGeometry(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
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
