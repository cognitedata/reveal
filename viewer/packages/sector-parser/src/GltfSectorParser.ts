/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import assert from 'assert';

import { setPrimitiveTopology } from './reveal-glb-parser/primitiveGeometries';
import {
  RevealGeometryCollectionType,
  Node,
  GlbHeaderData,
  GeometryProcessingPayload,
  Primitive,
  BufferView,
  GltfJson,
  ParsedGeometry
} from './types';
import { GlbMetadataParser } from './reveal-glb-parser/GlbMetadataParser';
import { TypedArrayConstructor } from '@reveal/utilities';

export class GltfSectorParser {
  private readonly _glbMetadataParser: GlbMetadataParser;

  // https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#accessortype-white_check_mark
  private static readonly COLLECTION_TYPE_SIZES = new Map<string, number>([
    ['SCALAR', 1],
    ['VEC2', 2],
    ['VEC3', 3],
    ['VEC4', 4],
    ['MAT2', 4],
    ['MAT3', 9],
    ['MAT4', 16]
  ]);

  // https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#accessorcomponenttype-white_check_mark
  private static readonly DATA_TYPE_BYTE_SIZES = new Map<number, TypedArrayConstructor>([
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
    const json = headers.json;
    return this.traverseDefaultSceneNodes(json, headers, data);
  }

  private traverseDefaultSceneNodes(json: GltfJson, headers: GlbHeaderData, data: ArrayBuffer) {
    const typedGeometryBuffers: ParsedGeometry[] = [];

    const defaultSceneNodeIds = json.scenes[json.scene].nodes;

    defaultSceneNodeIds
      .map(nodeId => json.nodes[nodeId])
      .forEach(node => {
        const processedNode = this.processNode(node, headers, data)!;
        if (processedNode === undefined) {
          return;
        }

        typedGeometryBuffers.push(processedNode);
      });

    return typedGeometryBuffers;
  }

  private processNode(node: Node, glbHeaderData: GlbHeaderData, data: ArrayBuffer): ParsedGeometry | undefined {
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
        assert(payload.instancingExtension !== undefined);
        return this.processInstancedTriangleMesh(payload);
      case RevealGeometryCollectionType.TriangleMesh:
        assert(payload.instancingExtension === undefined);
        this.processTriangleMesh(payload);
        break;
      default:
        assert(payload.instancingExtension !== undefined);
        this.processPrimitiveCollection(payload);
        break;
    }

    return { type: geometryType, geometryBuffer: bufferGeometry };
  }
  processInstancedTriangleMesh(payload: GeometryProcessingPayload) {
    const { bufferGeometry, glbHeaderData, meshId, data } = payload;

    const json = glbHeaderData.json;

    assert(meshId !== undefined);

    const mesh = json.meshes[meshId];

    assert(mesh.primitives.length === 1);
    assert(mesh.extras?.InstanceId !== undefined);

    const primitive = mesh.primitives[0];

    this.setIndexBuffer(payload, primitive, data, bufferGeometry);
    this.setPositionBuffer(payload, primitive, data, bufferGeometry);

    const primitivesAttributeNameTransformer = (attributeName: string) => `a${attributeName}`;

    this.setInterleavedBufferAttributes<THREE.InstancedInterleavedBuffer>(
      payload.glbHeaderData,
      payload.instancingExtension!.attributes,
      payload.data,
      primitivesAttributeNameTransformer,
      payload.bufferGeometry,
      THREE.InstancedInterleavedBuffer
    );

    return {
      type: RevealGeometryCollectionType.InstanceMesh,
      geometryBuffer: payload.bufferGeometry,
      instanceId: (mesh.extras.InstanceId as number).toString()
    };
  }

  private processPrimitiveCollection(payload: GeometryProcessingPayload) {
    assert(payload.instancingExtension !== null, 'Primitive does not contain the instanced gltf extension');

    setPrimitiveTopology(payload.geometryType, payload.bufferGeometry);

    // Our shaders use an 'a' prefix for attribute names
    const primitivesAttributeNameTransformer = (attributeName: string) => `a${attributeName}`;

    this.setInterleavedBufferAttributes<THREE.InstancedInterleavedBuffer>(
      payload.glbHeaderData,
      payload.instancingExtension!.attributes!,
      payload.data,
      primitivesAttributeNameTransformer,
      payload.bufferGeometry,
      THREE.InstancedInterleavedBuffer
    );
  }

  private processTriangleMesh(payload: GeometryProcessingPayload) {
    const { bufferGeometry, glbHeaderData, meshId, data } = payload;

    const json = glbHeaderData.json;

    assert(meshId !== undefined);

    const mesh = json.meshes[meshId];

    assert(mesh.primitives.length === 1);

    const primitive = mesh.primitives[0];

    this.setIndexBuffer(payload, primitive, data, bufferGeometry);

    this.setInterleavedBufferAttributes<THREE.InterleavedBuffer>(
      payload.glbHeaderData,
      primitive.attributes,
      payload.data,
      attributeNameTransformer,
      payload.bufferGeometry,
      THREE.InterleavedBuffer
    );

    function attributeNameTransformer(attributeName: string) {
      switch (attributeName) {
        case 'COLOR_0':
          return 'color';
        case 'POSITION':
          return 'position';
        case '_treeIndex':
          return 'treeIndex';
        default:
          throw new Error();
      }
    }
  }

  private setIndexBuffer(
    payload: GeometryProcessingPayload,
    primitive: Primitive,
    data: ArrayBuffer,
    bufferGeometry: THREE.InstancedBufferGeometry | THREE.BufferGeometry
  ) {
    const json = payload.glbHeaderData.json;

    const offsetToBinChunk = payload.glbHeaderData.byteOffsetToBinContent;

    const indicesAccessor = json.accessors[primitive.indices];
    const indicesBufferView = json.bufferViews[indicesAccessor.bufferView];
    indicesBufferView.byteOffset = indicesBufferView.byteOffset ?? 0;

    const IndicesTypedArrayConstructor = GltfSectorParser.DATA_TYPE_BYTE_SIZES.get(indicesAccessor.componentType)!;

    const indicesTypedArray = new IndicesTypedArrayConstructor(
      data,
      offsetToBinChunk + indicesBufferView.byteOffset,
      indicesBufferView.byteLength / IndicesTypedArrayConstructor.BYTES_PER_ELEMENT
    );

    const elementSize = GltfSectorParser.COLLECTION_TYPE_SIZES.get(indicesAccessor.type)!;

    bufferGeometry.setIndex(new THREE.BufferAttribute(indicesTypedArray, elementSize));
  }

  private setPositionBuffer(
    payload: GeometryProcessingPayload,
    primitive: Primitive,
    data: ArrayBuffer,
    bufferGeometry: THREE.InstancedBufferGeometry | THREE.BufferGeometry
  ) {
    const json = payload.glbHeaderData.json;

    const offsetToBinChunk = payload.glbHeaderData.byteOffsetToBinContent;

    const positionAccessor = json.accessors[primitive.attributes.POSITION];
    const positionBufferView = json.bufferViews[positionAccessor.bufferView];
    positionBufferView.byteOffset = positionBufferView.byteOffset ?? 0;

    const PositionTypedArrayConstructor = GltfSectorParser.DATA_TYPE_BYTE_SIZES.get(positionAccessor.componentType)!;

    const positionTypedArray = new PositionTypedArrayConstructor(
      data,
      offsetToBinChunk + positionBufferView.byteOffset,
      positionBufferView.byteLength / PositionTypedArrayConstructor.BYTES_PER_ELEMENT
    );

    const elementSize = GltfSectorParser.COLLECTION_TYPE_SIZES.get(positionAccessor.type)!;

    bufferGeometry.setAttribute('position', new THREE.BufferAttribute(positionTypedArray, elementSize));
  }

  private setInterleavedBufferAttributes<T extends THREE.InterleavedBuffer>(
    glbHeaderData: GlbHeaderData,
    attributes: {
      [key: string]: number;
    },
    data: ArrayBuffer,
    transformAttributeName: (attributeName: string) => string,
    bufferGeometry: THREE.BufferGeometry | THREE.InstancedBufferGeometry,
    bufferType: { new (array: ArrayLike<number>, stride: number): T }
  ) {
    const json = glbHeaderData.json;

    const bufferViewIds = Object.values(attributes).map(accessorId => json.accessors[accessorId].bufferView);

    assert(bufferViewIds.length > 0);

    const bufferViewId = bufferViewIds[0];

    for (let i = 1; i < bufferViewIds.length; i++) {
      assert(bufferViewIds[i] === bufferViewId, 'Unexpected number of unique buffer views');
    }

    const bufferView = json.bufferViews[bufferViewId];
    bufferView.byteOffset = bufferView.byteOffset ?? 0;

    const offsetToBinChunk = glbHeaderData.byteOffsetToBinContent;

    const componentTypes = Object.values(attributes).map(accessorId => json.accessors[accessorId].componentType);

    const typedArrayMap: { [key: string]: T } = this.getUniqueComponentViews<T>(
      componentTypes,
      data,
      offsetToBinChunk,
      bufferView,
      bufferType
    );

    this.setAttributes<T>(attributes, json, typedArrayMap, transformAttributeName, bufferGeometry);
  }

  private setAttributes<T extends THREE.InterleavedBuffer>(
    attributes: { [key: string]: number },
    json: GltfJson,
    typedArrayMap: { [key: string]: T },
    transformAttributeName: (attributeName: string) => string,
    bufferGeometry: THREE.InstancedBufferGeometry | THREE.BufferGeometry
  ) {
    Object.keys(attributes).forEach(attributeName => {
      const accessor = json.accessors[attributes[attributeName]];

      const byteOffset = accessor.byteOffset ?? 0;

      const interleavedBuffer = typedArrayMap[accessor.componentType];
      const size = GltfSectorParser.COLLECTION_TYPE_SIZES.get(accessor.type);

      assert(size !== undefined);

      const elementType = GltfSectorParser.DATA_TYPE_BYTE_SIZES.get(accessor.componentType);

      assert(elementType !== undefined);

      const elementSize = elementType.BYTES_PER_ELEMENT;

      assert(elementSize !== undefined);

      const interleavedBufferAttribute = new THREE.InterleavedBufferAttribute(
        interleavedBuffer,
        size,
        byteOffset / elementSize
      );
      const transformedAttributeName = transformAttributeName(attributeName);
      bufferGeometry.setAttribute(transformedAttributeName, interleavedBufferAttribute);
    });
  }

  private getUniqueComponentViews<T extends THREE.InterleavedBuffer>(
    componentTypes: number[],
    data: ArrayBuffer,
    offsetToBinChunk: number,
    bufferView: BufferView,
    bufferType: new (array: ArrayLike<number>, stride: number) => T
  ) {
    const byteOffset = bufferView.byteOffset ?? 0;

    const typedArrays = [...new Set(componentTypes)].map(componentType => {
      const TypedArray = GltfSectorParser.DATA_TYPE_BYTE_SIZES.get(componentType)!;
      const typedBuffer = new TypedArray(
        data,
        offsetToBinChunk + byteOffset,
        bufferView.byteLength / TypedArray.BYTES_PER_ELEMENT
      );
      const interleavedBuffer = new bufferType(typedBuffer, bufferView.byteStride / TypedArray.BYTES_PER_ELEMENT);
      return { componentType: componentType, interleavedBuffer: interleavedBuffer };
    });

    const typedArrayMap: { [key: string]: T } = Object.assign(
      {},
      ...typedArrays.map(p => ({ [p.componentType]: p.interleavedBuffer }))
    );
    return typedArrayMap;
  }
}
