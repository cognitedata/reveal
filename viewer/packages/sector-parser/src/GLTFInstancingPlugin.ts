/*!
 * Copyright 2021 Cognite AS
 */
import assert from 'assert';
import * as THREE from 'three';
import { GLTFLoaderPlugin, GLTFParser } from 'three/examples/jsm/loaders/GLTFLoader';
import { AccessorDefinition } from './types';

export default class GLTFInstancingPlugin implements GLTFLoaderPlugin {
  private readonly _extensionName = 'EXT_mesh_gpu_instancing';
  private readonly _parser: GLTFParser;
  loadMaterial: any;

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

  private readonly DATA_TYPE_BYTE_SIZES = new Map<number, number>([
    [5120, 1],
    [5121, 1],
    [5122, 2],
    [5123, 2],
    [5125, 4],
    [5126, 4]
  ]);

  constructor(parser: GLTFParser) {
    this._parser = parser;
  }

  public createNodeMesh(nodeIndex: number): Promise<THREE.Object3D> | null {
    const json = this._parser.json;
    const nodeDefinition = json.nodes[nodeIndex];

    if (!this.isInstanceMeshNode(nodeDefinition)) return null;

    const instanceAttributeReferences = nodeDefinition.extensions[this._extensionName].attributes as {
      [key: string]: number;
    };

    //TODO: check if Object.entries() allocates memory
    return (
      Promise.all(
        Object.entries(instanceAttributeReferences).map(async attributes => {
          const [attributeName, accessorId] = attributes;

          const accessorDefinition = json.accessors[accessorId] as AccessorDefinition;
          const bufferViewId = accessorDefinition.bufferView;
          const bufferViewDefinition = json.bufferViews[bufferViewId];

          const bufferView = await this._parser.loadBufferView(bufferViewId);

          return {
            attributeName,
            accessorDefinition,
            stride: bufferViewDefinition.byteStride as number,
            bufferView: new DataView(bufferView)
          };
        })
      )
        .then(attributeData => {
          const hasEqualAttributeCount = attributeData.every(
            q => q.accessorDefinition.count === attributeData[0].accessorDefinition.count
          );
          assert(hasEqualAttributeCount);
          return this.attributeGenerator(attributeData, attributeData[0].accessorDefinition.count);
        })
        // .then(p => {
        //   console.log(nodeDefinition.name);
        //   console.log([...p]);
        // })
        .then(_ => new THREE.Object3D())
    );
  }

  private *attributeGenerator(
    attributeData: {
      attributeName: string;
      accessorDefinition: AccessorDefinition;
      stride: number;
      bufferView: DataView;
    }[],
    attributeCount: number
  ): Generator<{ [key: string]: number[] }> {
    for (let i = 0; i < attributeCount; i++) {
      const primitive: { [key: string]: number[] } = {};
      for (let j = 0; j < attributeData.length; j++) {
        const attribute = attributeData[j];
        primitive[attribute.attributeName] = this.getTypeAt(
          attribute.bufferView,
          attribute.accessorDefinition.componentType,
          attribute.accessorDefinition.type,
          i * attribute.stride + (attribute.accessorDefinition.byteOffset ?? 0)
        );
      }
      yield primitive;
    }
  }

  private getTypeAt(view: DataView, dataType: number, collectionType: string, byteOffset: number): number[] {
    const collectionTypeSize = this.COLLECTION_TYPE_SIZES.get(collectionType)!;
    const dataTypeByteSize = this.DATA_TYPE_BYTE_SIZES.get(dataType)!;
    const arr = new Array<number>(collectionTypeSize).fill(0);

    return arr.map((_, n) => {
      return this.getComponentAt(view, dataType, byteOffset + n * dataTypeByteSize);
    });
  }

  private getComponentAt(view: DataView, componentType: number, byteOffset: number) {
    // https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#accessorcomponenttype-white_check_mark
    switch (componentType) {
      case 5120:
        return view.getInt8(byteOffset);
      case 5121:
        return view.getUint8(byteOffset);
      case 5122:
        return view.getInt16(byteOffset, true);
      case 5123:
        return view.getUint16(byteOffset, true);
      case 5125:
        return view.getUint32(byteOffset, true);
      case 5126:
        return view.getFloat32(byteOffset, true);
      default:
        throw new Error('Unknown component type: ' + componentType);
    }
  }

  private isInstanceMeshNode(nodeDefinition: any): boolean {
    return nodeDefinition.extensions && nodeDefinition.extensions[this._extensionName];
  }
}
