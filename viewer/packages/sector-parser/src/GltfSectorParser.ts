/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import { MeshGPUInstancing, InstancedMesh } from '@gltf-transform/extensions';
import { Node, NodeIO, Document, Primitive } from '@gltf-transform/extensions/node_modules/@gltf-transform/core';
import {
  setBoxGeometry,
  setConeGeometry,
  setNutGeometry,
  setQuadGeometry,
  setTorusGeometry,
  setTrapeziumGeometry
} from './primitiveGeometries';

export enum RevealGeometryCollectionType {
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
  TriangleMesh,
  InstanceMesh
}

export default class GltfSectorParser {
  private readonly _io: NodeIO;
  constructor() {
    this._io = new NodeIO();
    this._io.registerExtensions([MeshGPUInstancing]);
  }

  public parseSector(data: ArrayBuffer) {
    const document: Document = this._io.readBinary(data);

    const defaultScene = document.getRoot().getDefaultScene();
    const buffs: [RevealGeometryCollectionType, THREE.BufferGeometry][] = [];
    defaultScene!.traverse((node: Node) => {
      const res = this.processNode(node);
      if (res) buffs.push(res);
    });

    return buffs;
  }

  private processNode(node: Node): [RevealGeometryCollectionType, THREE.BufferGeometry] | null {
    const instanced = node.getExtension<InstancedMesh>(MeshGPUInstancing.EXTENSION_NAME)!;
    const mesh = node.getMesh()!;

    if (!instanced && !mesh) return null;

    const bufferGeometry = instanced ? new THREE.InstancedBufferGeometry() : new THREE.BufferGeometry();

    const geometryType = RevealGeometryCollectionType[node.getName() as keyof typeof RevealGeometryCollectionType];

    if (mesh) {
      const primitive = mesh.listPrimitives()[0];
      this.setMeshAttributes(primitive, bufferGeometry);

      if (!instanced) {
        this.setUniqueMeshAttributes(primitive, bufferGeometry);
        return [geometryType, bufferGeometry];
      }
    } else {
      this.setPrimitiveTopology(geometryType, bufferGeometry);
    }

    this.setInstancedAttributes(instanced, bufferGeometry);

    return [geometryType, bufferGeometry];
  }

  private setInstancedAttributes(
    instanced: InstancedMesh,
    bufferGeometry: THREE.BufferGeometry | THREE.InstancedBufferGeometry
  ) {
    instanced.listSemantics().forEach(attributeName => {
      const accessor = instanced!.getAttribute(attributeName)!;
      const instancedBufferAttribute = new THREE.InstancedBufferAttribute(
        accessor.getArray()!,
        accessor.getElementSize()
      );

      bufferGeometry.setAttribute(`a${attributeName}`, instancedBufferAttribute);
    });
  }

  private setUniqueMeshAttributes(
    primitive: Primitive,
    bufferGeometry: THREE.BufferGeometry | THREE.InstancedBufferGeometry
  ) {
    const treeIndexAttribute = primitive.getAttribute('_treeIndex')!;
    const colorAttribute = primitive.getAttribute('COLOR_0')!;

    bufferGeometry.setAttribute(
      'color',
      new THREE.BufferAttribute(colorAttribute.getArray()!, colorAttribute.getElementSize())
    );

    bufferGeometry.setAttribute(
      'a_treeIndex',
      new THREE.BufferAttribute(treeIndexAttribute.getArray()!, treeIndexAttribute.getElementSize())
    );
  }

  private setMeshAttributes(
    primitive: Primitive,
    bufferGeometry: THREE.BufferGeometry | THREE.InstancedBufferGeometry
  ) {
    const indicesAccessor = primitive.getIndices()!;
    const positionAttribute = primitive.getAttribute('POSITION')!;

    bufferGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positionAttribute.getArray()!, positionAttribute.getElementSize())
    );
    bufferGeometry.setIndex(new THREE.BufferAttribute(indicesAccessor.getArray()!, indicesAccessor.getElementSize()));
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
      default:
        throw new Error(`${RevealGeometryCollectionType[primitiveCollectionName]} is not supported`);
    }
  }
}
