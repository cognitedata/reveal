/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';

import { ConsumedSector, WantedSector, filterGeometryOutsideClipBox } from '@reveal/cad-parsers';
import { BinaryFileProvider } from '@reveal/data-providers';
import { CadMaterialManager } from '@reveal/rendering';
import { GltfSectorParser, ParsedGeometry, RevealGeometryCollectionType } from '@reveal/sector-parser';
import { MetricsLogger } from '@reveal/metrics';
import { AutoDisposeGroup, assertNever, incrementOrInsertIndex } from '@reveal/utilities';

import assert from 'assert';
import { Log } from '@reveal/logger';

export class GltfSectorLoader {
  private readonly _gltfSectorParser: GltfSectorParser;
  private readonly _sectorFileProvider: BinaryFileProvider;
  private readonly _materialManager: CadMaterialManager;

  constructor(sectorFileProvider: BinaryFileProvider, materialManager: CadMaterialManager) {
    this._gltfSectorParser = new GltfSectorParser();
    this._sectorFileProvider = sectorFileProvider;
    this._materialManager = materialManager;
  }

  async loadSector(sector: WantedSector, abortSignal?: AbortSignal): Promise<ConsumedSector> {
    const { metadata } = sector;
    try {
      const sectorByteBuffer = await this._sectorFileProvider.getBinaryFile(
        sector.modelBaseUrl,
        metadata.sectorFileName!,
        abortSignal
      );

      const group = new AutoDisposeGroup();

      const wholeSectorBoundingBox = sector.metadata.geometryBoundingBox;

      const parsedSectorGeometry = await this._gltfSectorParser.parseSector(sectorByteBuffer);

      const materials = this._materialManager.getModelMaterials(sector.modelIdentifier.revealInternalId);

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
            this.createMesh(group, parsedGeometry.geometryBuffer, materials.triangleMesh, wholeSectorBoundingBox);
            break;
          case RevealGeometryCollectionType.TexturedTriangleMesh:
            const material = this._materialManager.addTexturedMeshMaterial(
              sector.modelIdentifier.revealInternalId,
              sector.metadata.id,
              parsedGeometry.texture!
            );
            this.createMesh(group, parsedGeometry.geometryBuffer, material, wholeSectorBoundingBox);
            group.addTexture(parsedGeometry.texture!);
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
    } catch (e) {
      const error = e as Error;
      if (error?.cause === 'InvalidModel') {
        Log.info('Invalid Model:', error.message);
      } else if (error?.name === 'AbortError') {
        Log.info('Abort Error:', error.message);
      } else {
        MetricsLogger.trackError(error, { moduleName: 'GltfSectorLoader', methodName: 'loadSector' });
      }
      throw e;
    }
  }

  private createTreeIndexSet(geometry: THREE.BufferGeometry): Map<number, number> {
    const treeIndexAttribute = geometry.attributes['treeIndex'];
    assert(treeIndexAttribute !== undefined);

    const treeIndexSet = new Map<number, number>();

    for (let i = 0; i < treeIndexAttribute.count; i++) {
      incrementOrInsertIndex(treeIndexSet, (treeIndexAttribute as THREE.BufferAttribute).getX(i));
    }

    return treeIndexSet;
  }

  private createMesh(
    group: AutoDisposeGroup,
    geometry: THREE.BufferGeometry,
    material: THREE.RawShaderMaterial,
    geometryBoundingBox: THREE.Box3
  ) {
    // Assigns an approximate bounding-sphere to the geometry to avoid recalculating this on first render
    geometry.boundingSphere = geometryBoundingBox.getBoundingSphere(new THREE.Sphere());

    const mesh = new THREE.Mesh(geometry, material);
    group.add(mesh);
    mesh.frustumCulled = false; // Note: Frustum culling does not play well with node-transforms

    mesh.userData.treeIndices = this.createTreeIndexSet(geometry);

    if (material.uniforms.inverseModelMatrix === undefined) return;

    mesh.onBeforeRender = () => {
      const inverseModelMatrix: THREE.Matrix4 = material.uniforms.inverseModelMatrix.value;
      inverseModelMatrix.copy(mesh.matrixWorld).invert();
    };
  }
}
