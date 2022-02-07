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
import { TypedArray, TypedArrayConstructor } from '@reveal/utilities';
import type { Attribute, DataType, Decoder, DecoderModule, Mesh } from 'draco3dgltf';
import DracoDecoderModule from './draco_decoder_gltf.js';

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

  private readonly _dracoDecoderModule: Promise<DecoderModule>;

  constructor() {
    this._glbMetadataParser = new GlbMetadataParser();
    this._dracoDecoderModule = DracoDecoderModule();
  }

  public async parseSector(data: ArrayBuffer): Promise<ParsedGeometry[]> {
    const headers = this._glbMetadataParser.parseGlbMetadata(data);
    const json = headers.json;

    return this.traverseDefaultSceneNodes(json, headers, data);
  }

  private async traverseDefaultSceneNodes(json: GltfJson, headers: GlbHeaderData, data: ArrayBuffer) {
    const typedGeometryBuffers: ParsedGeometry[] = [];

    const defaultSceneNodeIds = json.scenes[json.scene].nodes;

    await Promise.all(
      defaultSceneNodeIds
        .map(nodeId => json.nodes[nodeId])
        .map(async node => {
          const processedNode = await this.processNode(node, headers, data)!;
          if (processedNode === undefined) {
            return;
          }

          typedGeometryBuffers.push(processedNode);
        })
    );

    return typedGeometryBuffers;
  }

  private async processNode(
    node: Node,
    glbHeaderData: GlbHeaderData,
    data: ArrayBuffer
  ): Promise<ParsedGeometry> | undefined {
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
        await this.processTriangleMesh(payload);
        break;
      default:
        assert(payload.instancingExtension !== undefined);
        this.processPrimitiveCollection(payload);
        break;
    }

    return { type: geometryType, geometryBuffer: bufferGeometry };
  }

  processInstancedTriangleMesh(payload: GeometryProcessingPayload): ParsedGeometry {
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

  private async processTriangleMesh(payload: GeometryProcessingPayload) {
    const { bufferGeometry, glbHeaderData, meshId, data } = payload;

    const json = glbHeaderData.json;

    assert(meshId !== undefined);

    const mesh = json.meshes[meshId];

    assert(mesh.primitives.length === 1);

    const primitive = mesh.primitives[0];
    const dracoCompression = primitive.extensions?.KHR_draco_mesh_compression;

    if (dracoCompression !== undefined) {
      const dracoBufferView = json.bufferViews[dracoCompression.bufferView];

      const offsetToBinChunk = payload.glbHeaderData.byteOffsetToBinContent;

      const asd = new Int8Array(data, offsetToBinChunk + dracoBufferView.byteOffset, dracoBufferView.byteLength);

      const module = await this._dracoDecoderModule;

      const buffer = new module.DecoderBuffer();
      buffer.Init(asd, asd.length);

      const decoder = new module.Decoder();
      const geometryType = decoder.GetEncodedGeometryType(buffer);
      if (geometryType === module.TRIANGULAR_MESH) {
        const dracoMesh = new module.Mesh();
        const status = decoder.DecodeBufferToMesh(buffer, dracoMesh);

        if (!status.ok() || dracoMesh.ptr === 0) {
          throw new Error(`Failed to decode draco mesh. Error: ${status.error_msg()}`);
        }

        const indices = decodeIndex(decoder, dracoMesh, module);
        bufferGeometry.setIndex(new THREE.BufferAttribute(indices, 1));
        const draco_data_type = new Map<number, DataType>([
          [5120, module.DT_INT8],
          [5121, module.DT_UINT8],
          [5122, module.DT_INT16],
          [5123, module.DT_UINT16],
          [5125, module.DT_UINT32],
          [5126, module.DT_FLOAT32]
        ]);

        const attributesBufferLength = Object.keys(primitive.attributes).map(attributeName => {
          const dracoAttribute = decoder.GetAttributeByUniqueId(dracoMesh, dracoCompression.attributes[attributeName]);
          const componentType = json.accessors[primitive.attributes[attributeName]].componentType;

          return {
            attributeName,
            numberOfValues: dracoMesh.num_points() * dracoAttribute.num_components(),
            componentType
          };
        });

        const cummulativeLength = attributesBufferLength.reduce(
          (parialSum, element) =>
            parialSum +
            element.numberOfValues *
              GltfSectorParser.DATA_TYPE_BYTE_SIZES.get(element.componentType)!.BYTES_PER_ELEMENT,
          0
        );

        const stride = attributesBufferLength
          .map(p => {
            const { attributeName, componentType } = p;
            const dracoAttribute = decoder.GetAttributeByUniqueId(
              dracoMesh,
              dracoCompression.attributes[attributeName]
            );

            return (
              dracoAttribute.num_components() *
              GltfSectorParser.DATA_TYPE_BYTE_SIZES.get(componentType)!.BYTES_PER_ELEMENT
            );
          })
          .reduce((partialSum, element) => partialSum + element, 0);

        const ptr = module._malloc(cummulativeLength);

        let cummulative = 0;

        attributesBufferLength.forEach(attrData => {
          const { attributeName, numberOfValues, componentType } = attrData;
          const dracoType = draco_data_type.get(componentType)!;
          const dracoAttribute = decoder.GetAttributeByUniqueId(dracoMesh, dracoCompression.attributes[attributeName]);
          const byteLength =
            numberOfValues * GltfSectorParser.DATA_TYPE_BYTE_SIZES.get(componentType)!.BYTES_PER_ELEMENT;
          decoder.GetAttributeDataArrayForAllPoints(
            dracoMesh,
            dracoAttribute,
            dracoType,
            byteLength,
            ptr + cummulative
          );
          cummulative += byteLength;
        });

        const dracoDataView = new Uint8Array(module.HEAP8.buffer, ptr, cummulativeLength);

        const interleavedBuffer = new Uint8Array(new ArrayBuffer(cummulativeLength));

        {
          let offset = 0;
          attributesBufferLength.forEach((p, n) => {
            console.log(p.attributeName);
            const { attributeName, componentType } = p;
            const dracoAttribute = decoder.GetAttributeByUniqueId(
              dracoMesh,
              dracoCompression.attributes[attributeName]
            );
            const attrSize =
              dracoAttribute.num_components() *
              GltfSectorParser.DATA_TYPE_BYTE_SIZES.get(componentType)!.BYTES_PER_ELEMENT;
            for (let i = 0; i < dracoMesh.num_points(); i++) {
              const attr = dracoDataView.subarray(
                i * attrSize + n * dracoMesh.num_points() * offset,
                i * attrSize + n * dracoMesh.num_points() * offset + attrSize
              );
              interleavedBuffer.set(attr, i * stride + offset);
            }
            offset += attrSize;
            console.log(offset);
          });
        }

        const threeInterleaved = new THREE.InterleavedBuffer(interleavedBuffer, stride);

        // console.log(stride);
        console.log(dracoDataView);
        console.log(interleavedBuffer);
        console.log(dracoMesh.num_points());
        module._free(ptr);

        Object.keys(primitive.attributes).forEach(p => {
          const dracoAttribute = decoder.GetAttributeByUniqueId(dracoMesh, dracoCompression.attributes[p]);
          const componentType = json.accessors[primitive.attributes[p]].componentType;
          const dracoType = draco_data_type.get(componentType)!;
          const jsType = GltfSectorParser.DATA_TYPE_BYTE_SIZES.get(componentType)!;
          const decodedAttribute = decodeAttribute(decoder, dracoMesh, dracoAttribute, dracoType, jsType, module);
          if (p === 'POSITION') {
            bufferGeometry.setAttribute('position', new THREE.BufferAttribute(decodedAttribute, 3));
          }
          if (p === 'COLOR_0') {
            bufferGeometry.setAttribute('color', new THREE.BufferAttribute(decodedAttribute, 4));
          }
        });
      }
    } else {
      this.setIndexBuffer(payload, primitive, data, bufferGeometry);

      this.setInterleavedBufferAttributes<THREE.InterleavedBuffer>(
        payload.glbHeaderData,
        primitive.attributes,
        payload.data,
        attributeNameTransformer,
        payload.bufferGeometry,
        THREE.InterleavedBuffer
      );
    }

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

    function decodeAttribute(
      decoder: Decoder,
      mesh: Mesh,
      attribute: Attribute,
      dracoDataType: DataType,
      jsType: TypedArrayConstructor,
      decoderModule: DecoderModule
    ): TypedArray {
      const dataType = dracoDataType;
      const ArrayViewConstructor = jsType;
      const numComponents = attribute.num_components();
      const numPoints = mesh.num_points();
      const numValues = numPoints * numComponents;
      const byteLength: number = numValues * ArrayViewConstructor.BYTES_PER_ELEMENT;

      const ptr = decoderModule._malloc(byteLength);
      decoder.GetAttributeDataArrayForAllPoints(mesh, attribute, dataType, byteLength, ptr);
      const array: TypedArray = new ArrayViewConstructor(decoderModule.HEAP8.buffer, ptr, numValues).slice();
      decoderModule._free(ptr);
      return array;
    }

    function decodeIndex(decoder: Decoder, mesh: Mesh, decoderModule: DecoderModule): Uint16Array | Uint32Array {
      const numFaces = mesh.num_faces();
      const numIndices = numFaces * 3;

      let ptr: number;
      let indices: Uint16Array | Uint32Array;

      if (mesh.num_points() <= 2 ** 16) {
        const byteLength = numIndices * Uint16Array.BYTES_PER_ELEMENT;
        ptr = decoderModule._malloc(byteLength);
        decoder.GetTrianglesUInt16Array(mesh, byteLength, ptr);
        indices = new Uint16Array(decoderModule.HEAPU16.buffer, ptr, numIndices).slice();
      } else {
        const byteLength = numIndices * Uint32Array.BYTES_PER_ELEMENT;
        ptr = decoderModule._malloc(byteLength);
        decoder.GetTrianglesUInt32Array(mesh, byteLength, ptr);
        indices = new Uint32Array(decoderModule.HEAPU32.buffer, ptr, numIndices).slice();
      }

      decoderModule._free(ptr);

      return indices;
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
