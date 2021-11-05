/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import { MeshGPUInstancing, InstancedMesh } from '@gltf-transform/extensions';
import { Node, NodeIO, Document, Primitive, Mesh } from '@gltf-transform/core';
import {
  setBoxGeometry,
  setConeGeometry,
  setNutGeometry,
  setQuadGeometry,
  setTorusGeometry,
  setTrapeziumGeometry
} from './primitiveGeometries';

//TODO: Move this utility our of core
import { assertNever } from '../../../core/src/utilities';
import assert from 'assert';

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

export type TypedGeometry = {
  type: RevealGeometryCollectionType;
  buffer: THREE.BufferGeometry;
  instanceId?: number;
};

export default class GltfSectorParser {
  private readonly _gltfReader: NodeIO;
  constructor() {
    this._gltfReader = new NodeIO();
    this._gltfReader.registerExtensions([MeshGPUInstancing]);
  }

  public parseSector(data: ArrayBuffer): TypedGeometry[] {
    const document: Document = this._gltfReader.readBinary(data);

    const defaultScene = document.getRoot().getDefaultScene();
    const typedGeometryBuffers: TypedGeometry[] = [];

    defaultScene!.traverse((node: Node) => {
      const processedNode = this.processNode(node);

      if (processedNode) typedGeometryBuffers.push(processedNode);
    });

    return typedGeometryBuffers;
  }

  private processNode(node: Node): TypedGeometry | null {
    const instanced = node.getExtension<InstancedMesh>(MeshGPUInstancing.EXTENSION_NAME);
    const mesh = node.getMesh();
    let instanceId: number | undefined;

    if (this.isEmptyNode(instanced, mesh)) return null;

    const bufferGeometry = instanced ? new THREE.InstancedBufferGeometry() : new THREE.BufferGeometry();

    // Casts the string (node.getName()) to a RevealGeometryCollectionType enum (e.g. BoxCollection)
    const geometryType = RevealGeometryCollectionType[node.getName() as keyof typeof RevealGeometryCollectionType];

    switch (geometryType) {
      case RevealGeometryCollectionType.InstanceMesh:
        instanceId = this.processInstancedMesh(mesh, instanced, bufferGeometry);
        break;
      case RevealGeometryCollectionType.TriangleMesh:
        this.processTriangleMesh(mesh, bufferGeometry);
        break;
      default:
        this.processPrimitiveCollection(geometryType, bufferGeometry, instanced);
        break;
    }

    return { type: geometryType, buffer: bufferGeometry, instanceId: instanceId } as TypedGeometry;
  }

  private processPrimitiveCollection(
    geometryType: RevealGeometryCollectionType,
    bufferGeometry: THREE.BufferGeometry | THREE.InstancedBufferGeometry,
    instanced: InstancedMesh | null
  ) {
    assert(instanced !== null, 'Primitive does not contain the instanced gltf extension');

    this.setPrimitiveTopology(geometryType, bufferGeometry);
    this.setInstancedAttributes(instanced, bufferGeometry);
  }

  private processTriangleMesh(mesh: Mesh | null, bufferGeometry: THREE.BufferGeometry | THREE.InstancedBufferGeometry) {
    assert(mesh !== null, 'Triangle mesh node does not contain a mesh');

    const primitive = mesh.listPrimitives()[0];
    this.setMeshAttributes(primitive, bufferGeometry);

    this.setUniqueMeshAttributes(primitive, bufferGeometry);
  }

  private processInstancedMesh(
    mesh: Mesh | null,
    instanced: InstancedMesh | null,
    bufferGeometry: THREE.InstancedBufferGeometry | THREE.BufferGeometry
  ) {
    assert(mesh !== null, 'Instanced mesh node does not contain a mesh');
    assert(instanced !== null, 'Instanced mesh does not contain the instanced gltf extension');

    const primitive = mesh.listPrimitives()[0];
    this.setMeshAttributes(primitive, bufferGeometry);

    const instanceId = mesh.getExtras()['InstanceId'] as number;

    assert(instanceId !== undefined, 'Instanced mesh does not have an instance ID');

    this.setInstancedAttributes(instanced, bufferGeometry);

    return instanceId;
  }

  private isEmptyNode(instanced: InstancedMesh | null, mesh: Mesh | null) {
    return !instanced && !mesh;
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
      case RevealGeometryCollectionType.InstanceMesh:
        break;
      case RevealGeometryCollectionType.TriangleMesh:
        break;
      default:
        assertNever(primitiveCollectionName);
    }
  }
}
