/**
 * Copyright 2021 Cognite AS
 */

import { RenderMode, type CadMaterial } from '@reveal/rendering';
import type { ParsedMeshGeometry } from '@reveal/cad-parsers';
import { RevealGeometryCollectionType } from '@reveal/sector-parser';
import { incrementOrInsertIndex } from '@reveal/utilities';
import type { TreeIndexToSectorsMap } from '../utilities/TreeIndexToSectorsMap';
import type { SectorRepository } from '@reveal/sector-loader';
import type { ModelIdentifier } from '@reveal/data-providers';

import type { BufferGeometry, RawShaderMaterial, BufferAttribute, Box3, Matrix4, Texture } from 'three';
import { Sphere, Mesh, Group, SRGBColorSpace } from 'three';
import { initializeDefinesAndUniforms } from '@reveal/rendering';

/**
 * Manages mesh data for CAD sectors.
 * This class prepares mesh data for object creation.
 */
export class CadMeshManager {
  private readonly _cadMaterial: CadMaterial;
  private readonly _treeIndexToSectorsMap: TreeIndexToSectorsMap;

  private readonly _sectorMeshGroups: Map<number, Group> = new Map();

  constructor(cadMaterial: CadMaterial, treeIndexToSectorsMap: TreeIndexToSectorsMap) {
    this._cadMaterial = cadMaterial;
    this._treeIndexToSectorsMap = treeIndexToSectorsMap;
  }

  /**
   * Creates meshes from parsed geometries for a given sector.
   * @param parsedMeshGeometries Array of parsed mesh geometries to create meshes from
   * @param sectorId The sector ID these meshes belong to
   * @returns Group containing the created meshes
   */
  public createMeshesFromParsedGeometries(parsedMeshGeometries: ParsedMeshGeometry[], sectorId: number): Group {
    const materials = this._cadMaterial.materials;
    const group = new Group();
    const allTreeIndices = new Set<number>();

    parsedMeshGeometries.forEach(geometryData => {
      const isTriangleMesh = geometryData.type === RevealGeometryCollectionType.TriangleMesh;
      const isTexturedTriangleMesh = geometryData.type === RevealGeometryCollectionType.TexturedTriangleMesh;

      if (isTriangleMesh || isTexturedTriangleMesh) {
        let material: RawShaderMaterial;

        if (isTexturedTriangleMesh && geometryData.texture) {
          material = this.addTexturedMeshMaterialForSector(this._cadMaterial, sectorId, geometryData.texture);
        } else if (isTexturedTriangleMesh && !geometryData.texture) {
          console.warn(
            `Missing texture for textured triangle mesh in sector ${sectorId} - mesh will be skipped. ` +
              'This will result in missing geometry in the 3D scene.'
          );
          return;
        } else {
          material = materials.triangleMesh;
        }

        this.createMeshFromGeometry(group, geometryData.geometryBuffer, material, geometryData.wholeSectorBoundingBox);

        // Collect tree indices for mapping
        const treeIndices = this.createTreeIndexSet(geometryData.geometryBuffer);
        for (const treeIndex of treeIndices.keys()) {
          allTreeIndices.add(treeIndex);
        }
      }
    });

    // Track this mesh group by sector ID for cleanup when sector is unloaded
    this._sectorMeshGroups.set(sectorId, group);

    this.updateTreeIndexToSectorsMap(allTreeIndices, sectorId);

    return group;
  }

  private addTexturedMeshMaterialForSector(
    cadMaterial: CadMaterial,
    sectorId: number,
    texture: Texture
  ): RawShaderMaterial {
    texture.colorSpace = SRGBColorSpace;
    texture.flipY = false;

    const newMaterial = cadMaterial.materials.triangleMesh.clone();
    newMaterial.uniforms.tDiffuse = { value: texture };
    newMaterial.defines.IS_TEXTURED = true;

    initializeDefinesAndUniforms(
      newMaterial,
      cadMaterial.nodeAppearanceTextureBuilder.overrideColorPerTreeIndexTexture,
      cadMaterial.nodeTransformTextureBuilder.overrideTransformIndexTexture,
      cadMaterial.nodeTransformTextureBuilder.transformLookupTexture,
      cadMaterial.matCapTexture,
      RenderMode.Color
    );

    newMaterial.needsUpdate = true;

    const materialName = `texturedMaterial_${sectorId}`;

    if (cadMaterial.materials.texturedMaterials[materialName] !== undefined) {
      cadMaterial.materials.texturedMaterials[materialName].dispose();
    }

    cadMaterial.materials.texturedMaterials[materialName] = newMaterial;

    return newMaterial;
  }

  /**
   * Removes mesh group for the given sector ID.
   * Note: This does not dispose the underlying geometries as they may be shared with other models.
   * @param sectorId The sector ID whose mesh group should be removed
   */
  private removeSectorMeshGroup(sectorId: number): void {
    const meshGroup = this._sectorMeshGroups.get(sectorId);
    if (meshGroup) {
      if (meshGroup.parent) {
        meshGroup.parent.remove(meshGroup);
      }

      meshGroup.clear();
      this._sectorMeshGroups.delete(sectorId);
    }
  }

  /**
   * Removes mesh group and dereferences the sector in the repository.
   * This should be called when a model stops using a sector to properly manage reference counting.
   * @param sectorId The sector ID whose mesh group should be removed
   * @param sectorRepository The sector repository to dereference from
   * @param modelIdentifier The model identifier for dereferencing
   */
  public removeSectorMeshGroupAndDereference(
    sectorId: number,
    sectorRepository: SectorRepository,
    modelIdentifier: ModelIdentifier
  ): void {
    this.removeSectorMeshGroup(sectorId);
    sectorRepository.dereferenceSector(modelIdentifier, sectorId);
  }

  /**
   * Gets all currently managed sector IDs.
   */
  public getManagedSectorIds(): number[] {
    return Array.from(this._sectorMeshGroups.keys());
  }

  /**
   * Checks if a sector is currently managed by this mesh manager.
   * @param sectorId The sector ID to check
   * @returns True if the sector is managed, false otherwise
   */
  public hasManagedSector(sectorId: number): boolean {
    return this._sectorMeshGroups.has(sectorId);
  }

  /**
   * Creates a mesh from geometry, material, and bounding box.
   */
  private createMeshFromGeometry(
    group: Group,
    geometry: BufferGeometry,
    material: RawShaderMaterial,
    geometryBoundingBox: Box3
  ): void {
    geometry.boundingSphere = geometryBoundingBox.getBoundingSphere(new Sphere());

    const mesh = new Mesh(geometry, material);
    group.add(mesh);
    mesh.frustumCulled = false; // Note: Frustum culling does not play well with node-transforms

    mesh.userData.treeIndices = this.createTreeIndexSet(geometry);

    if (material.uniforms.inverseModelMatrix === undefined) return;

    mesh.onBeforeRender = () => {
      const inverseModelMatrix: Matrix4 = material.uniforms.inverseModelMatrix.value;
      inverseModelMatrix.copy(mesh.matrixWorld).invert();
    };
  }

  /**
   * Updates tree index to sectors mapping from a set of tree indices.
   */
  private updateTreeIndexToSectorsMap(allTreeIndices: Set<number>, sectorId: number): void {
    if (this._treeIndexToSectorsMap.isCompleted(sectorId, RevealGeometryCollectionType.TriangleMesh)) {
      return;
    }

    if (allTreeIndices.size > 0) {
      for (const treeIndex of allTreeIndices) {
        this._treeIndexToSectorsMap.set(treeIndex, sectorId);
      }

      this._treeIndexToSectorsMap.markCompleted(sectorId, RevealGeometryCollectionType.TriangleMesh);
    }
  }

  private createTreeIndexSet(geometry: BufferGeometry): Map<number, number> {
    const treeIndexAttribute = geometry.attributes['treeIndex'];
    if (!treeIndexAttribute) {
      return new Map();
    }

    const treeIndexSet = new Map<number, number>();

    for (let i = 0; i < treeIndexAttribute.count; i++) {
      incrementOrInsertIndex(treeIndexSet, (treeIndexAttribute as BufferAttribute).getX(i));
    }

    return treeIndexSet;
  }
}
