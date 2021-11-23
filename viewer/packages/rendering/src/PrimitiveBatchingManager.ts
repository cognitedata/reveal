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

  private readonly _views = new Map<number, TypedArrayConstructor>([
    [1, Uint8Array],
    [4, Float32Array]
  ]);

  constructor(group: THREE.Group, materials: Materials) {
    this._primtivesGroup = group;
    this._materials = materials;
    this._map = new Map();
  }

  public batchPrimitives(primitives: [RevealGeometryCollectionType, THREE.BufferGeometry][]) {
    primitives.forEach(primitive => {
      const [type, buffer] = primitive;
      this.processPrimitive(buffer, type);
    });
  }

  private processPrimitive(buffer: THREE.BufferGeometry, type: RevealGeometryCollectionType) {
    const instanceAttributes = Object.keys(buffer.attributes)
      .filter(attribute => buffer.attributes[attribute] instanceof THREE.InterleavedBufferAttribute)
      .map(name => {
        return { name: name, attribute: buffer.attributes[name] as THREE.InterleavedBufferAttribute };
      });

    assert(instanceAttributes.length > 0);

    const interleavedBufferView = instanceAttributes[0].attribute.array as TypedArray;

    for (let i = 1; i < instanceAttributes.length; i++) {
      const instanceAttributeBufferView = instanceAttributes[i].attribute.array;
      assert(interleavedBufferView.buffer.byteLength === (instanceAttributeBufferView as TypedArray).buffer.byteLength);
    }

    const key = RevealGeometryCollectionType[type].toString();

    const payload = this._map.get(key);

    const interleavedArrayBuffer = interleavedBufferView.buffer;

    if (payload === undefined) {
      const length = interleavedBufferView.byteLength;
      const offset = interleavedBufferView.byteOffset;

      const geometry = this.createGeometry(buffer);

      const interleavedAttributesDefragBuffer = new DynamicDefragmentedBuffer(length * 50, Uint8Array);
      const interleavedAttributesView = new Uint8Array(interleavedArrayBuffer, offset, length);
      interleavedAttributesDefragBuffer.add(interleavedAttributesView);

      instanceAttributes.forEach(instanceAttribute => {
        const { name, attribute } = instanceAttribute;

        const stride = attribute.data.stride;
        const componentSize = (attribute.array as TypedArray).BYTES_PER_ELEMENT;

        const underlyingBuffer = interleavedAttributesDefragBuffer.bufferView.buffer;
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

      const material = this.getShaderMaterial(type, this._materials);
      const instanceMesh = this.createInstanceMesh(this._primtivesGroup, geometry, material);
      instanceMesh.count = instanceAttributes[0].attribute.count;
      this._map.set(key, [interleavedAttributesDefragBuffer, instanceMesh]);
    } else {
      const [defragBuffer, mesh] = payload;
      const length = interleavedBufferView.byteLength;
      const offset = interleavedBufferView.byteOffset;

      const interleavedAttributesView = new Uint8Array(interleavedArrayBuffer, offset, length);
      defragBuffer.add(interleavedAttributesView);
      mesh.count += instanceAttributes[0].attribute.count;
    }
  }

  private createInstanceMesh(
    group: THREE.Group,
    geometry: THREE.BufferGeometry,
    material: THREE.ShaderMaterial
  ): THREE.InstancedMesh {
    const mesh = new THREE.InstancedMesh(geometry, material, 0);
    group.add(mesh);
    mesh.frustumCulled = false;

    if (material.uniforms.inverseModelMatrix !== undefined) {
      mesh.onBeforeRender = () => {
        const inverseModelMatrix: THREE.Matrix4 = material.uniforms.inverseModelMatrix.value;
        inverseModelMatrix.copy(mesh.matrixWorld).invert();
      };
    }

    return mesh;
  }

  private createGeometry(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
    const newGeometry = new THREE.BufferGeometry();

    Object.keys(geometry.attributes)
      .filter(attribute => geometry.attributes[attribute] instanceof THREE.BufferAttribute)
      .forEach(name => {
        const attribute = geometry.attributes[name] as THREE.BufferAttribute;
        newGeometry.setAttribute(name, attribute);
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
