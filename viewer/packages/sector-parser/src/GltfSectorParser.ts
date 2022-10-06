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
  GltfJson,
  ParsedGeometry
} from './types';
import { GlbMetadataParser } from './reveal-glb-parser/GlbMetadataParser';
import { COLLECTION_TYPE_SIZES, DATA_TYPE_BYTE_SIZES } from './constants';
import { DracoDecoderHelper } from './DracoDecoderHelper';

export class GltfSectorParser {
  private readonly _glbMetadataParser: GlbMetadataParser;
  private readonly _dracoDecoderHelper: DracoDecoderHelper;

  constructor() {
    this._glbMetadataParser = new GlbMetadataParser();
    this._dracoDecoderHelper = new DracoDecoderHelper();
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
  ): Promise<ParsedGeometry | undefined> {
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

  private async processInstancedTriangleMesh(payload: GeometryProcessingPayload): Promise<ParsedGeometry> {
    const { bufferGeometry, glbHeaderData, meshId, data } = payload;

    const json = glbHeaderData.json;

    assert(meshId !== undefined);

    const mesh = json.meshes[meshId];

    assert(mesh.primitives.length === 1);
    assert(mesh.extras?.InstanceId !== undefined);

    const primitive = mesh.primitives[0];

    const { vertexBuffer, byteOffset, byteLength } = await this.getVertexBuffer(
      json,
      glbHeaderData,
      data,
      primitive,
      bufferGeometry
    );

    this.setPositionBuffer(vertexBuffer, byteOffset, byteLength, bufferGeometry);

    const primitivesAttributeNameTransformer = (attributeName: string) => `a${attributeName}`;

    const sharedBufferView = this.getSharedBufferView(
      payload.glbHeaderData.json,
      payload.instancingExtension!.attributes!
    );
    const instanceBufferByteOffset = payload.glbHeaderData.byteOffsetToBinContent + (sharedBufferView.byteOffset ?? 0);
    const { byteLength: instanceBufferByteLength, byteStride: instanceBufferByteStride } = sharedBufferView;

    this.setInterleavedBufferAttributes<THREE.InstancedInterleavedBuffer>(
      payload.glbHeaderData.json,
      payload.instancingExtension!.attributes,
      payload.data,
      instanceBufferByteOffset,
      instanceBufferByteLength,
      instanceBufferByteStride,
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

    const sharedBufferView = this.getSharedBufferView(
      payload.glbHeaderData.json,
      payload.instancingExtension!.attributes!
    );
    const byteOffset = payload.glbHeaderData.byteOffsetToBinContent + (sharedBufferView.byteOffset ?? 0);
    const { byteLength, byteStride } = sharedBufferView;

    this.setInterleavedBufferAttributes<THREE.InstancedInterleavedBuffer>(
      payload.glbHeaderData.json,
      payload.instancingExtension!.attributes!,
      payload.data,
      byteOffset,
      byteLength,
      byteStride,
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

    const { vertexBuffer, byteOffset, byteLength, byteStride } = await this.getVertexBuffer(
      json,
      glbHeaderData,
      data,
      primitive,
      bufferGeometry
    );

    this.setInterleavedBufferAttributes<THREE.InterleavedBuffer>(
      json,
      primitive.attributes,
      vertexBuffer,
      byteOffset,
      byteLength,
      byteStride,
      attributeNameTransformer,
      bufferGeometry,
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

  private async getVertexBuffer(
    json: GltfJson,
    glbHeaderData: GlbHeaderData,
    data: ArrayBuffer,
    primitive: Primitive,
    bufferGeometry: THREE.InstancedBufferGeometry | THREE.BufferGeometry
  ) {
    let vertexBuffer: ArrayBuffer;
    let byteOffset: number;
    let byteLength: number;
    let byteStride: number;

    const offsetToBinChunk = glbHeaderData.byteOffsetToBinContent;
    const dracoCompression = primitive.extensions?.KHR_draco_mesh_compression;

    if (dracoCompression !== undefined) {
      const dracoBufferView = json.bufferViews[dracoCompression.bufferView];

      const dracoMeshOffset = offsetToBinChunk + (dracoBufferView.byteOffset ?? 0);

      const dracoMeshLength = dracoBufferView.byteLength;

      const dracoMeshBufferView = new Int8Array(data, dracoMeshOffset, dracoMeshLength);

      const dracoMesh = await this._dracoDecoderHelper.decodeDracoBufferToDracoMesh(dracoMeshBufferView);

      const { indexBufferView, vertexBufferView, vertexBufferDescriptor } =
        await this._dracoDecoderHelper.decodeDracoMeshToGeometryBuffers(
          json,
          dracoMesh,
          dracoCompression.attributes,
          primitive.attributes
        );

      bufferGeometry.setIndex(new THREE.BufferAttribute(indexBufferView, 1));

      vertexBuffer = vertexBufferView.buffer;
      byteOffset = vertexBufferView.byteOffset;
      byteLength = vertexBufferView.byteLength;

      byteStride = Object.values(vertexBufferDescriptor).reduce((sum, descriptor) => sum + descriptor.byteStride, 0);
    } else {
      this.setIndexBuffer(glbHeaderData, primitive, data, bufferGeometry);

      const sharedBufferView = this.getSharedBufferView(json, primitive.attributes);

      vertexBuffer = data;
      byteOffset = offsetToBinChunk + (sharedBufferView.byteOffset ?? 0);
      byteLength = sharedBufferView.byteLength;
      byteStride = sharedBufferView.byteStride;
    }
    return { vertexBuffer, byteOffset, byteLength, byteStride };
  }

  private setIndexBuffer(
    glbHeaderData: GlbHeaderData,
    primitive: Primitive,
    data: ArrayBuffer,
    bufferGeometry: THREE.InstancedBufferGeometry | THREE.BufferGeometry
  ) {
    const json = glbHeaderData.json;
    const offsetToBinChunk = glbHeaderData.byteOffsetToBinContent;

    const indicesAccessor = json.accessors[primitive.indices];
    const indicesBufferView = json.bufferViews[indicesAccessor.bufferView];
    indicesBufferView.byteOffset = indicesBufferView.byteOffset ?? 0;

    const IndicesTypedArrayConstructor = DATA_TYPE_BYTE_SIZES.get(indicesAccessor.componentType)!;

    const indicesTypedArray = new IndicesTypedArrayConstructor(
      data,
      offsetToBinChunk + indicesBufferView.byteOffset,
      indicesBufferView.byteLength / IndicesTypedArrayConstructor.BYTES_PER_ELEMENT
    );

    const elementSize = COLLECTION_TYPE_SIZES.get(indicesAccessor.type)!;

    bufferGeometry.setIndex(new THREE.BufferAttribute(indicesTypedArray, elementSize));
  }

  private setPositionBuffer(
    data: ArrayBuffer,
    byteOffset: number,
    byteLength: number,
    bufferGeometry: THREE.InstancedBufferGeometry | THREE.BufferGeometry
  ) {
    const positionBytesPerElement = Float32Array.BYTES_PER_ELEMENT;
    const elementSize = 3;

    const positionTypedArray = new Float32Array(data, byteOffset, byteLength / positionBytesPerElement);

    bufferGeometry.setAttribute('position', new THREE.BufferAttribute(positionTypedArray, elementSize));
  }

  private getSharedBufferView(
    json: GltfJson,
    attributes: {
      [key: string]: number;
    }
  ) {
    const bufferViewIds = Object.values(attributes).map(accessorId => json.accessors[accessorId].bufferView);

    assert(bufferViewIds.length > 0);

    const bufferViewId = bufferViewIds[0];

    for (let i = 1; i < bufferViewIds.length; i++) {
      assert(bufferViewIds[i] === bufferViewId, 'Unexpected number of unique buffer views');
    }

    return json.bufferViews[bufferViewId];
  }

  private setInterleavedBufferAttributes<T extends THREE.InterleavedBuffer>(
    json: GltfJson,
    attributes: {
      [key: string]: number;
    },
    dataBuffer: ArrayBuffer,
    byteOffset: number,
    byteLength: number,
    stride: number,
    transformAttributeName: (attributeName: string) => string,
    bufferGeometry: THREE.BufferGeometry | THREE.InstancedBufferGeometry,
    bufferType: { new (array: ArrayLike<number>, stride: number): T }
  ) {
    const componentTypes = Object.values(attributes).map(accessorId => json.accessors[accessorId].componentType);

    const typedArrayMap: { [key: string]: T } = this.getUniqueComponentViews<T>(
      componentTypes,
      dataBuffer,
      byteOffset,
      byteLength,
      stride,
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
      const size = COLLECTION_TYPE_SIZES.get(accessor.type);

      assert(size !== undefined);

      const elementType = DATA_TYPE_BYTE_SIZES.get(accessor.componentType);

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
    byteOffset: number,
    byteLength: number,
    byteStride: number,
    bufferType: new (array: ArrayLike<number>, stride: number) => T
  ) {
    const typedArrays = [...new Set(componentTypes)].map(componentType => {
      const TypedArray = DATA_TYPE_BYTE_SIZES.get(componentType)!;
      const typedBuffer = new TypedArray(data, byteOffset, byteLength / TypedArray.BYTES_PER_ELEMENT);
      const interleavedBuffer = new bufferType(typedBuffer, byteStride / TypedArray.BYTES_PER_ELEMENT);
      return { componentType: componentType, interleavedBuffer: interleavedBuffer };
    });

    const typedArrayMap: { [key: string]: T } = Object.assign(
      {},
      ...typedArrays.map(p => ({ [p.componentType]: p.interleavedBuffer }))
    );
    return typedArrayMap;
  }
}
