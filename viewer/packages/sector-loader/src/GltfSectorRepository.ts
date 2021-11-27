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

    if (metadata.sectorFileName === undefined || metadata.downloadSize === 0) {
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

    const primitives: [type: RevealGeometryCollectionType, geometryBuffer: THREE.BufferGeometry, instanceId: string][] =
      [];

    parsedSectorGeometry.forEach(parsedGeometry => {
      const type = parsedGeometry.type as RevealGeometryCollectionType;

      switch (type) {
        case RevealGeometryCollectionType.BoxCollection:
        case RevealGeometryCollectionType.CircleCollection:
        case RevealGeometryCollectionType.ConeCollection:
        case RevealGeometryCollectionType.EccentricConeCollection:
        case RevealGeometryCollectionType.EllipsoidSegmentCollection:
        case RevealGeometryCollectionType.GeneralCylinderCollection:
        case RevealGeometryCollectionType.GeneralRingCollection:
        case RevealGeometryCollectionType.QuadCollection:
        case RevealGeometryCollectionType.TorusSegmentCollection:
        case RevealGeometryCollectionType.TrapeziumCollection:
        case RevealGeometryCollectionType.NutCollection:
          primitives.push([type, parsedGeometry.buffer, type.toString()]);
          break;
        case RevealGeometryCollectionType.InstanceMesh:
          primitives.push([type, parsedGeometry.buffer, parsedGeometry.instanceId!.toString()]);
          break;
        case RevealGeometryCollectionType.TriangleMesh:
          this.createMesh(group, parsedGeometry.buffer, materials.triangleMesh);
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
      modelIdentifier: sector.modelIdentifier,
      primitives: primitives
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

  // private getShaderMaterial(type: RevealGeometryCollectionType, materials: Materials) {
  //   switch (type) {
  //     case RevealGeometryCollectionType.BoxCollection:
  //       return materials.box;
  //     case RevealGeometryCollectionType.CircleCollection:
  //       return materials.circle;
  //     case RevealGeometryCollectionType.ConeCollection:
  //       return materials.cone;
  //     case RevealGeometryCollectionType.EccentricConeCollection:
  //       return materials.eccentricCone;
  //     case RevealGeometryCollectionType.EllipsoidSegmentCollection:
  //       return materials.ellipsoidSegment;
  //     case RevealGeometryCollectionType.GeneralCylinderCollection:
  //       return materials.generalCylinder;
  //     case RevealGeometryCollectionType.GeneralRingCollection:
  //       return materials.generalRing;
  //     case RevealGeometryCollectionType.QuadCollection:
  //       return materials.quad;
  //     case RevealGeometryCollectionType.TorusSegmentCollection:
  //       return materials.torusSegment;
  //     case RevealGeometryCollectionType.TrapeziumCollection:
  //       return materials.trapezium;
  //     case RevealGeometryCollectionType.NutCollection:
  //       return materials.nut;
  //     case RevealGeometryCollectionType.TriangleMesh:
  //       return materials.triangleMesh;
  //     case RevealGeometryCollectionType.InstanceMesh:
  //       return materials.instancedMesh;
  //     default:
  //       assertNever(type);
  //   }
  // }

  clear(): void {}
}
