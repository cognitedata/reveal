/*!
 * Copyright 2022 Cognite AS
 */

import { ConsumedSector, WantedSector, filterGeometryOutsideClipBox, ParsedMeshGeometry } from '@reveal/cad-parsers';
import { BinaryFileProvider } from '@reveal/data-providers';
import { GltfSectorParser, ParsedGeometry, RevealGeometryCollectionType } from '@reveal/sector-parser';
import { MetricsLogger } from '@reveal/metrics';
import { assertNever } from '@reveal/utilities';

import { Log } from '@reveal/logger';

export class GltfSectorLoader {
  private readonly _gltfSectorParser: GltfSectorParser;
  private readonly _sectorFileProvider: BinaryFileProvider;

  constructor(sectorFileProvider: BinaryFileProvider) {
    this._gltfSectorParser = new GltfSectorParser();
    this._sectorFileProvider = sectorFileProvider;
  }

  async loadSector(sector: WantedSector, abortSignal?: AbortSignal): Promise<ConsumedSector> {
    const { metadata } = sector;
    try {
      const sectorByteBuffer = await this._sectorFileProvider.getBinaryFile(
        sector.modelBaseUrl,
        metadata.sectorFileName!,
        abortSignal
      );

      const wholeSectorBoundingBox = sector.metadata.geometryBoundingBox;

      const parsedSectorGeometry = await this._gltfSectorParser.parseSector(sectorByteBuffer);

      const geometryBatchingQueue: ParsedGeometry[] = [];

      const parsedMeshGeometries: ParsedMeshGeometry[] = [];

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
            parsedMeshGeometries.push({
              geometryBuffer: parsedGeometry.geometryBuffer,
              type: RevealGeometryCollectionType.TriangleMesh,
              wholeSectorBoundingBox
            });
            break;
          case RevealGeometryCollectionType.TexturedTriangleMesh:
            parsedMeshGeometries.push({
              geometryBuffer: parsedGeometry.geometryBuffer,
              type: RevealGeometryCollectionType.TexturedTriangleMesh,
              wholeSectorBoundingBox,
              texture: parsedGeometry.texture!
            });
            break;
          default:
            assertNever(type);
        }
      });

      return {
        levelOfDetail: sector.levelOfDetail,
        instancedMeshes: [],
        metadata: metadata,
        modelIdentifier: sector.modelIdentifier,
        geometryBatchingQueue: geometryBatchingQueue,
        parsedMeshGeometries: parsedMeshGeometries
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
}
