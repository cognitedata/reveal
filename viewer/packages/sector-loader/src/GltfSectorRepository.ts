/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

import { ConsumedSector, V9SectorMetadata, WantedSector, LevelOfDetail } from '@reveal/cad-parsers';
import { BinaryFileProvider } from '@reveal/modeldata-api';
import { CadMaterialManager } from '@reveal/rendering';
import { GltfSectorParser, RevealGeometryCollectionType } from '@reveal/sector-parser';
import { SectorRepository } from '..';
import { AutoDisposeGroup, assertNever } from '@reveal/utilities';

export class GltfSectorRepository implements SectorRepository {
  private readonly _gltfSectorParser: GltfSectorParser;
  private readonly _sectorFileProvider: BinaryFileProvider;
  private readonly _materialManager: CadMaterialManager;

  constructor(sectorFileProvider: BinaryFileProvider, materialManager: CadMaterialManager) {
    this._gltfSectorParser = new GltfSectorParser();
    this._sectorFileProvider = sectorFileProvider;
    this._materialManager = materialManager;
  }

  async loadSector(sector: WantedSector): Promise<ConsumedSector> {
    const metadata = sector.metadata as V9SectorMetadata;

    if (metadata.sectorFileName === undefined) {
      return Promise.resolve({
        modelIdentifier: sector.modelIdentifier,
        metadata: metadata,
        levelOfDetail: LevelOfDetail.Detailed,
        group: undefined,
        instancedMeshes: []
      });
    }

    if (sector.levelOfDetail === LevelOfDetail.Discarded) {
      return Promise.resolve({
        modelIdentifier: sector.modelIdentifier,
        metadata: metadata,
        levelOfDetail: LevelOfDetail.Discarded,
        instancedMeshes: [],
        group: undefined
      });
    }

    const sectorByteBuffer = await this._sectorFileProvider.getBinaryFile(
      sector.modelBaseUrl,
      metadata.sectorFileName!
    );

    const group = new AutoDisposeGroup();

    const parsedSectorGeometry = this._gltfSectorParser.parseSector(sectorByteBuffer);

    const materials = this._materialManager.getModelMaterials(sector.modelIdentifier);

    parsedSectorGeometry.forEach(parsedGeometry => {
      const type = parsedGeometry.type as RevealGeometryCollectionType;

      switch (type) {
        case RevealGeometryCollectionType.BoxCollection:
          this.createMesh(group, parsedGeometry.buffer, materials.box);
          break;
        case RevealGeometryCollectionType.CircleCollection:
          this.createMesh(group, parsedGeometry.buffer, materials.circle);
          break;
        case RevealGeometryCollectionType.ConeCollection:
          this.createMesh(group, parsedGeometry.buffer, materials.cone);
          break;
        case RevealGeometryCollectionType.EccentricConeCollection:
          this.createMesh(group, parsedGeometry.buffer, materials.eccentricCone);
          break;
        case RevealGeometryCollectionType.EllipsoidSegmentCollection:
          this.createMesh(group, parsedGeometry.buffer, materials.ellipsoidSegment);
          break;
        case RevealGeometryCollectionType.GeneralCylinderCollection:
          this.createMesh(group, parsedGeometry.buffer, materials.generalCylinder);
          break;
        case RevealGeometryCollectionType.GeneralRingCollection:
          this.createMesh(group, parsedGeometry.buffer, materials.generalRing);
          break;
        case RevealGeometryCollectionType.QuadCollection:
          this.createMesh(group, parsedGeometry.buffer, materials.quad);
          break;
        case RevealGeometryCollectionType.TorusSegmentCollection:
          this.createMesh(group, parsedGeometry.buffer, materials.torusSegment);
          break;
        case RevealGeometryCollectionType.TrapeziumCollection:
          this.createMesh(group, parsedGeometry.buffer, materials.trapezium);
          break;
        case RevealGeometryCollectionType.NutCollection:
          this.createMesh(group, parsedGeometry.buffer, materials.nut);
          break;
        case RevealGeometryCollectionType.TriangleMesh:
          this.createMesh(group, parsedGeometry.buffer, materials.triangleMesh);
          break;
        case RevealGeometryCollectionType.InstanceMesh:
          this.createMesh(group, parsedGeometry.buffer, materials.instancedMesh);
          break;
        default:
          assertNever(type);
      }
    });

    return {
      levelOfDetail: sector.levelOfDetail,
      group: group,
      instancedMeshes: [],
      metadata: metadata,
      modelIdentifier: sector.modelIdentifier
    };
  }

  private createMesh(group: AutoDisposeGroup, geometry: THREE.BufferGeometry, material: THREE.ShaderMaterial) {
    const mesh = new THREE.Mesh(geometry, material);
    group.add(mesh);
    mesh.frustumCulled = false;

    if (material.uniforms.inverseModelMatrix === undefined) return;

    mesh.onBeforeRender = () => {
      const inverseModelMatrix: THREE.Matrix4 = material.uniforms.inverseModelMatrix.value;
      inverseModelMatrix.copy(mesh.matrixWorld).invert();
    };
  }

  clear(): void {}
}
