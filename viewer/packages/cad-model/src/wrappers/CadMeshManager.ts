/**
 * Copyright 2021 Cognite AS
 */

import { CadMaterialManager } from '@reveal/rendering';
import { ParsedMeshGeometry } from '@reveal/cad-parsers';
import { RevealGeometryCollectionType } from '@reveal/sector-parser';
import { AutoDisposeGroup, incrementOrInsertIndex } from '@reveal/utilities';
import { TreeIndexToSectorsMap } from '../utilities/TreeIndexToSectorsMap';
import { SectorRepository } from '@reveal/sector-loader';
import { ModelIdentifier } from '@reveal/data-providers';

import { BufferGeometry, Mesh, RawShaderMaterial, Sphere, BufferAttribute, Box3, Matrix4 } from 'three';

/**
 * Manages mesh groups for CAD sectors, including creation and disposal.
 * This class handles mesh creation from parsed geometries and proper cleanup of resources.
 */
export class CadMeshManager {
  private readonly _materialManager: CadMaterialManager;
  private readonly _modelIdentifier: symbol;
  private readonly _treeIndexToSectorsMap: TreeIndexToSectorsMap;

  private readonly _sectorMeshGroups: Map<number, AutoDisposeGroup> = new Map();

  constructor(
    materialManager: CadMaterialManager,
    modelIdentifier: symbol,
    treeIndexToSectorsMap: TreeIndexToSectorsMap
  ) {
    this._materialManager = materialManager;
    this._modelIdentifier = modelIdentifier;
    this._treeIndexToSectorsMap = treeIndexToSectorsMap;
  }

  /**
   * Creates meshes from parsed geometries for a given sector.
   * @param parsedMeshGeometries Array of parsed mesh geometries to create meshes from
   * @param sectorId The sector ID these meshes belong to
   * @returns AutoDisposeGroup containing the created meshes
   */
  public createMeshesFromParsedGeometries(
    parsedMeshGeometries: ParsedMeshGeometry[],
    sectorId: number
  ): AutoDisposeGroup {
    const group = new AutoDisposeGroup();
    const materials = this._materialManager.getModelMaterials(this._modelIdentifier);

    parsedMeshGeometries.forEach(geometryData => {
      if (geometryData.type === RevealGeometryCollectionType.TriangleMesh) {
        this.createMeshFromGeometry(
          group,
          geometryData.geometryBuffer,
          materials.triangleMesh,
          geometryData.wholeSectorBoundingBox
        );
      } else if (geometryData.type === RevealGeometryCollectionType.TexturedTriangleMesh) {
        if (geometryData.texture) {
          const texturedMaterial = this._materialManager.addTexturedMeshMaterial(
            this._modelIdentifier,
            sectorId,
            geometryData.texture
          );

          this.createMeshFromGeometry(
            group,
            geometryData.geometryBuffer,
            texturedMaterial,
            geometryData.wholeSectorBoundingBox
          );

          // Add texture to group for proper disposal
          group.addTexture(geometryData.texture);
        } else {
          console.warn(
            `Missing texture for textured triangle mesh in sector ${sectorId} - mesh will be skipped. ` +
              'This will result in missing geometry in the 3D scene.'
          );
        }
      }
    });

    // Reference the group since we're now tracking it
    group.reference();

    // Track this mesh group by sector ID for cleanup when sector is unloaded
    this._sectorMeshGroups.set(sectorId, group);

    // Update tree index to sector mapping for triangle mesh geometry
    this.updateTreeIndexToSectorsMap(group, sectorId);

    return group;
  }

  /**
   * Removes a mesh group for the given sector ID from the scene.
   * Note: This does not dispose the underlying geometries as they may be shared with other models.
   * @param sectorId The sector ID whose mesh group should be removed
   */
  public removeSectorMeshGroup(sectorId: number): void {
    const meshGroup = this._sectorMeshGroups.get(sectorId);
    if (meshGroup) {
      // Remove from parent if it's still attached
      if (meshGroup.parent) {
        meshGroup.parent.remove(meshGroup);
      }

      // Clear the mesh group's children to remove references, but don't dispose geometries
      // as they are managed by the cache and may be shared between models
      meshGroup.clear();

      // Remove from our tracking map
      this._sectorMeshGroups.delete(sectorId);
    }
  }

  /**
   * Removes a mesh group and dereferences the sector in the repository.
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
    // Remove the mesh group
    this.removeSectorMeshGroup(sectorId);

    // Dereference the sector in the repository
    sectorRepository.dereferenceSector(modelIdentifier, sectorId);
  }

  /**
   * Gets all currently managed sector IDs.
   */
  public getManagedSectorIds(): number[] {
    return Array.from(this._sectorMeshGroups.keys());
  }

  private createMeshFromGeometry(
    group: AutoDisposeGroup,
    geometry: BufferGeometry,
    material: RawShaderMaterial,
    geometryBoundingBox: Box3
  ): void {
    // Assigns an approximate bounding-sphere to the geometry to avoid recalculating this on first render
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

  private updateTreeIndexToSectorsMap(group: AutoDisposeGroup, sectorId: number): void {
    if (group.children.length !== 1) {
      return;
    }

    const treeIndices = group.children[0].userData?.treeIndices as Map<number, number> | undefined;
    if (!treeIndices || treeIndices.size === 0) {
      return;
    }

    // Skip if this sector is already completed for triangle mesh geometry
    if (this._treeIndexToSectorsMap.isCompleted(sectorId, RevealGeometryCollectionType.TriangleMesh)) {
      return;
    }

    // Update mapping from tree indices to sector ids
    for (const treeIndex of treeIndices.keys()) {
      this._treeIndexToSectorsMap.set(treeIndex, sectorId);
    }
    this._treeIndexToSectorsMap.markCompleted(sectorId, RevealGeometryCollectionType.TriangleMesh);
  }
}
