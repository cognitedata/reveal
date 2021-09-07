/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { BufferGeometry } from 'three';
import { GLTFLoaderPlugin, GLTFParser } from 'three/examples/jsm/loaders/GLTFLoader';
import {
  setBoxGeometry,
  setConeGeometry,
  setNutGeometry,
  setQuadGeometry,
  setTorusGeometry,
  setTrapeziumGeometry
} from './primitiveGeometries';

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
  NutCollection,
  TriangleMesh
}

export class GltfInstancingPlugin implements GLTFLoaderPlugin {
  private readonly _resultBuffer: [PrimitiveCollection, BufferGeometry][];
  private readonly _extensionName = 'EXT_mesh_gpu_instancing';
  private _parser!: GLTFParser;
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

  // https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#accessorcomponenttype-white_check_mark
  private readonly DATA_TYPE_BYTE_SIZES = new Map<number, TypedArrayConstructor>([
    [5120, Int8Array],
    [5121, Uint8Array],
    [5122, Int16Array],
    [5123, Uint16Array],
    [5125, Uint32Array],
    [5126, Float32Array]
  ]);

  public set parser(parser: GLTFParser) {
    this._parser = parser;
  }

  public get result() {
    return this._resultBuffer;
  }

  constructor() {
    this._resultBuffer = [];
  }

  public async createNodeMesh(nodeIndex: number): Promise<THREE.Object3D | null> {
    const json = this._parser.json;
    const nodeDefinition = json.nodes[nodeIndex];

    if (!this.isInstanceMeshNode(nodeDefinition)) {
      const meshDef = json.meshes[nodeDefinition.mesh];
      const triangleMeshGeometry = new THREE.BufferGeometry();

      const indicesAttribute = await this._parser.loadAccessor(meshDef.primitives[0].indices);
      triangleMeshGeometry.setIndex(indicesAttribute as THREE.BufferAttribute);

      const vertexAttribute = await this._parser.loadAccessor(meshDef.primitives[0].attributes.POSITION);
      triangleMeshGeometry.setAttribute('position', vertexAttribute);

      const colorAttribute = await this._parser.loadAccessor(meshDef.primitives[0].attributes.COLOR_0);
      triangleMeshGeometry.setAttribute('color', colorAttribute);

      this._resultBuffer.push([PrimitiveCollection.TriangleMesh, triangleMeshGeometry]);

      return new THREE.Mesh(triangleMeshGeometry, new THREE.MeshBasicMaterial());
    }

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
