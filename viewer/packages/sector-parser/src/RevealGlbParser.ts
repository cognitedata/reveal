/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

import assert from 'assert';
import { setPrimitiveTopology } from './primitiveGeometries';
import {
  RevealGeometryCollectionType,
  Node,
  GlbHeaderData,
  GeometryProcessingPayload,
  TypedArrayConstructor
} from './types';
import { GlbMetadataParser } from './reveal-glb-parser/GlbMetadataParser';

export class RevealGlbParser {
  private _glbMetadataParser: GlbMetadataParser;

  // https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#accessortype-white_check_mark
  private readonly COLLECTION_TYPE_SIZES = new Map<string, number>([
    ['SCALAR', 1],
    ['VEC2', 2],
    ['VEC3', 3],
    ['VEC4', 4],
    ['MAT2', 4],
    ['MAT3', 9],
    ['MAT4', 16]
  ]);

  // https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#accessorcomponenttype-white_check_mark
  private readonly DATA_TYPE_BYTE_SIZES = new Map<number, TypedArrayConstructor>([
    [5120, Int8Array],
    [5121, Uint8Array],
    [5122, Int16Array],
    [5123, Uint16Array],
    [5125, Uint32Array],
    [5126, Float32Array]
  ]);

  constructor() {
    this._glbMetadataParser = new GlbMetadataParser();
  }

  public parseSector(data: ArrayBuffer) {
    const headers = this._glbMetadataParser.parseGlbMetadata(data);

    const typedGeometryBuffers: { type: RevealGeometryCollectionType; buffer: THREE.BufferGeometry }[] = [];

    const json = headers.json;

    json.scenes[json.scene].nodes.forEach(nodeId => {
      const node = json.nodes[nodeId];

      const processedNode = this.processNode(node, headers, data)!;

      if (processedNode === undefined) {
        return;
      }

      const { buffer, type } = processedNode;

      typedGeometryBuffers.push({ type, buffer });
    });

    return typedGeometryBuffers;
  }

  private processNode(node: Node, glbHeaderData: GlbHeaderData, data: ArrayBuffer) {
    const instancingExtension = node.extensions?.EXT_mesh_gpu_instancing;
    const meshId = node.mesh;

    if (instancingExtension === undefined && meshId === undefined) return undefined;

    const bufferGeometry = instancingExtension ? new THREE.InstancedBufferGeometry() : new THREE.BufferGeometry();

    const geometryType = RevealGeometryCollectionType[node.name as keyof typeof RevealGeometryCollectionType];

    const payload: GeometryProcessingPayload = {
      bufferGeometry,
      geometryType,
      glbHeaderData,
      instancingExtension: instancingExtension,
      meshId,
      data
    };

    switch (geometryType) {
      case RevealGeometryCollectionType.InstanceMesh:
        //   instanceId = this.processInstancedMesh(mesh, instanced, bufferGeometry);
        break;
      case RevealGeometryCollectionType.TriangleMesh:
        assert(payload.instancingExtension === undefined);
        this.processTriangleMesh(payload);
        break;
      default:
        assert(payload.instancingExtension !== undefined);
        this.processPrimitiveCollection(payload);
        break;
    }

    return { type: geometryType, buffer: bufferGeometry };
  }
  processTriangleMesh(payload: GeometryProcessingPayload) {
    const { bufferGeometry, glbHeaderData, meshId, data } = payload;

    const json = glbHeaderData.json;

    assert(meshId !== undefined);

    const mesh = json.meshes[meshId];

    assert(mesh.primitives.length === 1);

    const primitive = mesh.primitives[0];

    const offsetToBinChunk = payload.glbHeaderData.byteOffsetToBinContent;

    const indicesAccessor = json.accessors[primitive.indices];
    const indicesBufferView = json.bufferViews[indicesAccessor.bufferView];

    const IndicesTypedArrayConstructor = this.DATA_TYPE_BYTE_SIZES.get(indicesAccessor.componentType)!;

    const indicesTypedArray = new IndicesTypedArrayConstructor(
      data,
      offsetToBinChunk + (indicesBufferView.byteOffset ?? 0),
      indicesBufferView.byteLength / IndicesTypedArrayConstructor.BYTES_PER_ELEMENT
    );

    const elementSize = this.COLLECTION_TYPE_SIZES.get(indicesAccessor.type)!;

    bufferGeometry.setIndex(new THREE.BufferAttribute(indicesTypedArray, elementSize));

    const uniqueBufferViews = [
      ...new Set(Object.values(primitive.attributes).map(accessorId => json.accessors[accessorId].bufferView))
    ];

    assert(uniqueBufferViews.length === 1, 'Unexpected number of buffer views');

    const bufferView = json.bufferViews[uniqueBufferViews[0]];

    const componentTypes = Object.values(primitive.attributes).map(
      accessorId => json.accessors[accessorId].componentType
    );

    const typedArrays = [...new Set(componentTypes)].map(componentType => {
      const TypedArray = this.DATA_TYPE_BYTE_SIZES.get(componentType)!;
      const typedBuffer = new TypedArray(
        data,
        offsetToBinChunk + (bufferView.byteOffset ?? 0),
        bufferView.byteLength / TypedArray.BYTES_PER_ELEMENT
      );
      const interleavedBuffer = new THREE.InterleavedBuffer(
        typedBuffer,
        bufferView.byteStride / TypedArray.BYTES_PER_ELEMENT
      );
      return { componentType: componentType, interleavedBuffer: interleavedBuffer };
    });

    const typedArrayMap: { [key: string]: THREE.InterleavedBuffer } = Object.assign(
      {},
      ...typedArrays.map(p => ({ [p.componentType]: p.interleavedBuffer }))
    );

    Object.keys(primitive.attributes).forEach(attributeName => {
      const accessor = json.accessors[primitive.attributes[attributeName]];
      const interleavedBuffer = typedArrayMap[accessor.componentType!];
      const size = this.COLLECTION_TYPE_SIZES.get(accessor.type)!;

      const elementSize = this.DATA_TYPE_BYTE_SIZES.get(accessor.componentType!)?.BYTES_PER_ELEMENT;

      assert(elementSize !== undefined);

      const interleavedBufferAttribute = new THREE.InterleavedBufferAttribute(
        interleavedBuffer,
        size,
        (accessor.byteOffset ?? 0) / elementSize
      );

      switch (attributeName) {
        case 'COLOR_0':
          attributeName = 'color';
          break;
        case 'POSITION':
          attributeName = 'position';
          break;
        case '_treeIndex':
          attributeName = 'a_treeIndex';
        default:
          break;
      }

      bufferGeometry.setAttribute(`${attributeName}`, interleavedBufferAttribute);
    });
  }

  private processPrimitiveCollection(payload: GeometryProcessingPayload) {
    assert(payload.instancingExtension !== null, 'Primitive does not contain the instanced gltf extension');

    setPrimitiveTopology(payload.geometryType, payload.bufferGeometry);

    this.setInstancedAttributes(payload);
  }

  private setInstancedAttributes(payload: GeometryProcessingPayload) {
    const { bufferGeometry, glbHeaderData, instancingExtension, data } = payload;

    const json = glbHeaderData.json;

    const instancedAttributes = instancingExtension!.attributes;

    const uniqueBufferViews = [
      ...new Set(Object.values(instancedAttributes).map(accessorId => json.accessors[accessorId].bufferView))
    ];

    assert(uniqueBufferViews.length === 1, 'Unexpected number of buffer views');

    const bufferView = json.bufferViews[uniqueBufferViews[0]];

    const offsetToBinChunk = glbHeaderData.byteOffsetToBinContent;

    const componentTypes = Object.values(instancedAttributes).map(
      accessorId => json.accessors[accessorId].componentType
    );

    const typedArrays = [...new Set(componentTypes)].map(componentType => {
      const TypedArray = this.DATA_TYPE_BYTE_SIZES.get(componentType)!;
      const typedBuffer = new TypedArray(
        data,
        offsetToBinChunk + (bufferView.byteOffset ?? 0),
        bufferView.byteLength / TypedArray.BYTES_PER_ELEMENT
      );
      const interleavedBuffer = new THREE.InstancedInterleavedBuffer(
        typedBuffer,
        bufferView.byteStride / TypedArray.BYTES_PER_ELEMENT
      );
      return { componentType: componentType, interleavedBuffer: interleavedBuffer };
    });

    const typedArrayMap: { [key: string]: THREE.InstancedInterleavedBuffer } = Object.assign(
      {},
      ...typedArrays.map(p => ({ [p.componentType]: p.interleavedBuffer }))
    );

    Object.keys(instancedAttributes).forEach(attributeName => {
      const accessor = json.accessors[instancedAttributes[attributeName]];
      const interleavedBuffer = typedArrayMap[accessor.componentType!];
      const size = this.COLLECTION_TYPE_SIZES.get(accessor.type)!;

      const elementSize = this.DATA_TYPE_BYTE_SIZES.get(accessor.componentType!)?.BYTES_PER_ELEMENT;

      assert(elementSize !== undefined);

      const interleavedBufferAttribute = new THREE.InterleavedBufferAttribute(
        interleavedBuffer,
        size,
        (accessor.byteOffset ?? 0) / elementSize
      );
      bufferGeometry.setAttribute(`a${attributeName}`, interleavedBufferAttribute);
    });
  }
}
