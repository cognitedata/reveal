/*!
 * Copyright 2022 Cognite AS
 */

import assert from 'assert';
import type { Attribute, DataType, Decoder, DecoderModule, Mesh } from 'draco3dgltf';
import { COLLECTION_TYPE_SIZES, DATA_TYPE_BYTE_SIZES } from './constants';
import DracoDecoderModule from './lib/draco_decoder_gltf';
import { Accessor, GltfJson } from './types';

type AttributeDescriptor = {
  attributeName: string;
  numberOfComponents: number;
  componentSize: number;
  gltfAccessor: Accessor;
  dracoAttribute: Attribute;
};

export type VertexBufferDescriptor = { [key: string]: { byteStride: number; byteOffset: number } };

export type MeshGeometryBufferDescriptor = {
  indexBufferView: Uint16Array | Uint32Array;
  vertexBufferView: Uint8Array;
  vertexBufferDescriptor: VertexBufferDescriptor;
};

export class DracoDecoderHelper {
  private readonly _dracoDecoderModule: Promise<{ module: DecoderModule; decoder: Decoder }>;
  private readonly _dracoDataTypes: Promise<Map<number, DataType>>;

  constructor() {
    this._dracoDecoderModule = DracoDecoderModule().then((module: DecoderModule) => {
      return { module, decoder: new module.Decoder() };
    });

    this._dracoDataTypes = this._dracoDecoderModule.then(
      (dracoModules: { module: DecoderModule; decoder: Decoder }) => {
        const { module } = dracoModules;
        return new Map<number, DataType>([
          [5120, module.DT_INT8],
          [5121, module.DT_UINT8],
          [5122, module.DT_INT16],
          [5123, module.DT_UINT16],
          [5125, module.DT_UINT32],
          [5126, module.DT_FLOAT32]
        ]);
      }
    );
  }

  public async decodeDracoBufferToDracoMesh(dracoMeshBufferView: Int8Array): Promise<Mesh> {
    const { module, decoder } = await this._dracoDecoderModule;

    const buffer = new module.DecoderBuffer();
    buffer.Init(dracoMeshBufferView, dracoMeshBufferView.length);

    const geometryType = decoder.GetEncodedGeometryType(buffer);

    assert(geometryType === module.TRIANGULAR_MESH);

    const dracoMesh = new module.Mesh();
    const status = decoder.DecodeBufferToMesh(buffer, dracoMesh);

    if (!status.ok() || dracoMesh.ptr === 0) {
      throw new Error(`Failed to decode draco mesh. Error: ${status.error_msg()}`);
    }

    return dracoMesh;
  }

  public async decodeDracoMeshToGeometryBuffers(
    json: GltfJson,
    dracoMesh: Mesh,
    dracoAttributes: { [key: string]: number },
    gltfAttributes: { [key: string]: number }
  ): Promise<MeshGeometryBufferDescriptor> {
    const { module, decoder } = await this._dracoDecoderModule;

    const decodedIndicesBufferView = this.decodeIndex(decoder, dracoMesh, module);

    const attributeDescriptors = this.getAttributeDescriptors(
      json,
      decoder,
      gltfAttributes,
      dracoAttributes,
      dracoMesh
    );

    const { decodedVertexBufferView, vertexBufferDescriptor } = await this.decodeVertexBuffer(
      module,
      decoder,
      dracoMesh,
      attributeDescriptors
    );

    return {
      vertexBufferDescriptor: vertexBufferDescriptor,
      vertexBufferView: decodedVertexBufferView,
      indexBufferView: decodedIndicesBufferView
    };
  }

  private async decodeVertexBuffer(
    module: DecoderModule,
    decoder: Decoder,
    dracoMesh: Mesh,
    attributeDescriptors: AttributeDescriptor[]
  ): Promise<{ decodedVertexBufferView: Uint8Array; vertexBufferDescriptor: VertexBufferDescriptor }> {
    const cummulativeBufferLength =
      attributeDescriptors
        .map(attributeDescriptor => attributeDescriptor.componentSize * attributeDescriptor.numberOfComponents)
        .reduce((sum, attributeSize) => sum + attributeSize) * dracoMesh.num_points();

    const decodedBufferPointer = module._malloc(cummulativeBufferLength);

    const dracoDataType = await this._dracoDataTypes;

    const numberOfVertices = dracoMesh.num_points();

    const vertexBufferDescriptor = this.computeVertexBufferDescriptor(
      attributeDescriptors,
      dracoDataType,
      numberOfVertices,
      decoder,
      dracoMesh,
      decodedBufferPointer
    );

    const dracoDataView = new Uint8Array(module.HEAP8.buffer, decodedBufferPointer, cummulativeBufferLength);

    const decodedVertexBuffer = new Uint8Array(new ArrayBuffer(cummulativeBufferLength));

    this.copyLinearToInterleaved(
      {
        buffer: dracoDataView,
        attributeByteLengths: Object.values(vertexBufferDescriptor).map(descriptor => descriptor.byteStride),
        numPoints: dracoMesh.num_points()
      },
      decodedVertexBuffer
    );

    module._free(decodedBufferPointer);

    return { decodedVertexBufferView: decodedVertexBuffer, vertexBufferDescriptor: vertexBufferDescriptor };
  }

  private computeVertexBufferDescriptor(
    attributeDescriptors: AttributeDescriptor[],
    dracoDataType: Map<number, DataType>,
    numberOfVertices: number,
    decoder: Decoder,
    dracoMesh: Mesh,
    decodedBufferPointer: number
  ) {
    let attributePointer = 0;
    let attributeOffset = 0;
    const vertexBufferDescriptor = attributeDescriptors.reduce<VertexBufferDescriptor>(
      (accumulator, attributeDescriptor) => {
        const { componentSize, numberOfComponents, dracoAttribute, gltfAccessor } = attributeDescriptor;
        const dracoType = dracoDataType.get(gltfAccessor.componentType)!;
        const byteLength = componentSize * numberOfComponents * numberOfVertices;
        decoder.GetAttributeDataArrayForAllPoints(
          dracoMesh,
          dracoAttribute,
          dracoType,
          byteLength,
          decodedBufferPointer + attributePointer
        );

        gltfAccessor.byteOffset = attributeOffset;

        const attributeStride = componentSize * numberOfComponents;

        attributePointer += byteLength;

        accumulator[attributeDescriptor.attributeName] = { byteStride: attributeStride, byteOffset: attributeOffset };

        attributeOffset += componentSize * numberOfComponents;
        return accumulator;
      },
      {}
    );
    return vertexBufferDescriptor;
  }

  private getAttributeDescriptors(
    json: GltfJson,
    decoder: Decoder,
    gltfAttributes: { [key: string]: number },
    dracoAttributes: { [key: string]: number },
    dracoMesh: Mesh
  ): AttributeDescriptor[] {
    return Object.keys(gltfAttributes).map(attributeName => {
      const gltfAccessor = json.accessors[gltfAttributes[attributeName]];

      const numberOfComponents = COLLECTION_TYPE_SIZES.get(gltfAccessor.type)!;
      const componentSize = DATA_TYPE_BYTE_SIZES.get(gltfAccessor.componentType)!.BYTES_PER_ELEMENT;

      const dracoAttribute = decoder.GetAttributeByUniqueId(dracoMesh, dracoAttributes[attributeName]);

      return {
        attributeName,
        numberOfComponents,
        componentSize,
        gltfAccessor,
        dracoAttribute
      };
    });
  }

  private decodeIndex(decoder: Decoder, mesh: Mesh, decoderModule: DecoderModule): Uint16Array | Uint32Array {
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

  private copyLinearToInterleaved(
    input: { buffer: Uint8Array; attributeByteLengths: number[]; numPoints: number },
    output: Uint8Array
  ) {
    assert(input.buffer.byteLength <= output.byteLength);

    const stride = input.attributeByteLengths.reduce((partialSum, element) => partialSum + element, 0);

    let cummulativeAttributeOffset = 0;
    input.attributeByteLengths.forEach(attributeByteLength => {
      for (let i = 0; i < input.numPoints; i++) {
        const sourceBufferOffset = cummulativeAttributeOffset * input.numPoints + i * attributeByteLength;
        const targetBufferOffset = i * stride + cummulativeAttributeOffset;
        output.set(
          input.buffer.subarray(sourceBufferOffset, sourceBufferOffset + attributeByteLength),
          targetBufferOffset
        );
      }

      cummulativeAttributeOffset += attributeByteLength;
    });
  }
}
