/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';

import { ConsumedSector, V9SectorMetadata, WantedSector } from '@reveal/cad-parsers';
import { BinaryFileProvider } from '@reveal/modeldata-api';
import { CadMaterialManager } from '@reveal/rendering';
import { GltfSectorParser, ParsedGeometry, RevealGeometryCollectionType } from '@reveal/sector-parser';
import { MetricsLogger } from '@reveal/metrics';
import { AutoDisposeGroup, assertNever, incrementOrInsertIndex } from '@reveal/utilities';

import { filterGeometryOutsideClipBox } from '../../cad-parsers/src/cad/filterPrimitivesV9';

import assert from 'assert';

export class GltfSectorLoader {
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
    try {
      const sectorByteBuffer = await this._sectorFileProvider.getBinaryFile(
        sector.modelBaseUrl,
        metadata.sectorFileName!
      );

      const group = new AutoDisposeGroup();

      const parsedSectorGeometry = this._gltfSectorParser.parseSector(sectorByteBuffer);

      const materials = this._materialManager.getModelMaterials(sector.modelIdentifier);

      const geometryBatchingQueue: ParsedGeometry[] = [];

      parsedSectorGeometry.forEach(parsedGeometry => {
        const type = parsedGeometry.type as RevealGeometryCollectionType;

        const filteredGeometryBuffer = filterGeometryOutsideClipBox(
          parsedGeometry.geometryBuffer,
          type,
          sector.geometryClipBox ?? undefined
        );

        if (!filteredGeometryBuffer) return;

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
            geometryBatchingQueue.push({
              type,
              geometryBuffer: filteredGeometryBuffer,
              instanceId: RevealGeometryCollectionType[type].toString()
            });
            break;
          case RevealGeometryCollectionType.InstanceMesh:
            geometryBatchingQueue.push({
              type,
              geometryBuffer: filteredGeometryBuffer,
              instanceId: parsedGeometry.instanceId!
            });
            break;
          case RevealGeometryCollectionType.TriangleMesh:
            this.createMesh(group, parsedGeometry.geometryBuffer, materials.triangleMesh);
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
        geometryBatchingQueue: geometryBatchingQueue
      };
    } catch (error) {
      MetricsLogger.trackError(error as Error, { moduleName: 'GltfSectorLoader', methodName: 'loadSector' });
      throw error;
    }
  }

  private createTreeIndexSet(geometry: THREE.BufferGeometry): Map<number, number> {
    const treeIndexAttribute = geometry.attributes['treeIndex'];
    assert(treeIndexAttribute !== undefined);

    const treeIndexSet = new Map<number, number>();

    for (let i = 0; i < treeIndexAttribute.count; i++) {
      incrementOrInsertIndex(treeIndexSet, treeIndexAttribute.getX(i));
    }

    return treeIndexSet;
  }

  private createMesh(group: AutoDisposeGroup, geometry: THREE.BufferGeometry, material: THREE.ShaderMaterial) {
    const mesh = new THREE.Mesh(geometry, material);
    group.add(mesh);
    mesh.frustumCulled = false;

    mesh.userData.treeIndices = this.createTreeIndexSet(geometry);

    if (material.uniforms.inverseModelMatrix === undefined) return;

    mesh.onBeforeRender = () => {
      const inverseModelMatrix: THREE.Matrix4 = material.uniforms.inverseModelMatrix.value;
      inverseModelMatrix.copy(mesh.matrixWorld).invert();
    };
  }
}
