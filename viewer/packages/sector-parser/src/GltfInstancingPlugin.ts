/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { BufferGeometry, InstancedBufferGeometry } from 'three';
import { GLTFLoader, GLTFLoaderPlugin, GLTFParser } from 'three/examples/jsm/loaders/GLTFLoader';
import {
  setBoxGeometry,
  setConeGeometry,
  setNutGeometry,
  setQuadGeometry,
  setTorusGeometry,
  setTrapeziumGeometry
} from './primitiveGeometries';

export default class GltfSectorLoader {
  public async loadSector(url: string): Promise<[PrimitiveCollection, InstancedBufferGeometry][]> {
    const loader = new GLTFLoader();
    let resultCallback: () => [PrimitiveCollection, InstancedBufferGeometry][] = () => {
      throw new Error('Parsing of sector failed');
    };

    loader.register(parser => {
      const instancingPlugin = new GltfInstancingPlugin(parser);
      resultCallback = instancingPlugin.getParseResult.bind(instancingPlugin);
      return instancingPlugin;
    });

    await loader.loadAsync(url, _ => {});

    return resultCallback();
  }
}

type TypedArrayConstructor =
  | Int8ArrayConstructor
  | Uint8ArrayConstructor
  | Int16ArrayConstructor
  | Uint16ArrayConstructor
  | Uint32ArrayConstructor
  | Float32ArrayConstructor;

export enum PrimitiveCollection {
  BoxCollection,
  CircleCollection,
  ConeCollection,
  EccentricConeCollection,
  EllipsoidSegmentCollection,
  GeneralCylinderCollection,
  GeneralRingCollection,
  QuadCollection,
  TorusSegmentCollection,
  TrapeziumCollection,
  NutCollection
}

class GltfInstancingPlugin implements GLTFLoaderPlugin {
  private readonly _resultBuffer: [PrimitiveCollection, InstancedBufferGeometry][];
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

  private readonly DATA_TYPE_BYTE_SIZES = new Map<number, TypedArrayConstructor>([
    [5120, Int8Array],
    [5121, Uint8Array],
    [5122, Int16Array],
    [5123, Uint16Array],
    [5125, Uint32Array],
    [5126, Float32Array]
  ]);

  constructor(parser: GLTFParser) {
    this._parser = parser;
    this._resultBuffer = [];
  }

  public async createNodeMesh(nodeIndex: number): Promise<THREE.Object3D | null> {
    const json = this._parser.json;
    const nodeDefinition = json.nodes[nodeIndex];

    if (!this.isInstanceMeshNode(nodeDefinition)) return new THREE.Object3D();

    const instancedAttributeReferences = nodeDefinition.extensions[this._extensionName].attributes;

    const geometry = new THREE.InstancedBufferGeometry();
    const collectionType = PrimitiveCollection[nodeDefinition.name as keyof typeof PrimitiveCollection];

    for (const attributeName in instancedAttributeReferences) {
      if (Object.prototype.hasOwnProperty.call(instancedAttributeReferences, attributeName)) {
        const accessorId = instancedAttributeReferences[attributeName];
        geometry.setAttribute(`a${attributeName}`, await this.getAttributeFromAccessorId(accessorId));
      }
    }

    this.setTopology(collectionType, geometry);

    this._resultBuffer.push([collectionType, geometry]);

    return new THREE.Object3D();
  }

  public getParseResult() {
    return this._resultBuffer;
  }

  async getAttributeFromAccessorId(accessorId: number): Promise<THREE.InterleavedBufferAttribute> {
    const accessorDefinition = this._parser.json.accessors[accessorId];
    const bufferViewDefinition = this._parser.json.bufferViews[accessorDefinition.bufferView];
    const buffer = await this._parser.loadBufferView(accessorDefinition.bufferView);

    const TypedArray = this.DATA_TYPE_BYTE_SIZES.get(accessorDefinition.componentType)!;
    const typedBuffer = new TypedArray(buffer);
    const interleavedBuffer = new THREE.InstancedInterleavedBuffer(
      typedBuffer,
      bufferViewDefinition.byteStride / typedBuffer.BYTES_PER_ELEMENT
    );

    const numberOfComponents = this.COLLECTION_TYPE_SIZES.get(accessorDefinition.type)!;
    const byteOffset = accessorDefinition.byteOffset ?? 0;
    const offset: number = byteOffset / typedBuffer.BYTES_PER_ELEMENT;

    return new THREE.InterleavedBufferAttribute(interleavedBuffer, numberOfComponents, offset);
  }

  private setTopology(primitiveCollectionName: PrimitiveCollection, geometry: BufferGeometry) {
    switch (primitiveCollectionName) {
      case PrimitiveCollection.BoxCollection:
        setBoxGeometry(geometry);
        break;
      case PrimitiveCollection.CircleCollection:
        setQuadGeometry(geometry); // should use the position as normal
        break;
      case PrimitiveCollection.ConeCollection:
        setConeGeometry(geometry);
        break;
      case PrimitiveCollection.EccentricConeCollection:
        setConeGeometry(geometry);
        break;
      case PrimitiveCollection.EllipsoidSegmentCollection:
        setConeGeometry(geometry);
        break;
      case PrimitiveCollection.GeneralCylinderCollection:
        setConeGeometry(geometry);
        break;
      case PrimitiveCollection.GeneralRingCollection:
        setQuadGeometry(geometry, false);
        break;
      case PrimitiveCollection.NutCollection:
        setNutGeometry(geometry);
        break;
      case PrimitiveCollection.QuadCollection:
        setQuadGeometry(geometry);
        break;
      case PrimitiveCollection.TrapeziumCollection:
        setTrapeziumGeometry(geometry);
        break;
      case PrimitiveCollection.TorusSegmentCollection:
        setTorusGeometry(geometry);
        break;
      default:
        throw new Error(`${PrimitiveCollection[primitiveCollectionName]} is not supported`);
    }
  }

  private isInstanceMeshNode(nodeDefinition: any): boolean {
    return nodeDefinition.extensions && nodeDefinition.extensions[this._extensionName];
  }
}
