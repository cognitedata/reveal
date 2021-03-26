/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { InstancedBufferGeometry, TypedArray } from 'three';
import { MaterialManager } from './MaterialManager';
import { InstancedMeshFile } from './rendering/types';

export class InstancedMeshManager {
  private readonly _instancedGeometryMap: Map<
    number,
    { vertices: THREE.Float32BufferAttribute; indices: THREE.Uint32BufferAttribute }
  >;

  private readonly _instancedAttributeMap: Map<
    string,
    {
      mesh: THREE.InstancedMesh;
      treeIndexBuffer: Float32Array;
      colorBuffer: Uint8Array;
      instanceMatrixBuffer: Float32Array;
    }
  >;

  private readonly processedSectorSet: Set<number>;

  private readonly _instancedMeshGroup: THREE.Group;
  private readonly _materialManager: MaterialManager;

  constructor(instancedMeshGroup: THREE.Group, materialManager: MaterialManager) {
    this._materialManager = materialManager;

    this._instancedGeometryMap = new Map();
    this._instancedAttributeMap = new Map();

    this.processedSectorSet = new Set();

    this._instancedMeshGroup = instancedMeshGroup;
  }

  private concatArray<T extends TypedArray>(first: T, second: T, T: new (length: number) => T): T {
    const newArray = new T(first.length + second.length);

    newArray.set(first);
    newArray.set(second, first.length);

    return newArray;
  }

  private setAttributes(
    vertices: THREE.Float32BufferAttribute,
    indices: THREE.Uint32BufferAttribute,
    treeIndexBuffer: Float32Array,
    colorBuffer: Uint8Array,
    instanceMatrixBuffer: Float32Array
  ): THREE.InstancedBufferGeometry {
    const instanceGeometry = new THREE.InstancedBufferGeometry();

    instanceGeometry.setIndex(indices);
    instanceGeometry.setAttribute('position', vertices);

    const treeIndexAttribute = new THREE.InstancedBufferAttribute(treeIndexBuffer, 1);
    instanceGeometry.setAttribute('a_treeIndex', treeIndexAttribute);

    const colorAttribute = new THREE.InstancedBufferAttribute(colorBuffer, 4, true);
    instanceGeometry.setAttribute('a_color', colorAttribute);

    const instanceMatrixInterleavedBuffer = new THREE.InstancedInterleavedBuffer(instanceMatrixBuffer, 16);
    for (let column = 0; column < 4; column++) {
      const attribute = new THREE.InterleavedBufferAttribute(instanceMatrixInterleavedBuffer, 4, column * 4);
      instanceGeometry.setAttribute(`a_instanceMatrix_column_${column}`, attribute);
    }

    return instanceGeometry;
  }

  public addInstanceMeshes(meshFile: InstancedMeshFile, modelIdentifier: string, sectorId: number) {
    if (this.processedSectorSet.has(sectorId)) {
      return;
    }

    this.processedSectorSet.add(sectorId);

    if (!this._instancedGeometryMap.has(meshFile.fileId)) {
      this._instancedGeometryMap.set(meshFile.fileId, {
        vertices: new THREE.Float32BufferAttribute(meshFile.vertices.buffer, 3),
        indices: new THREE.Uint32BufferAttribute(meshFile.indices.buffer, 1)
      });
    }

    const geometryAttributes = this._instancedGeometryMap.get(meshFile.fileId)!;
    const material = this._materialManager.getModelMaterials(modelIdentifier).instancedMesh;

    for (const instance of meshFile.instances) {
      const instanceIdentifier = JSON.stringify([meshFile.fileId, instance.triangleOffset]);

      if (!this._instancedAttributeMap.has(instanceIdentifier)) {
        const instanceGeometry = this.setAttributes(
          geometryAttributes.vertices,
          geometryAttributes.indices,
          instance.treeIndices,
          instance.colors,
          instance.instanceMatrices
        );

        instanceGeometry.setDrawRange(instance.triangleOffset * 3, instance.triangleCount * 3);

        const instanceMesh = new THREE.InstancedMesh(instanceGeometry, material, instance.treeIndices.length);

        instanceMesh.frustumCulled = false;

        this._instancedAttributeMap.set(instanceIdentifier, {
          mesh: instanceMesh,
          treeIndexBuffer: instance.treeIndices,
          colorBuffer: instance.colors,
          instanceMatrixBuffer: instance.instanceMatrices
        });

        this._instancedMeshGroup.add(instanceMesh);
        instanceMesh.updateMatrixWorld(true);
      } else {
        const currentAttributes = this._instancedAttributeMap.get(instanceIdentifier)!;
        const updatedTreeIndicesBuffer = this.concatArray(
          currentAttributes.treeIndexBuffer,
          instance.treeIndices,
          Float32Array
        );
        const updatedColorsBuffer = this.concatArray(currentAttributes.colorBuffer, instance.colors, Uint8Array);
        const updatedInstanceMatrixBuffer = this.concatArray(
          currentAttributes.instanceMatrixBuffer,
          instance.instanceMatrices,
          Float32Array
        );
        const bufferGeometry = this.setAttributes(
          geometryAttributes.vertices,
          geometryAttributes.indices,
          updatedTreeIndicesBuffer,
          updatedColorsBuffer,
          updatedInstanceMatrixBuffer
        );

        bufferGeometry.setDrawRange(instance.triangleOffset * 3, instance.triangleCount * 3);

        currentAttributes.mesh.geometry.dispose();
        currentAttributes.mesh.geometry = bufferGeometry;
        currentAttributes.mesh.count = updatedTreeIndicesBuffer.length;
        this._instancedAttributeMap.set(instanceIdentifier, {
          mesh: currentAttributes.mesh,
          treeIndexBuffer: updatedTreeIndicesBuffer,
          colorBuffer: updatedColorsBuffer,
          instanceMatrixBuffer: updatedInstanceMatrixBuffer
        });
      }
    }
  }
}
