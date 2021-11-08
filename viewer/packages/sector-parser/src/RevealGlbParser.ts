/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

import { assertNever } from '../../../core/src/utilities';
import assert from 'assert';
import {
  setBoxGeometry,
  setConeGeometry,
  setNutGeometry,
  setQuadGeometry,
  setTorusGeometry,
  setTrapeziumGeometry
} from './primitiveGeometries';
import {
  GltfJson,
  RevealGeometryCollectionType,
  Node,
  GlbHeaderData,
  GeometryProcessingPayload,
  TypedArrayConstructor
} from './types';

export class RevealGlbParser {
  private readonly _textDecoder: TextDecoder;
  private readonly _gltfHeaderByteSize = 12;
  private readonly _chunkHeaderByteSize = 8;

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
    this._textDecoder = new TextDecoder();
  }

  public parseSector(data: ArrayBuffer) {
    const view = new DataView(data);

    this.parseGlbHeaders(data, view);

    const { length: jsonChunkLength, json } = this.parseJson(view, data);

    this.parseBinHeaders(view, data, jsonChunkLength);

    const typedGeometryBuffers: { type: RevealGeometryCollectionType; buffer: THREE.BufferGeometry }[] = [];

    const headers: GlbHeaderData = {
      gltfHeaderByteSize: 12,
      chunkHeaderByteSize: 8,
      jsonChunkByteLength: jsonChunkLength
    };

    json.scenes[json.scene].nodes.forEach(nodeId => {
      const node = json.nodes[nodeId];

      const processedNode = this.processNode(node, json, headers, data)!;

      if (processedNode === undefined) {
        return;
      }

      const { buffer, type } = processedNode;

      typedGeometryBuffers.push({ type, buffer });
    });

    return typedGeometryBuffers;
  }

  private processNode(node: Node, json: GltfJson, glbHeaderData: GlbHeaderData, data: ArrayBuffer) {
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
      json,
      data
    };

    switch (geometryType) {
      case RevealGeometryCollectionType.InstanceMesh:
        //   instanceId = this.processInstancedMesh(mesh, instanced, bufferGeometry);
        break;
      case RevealGeometryCollectionType.TriangleMesh:
        assert(payload.meshId !== undefined);
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
    const { bufferGeometry, json, glbHeaderData, meshId, data } = payload;

    const mesh = json.meshes[meshId!];

    assert(mesh.primitives.length === 1);

    const primitive = mesh.primitives[0];

    const offsetToBinChunk =
      glbHeaderData.gltfHeaderByteSize + glbHeaderData.chunkHeaderByteSize * 2 + glbHeaderData.jsonChunkByteLength;

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

    this.setPrimitiveTopology(payload.geometryType, payload.bufferGeometry);
    this.setInstancedAttributes(payload);
  }

  private setInstancedAttributes(payload: GeometryProcessingPayload) {
    const { bufferGeometry, json, glbHeaderData, instancingExtension, data } = payload;

    const instancedAttributes = instancingExtension!.attributes;

    const uniqueBufferViews = [
      ...new Set(Object.values(instancedAttributes).map(accessorId => json.accessors[accessorId].bufferView))
    ];

    assert(uniqueBufferViews.length === 1, 'Unexpected number of buffer views');

    const bufferView = json.bufferViews[uniqueBufferViews[0]];

    const offsetToBinChunk =
      glbHeaderData.gltfHeaderByteSize + glbHeaderData.chunkHeaderByteSize * 2 + glbHeaderData.jsonChunkByteLength;

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

  private parseBinHeaders(view: DataView, data: ArrayBuffer, offset: number) {
    const totOff = this._gltfHeaderByteSize + this._chunkHeaderByteSize + offset;
    const binChunkLength = view.getUint32(totOff, true);
    const binChunkType = this._textDecoder.decode(new Uint8Array(data, totOff + 4, 4));

    assert(binChunkType.includes('BIN'));

    return binChunkLength;
  }

  private parseJson(view: DataView, data: ArrayBuffer): { length: number; json: GltfJson } {
    const jsonChunkLength = view.getUint32(12, true);
    const jsonChunckType = this._textDecoder.decode(new Uint8Array(data, 16, 4));

    assert(jsonChunckType === 'JSON');

    const jsonBytes = new Uint8Array(data, 20, jsonChunkLength);
    const json = JSON.parse(this._textDecoder.decode(jsonBytes));

    const typedJson = json as GltfJson;

    assert(typedJson !== undefined, 'Failed to assign types to gltf json');
    return { length: jsonChunkLength, json: typedJson };
  }

  private parseGlbHeaders(data: ArrayBuffer, view: DataView) {
    const magicBytes = this._textDecoder.decode(new Uint8Array(data, 0, 4));
    const version = view.getUint32(4, true);
    //const length = view.getUint32(8, true);

    assert(magicBytes === 'glTF', 'Unknown file format');
    assert(version === 2, `Unsupported glTF version{${version}}`);
  }

  private setPrimitiveTopology(primitiveCollectionName: RevealGeometryCollectionType, geometry: THREE.BufferGeometry) {
    switch (primitiveCollectionName) {
      case RevealGeometryCollectionType.BoxCollection:
        setBoxGeometry(geometry);
        break;
      case RevealGeometryCollectionType.CircleCollection:
        setQuadGeometry(geometry); // should use the position as normal
        break;
      case RevealGeometryCollectionType.ConeCollection:
        setConeGeometry(geometry);
        break;
      case RevealGeometryCollectionType.EccentricConeCollection:
        setConeGeometry(geometry);
        break;
      case RevealGeometryCollectionType.EllipsoidSegmentCollection:
        setConeGeometry(geometry);
        break;
      case RevealGeometryCollectionType.GeneralCylinderCollection:
        setConeGeometry(geometry);
        break;
      case RevealGeometryCollectionType.GeneralRingCollection:
        setQuadGeometry(geometry, false);
        break;
      case RevealGeometryCollectionType.NutCollection:
        setNutGeometry(geometry);
        break;
      case RevealGeometryCollectionType.QuadCollection:
        setQuadGeometry(geometry);
        break;
      case RevealGeometryCollectionType.TrapeziumCollection:
        setTrapeziumGeometry(geometry);
        break;
      case RevealGeometryCollectionType.TorusSegmentCollection:
        setTorusGeometry(geometry);
        break;
      case RevealGeometryCollectionType.InstanceMesh:
        break;
      case RevealGeometryCollectionType.TriangleMesh:
        break;
      default:
        assertNever(primitiveCollectionName);
    }
  }
}
