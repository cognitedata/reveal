/*!
 * Copyright 2019 Cognite AS
 */

import { FetchSectorMetadataDelegate, FetchSectorDelegate, FetchCtmDelegate } from '../../sector/delegates';
import { CogniteClient, RevealSector3D, Versioned3DFile } from '@cognite/sdk';
import { buildSectorMetadata } from './buildSectorMetadata';
import { constructMatrixFromRotation } from './constructMatrixFromRotation';
import { getNewestVersionedFile } from '../../sector/utilities';
import { SectorModelTransformation } from '../../sector/types';

export type SectorModel = [FetchSectorMetadataDelegate, FetchSectorDelegate, FetchCtmDelegate];

export function createSectorModel(sdk: CogniteClient, modelId: number, revisionId: number): SectorModel {
  const metadataPromise = loadSectorMetadata(sdk, modelId, revisionId);
  const rotationPromise = loadRotation(sdk, modelId, revisionId);
  const sectorFilemapPromise = (async () => {
    return createSectorFilemap(await metadataPromise);
  })();

  const fetchSectorMetadata: FetchSectorMetadataDelegate = async () => {
    const modelTransform: SectorModelTransformation = {
      modelMatrix: constructMatrixFromRotation(await rotationPromise)
    };
    return [buildSectorMetadata(await metadataPromise), modelTransform];
  };
  const fetchSector: FetchSectorDelegate = async sectorId => {
    const sectorFilemap = await sectorFilemapPromise;
    const file = sectorFilemap.get(sectorId);
    if (!file) {
      throw new Error(`Could not find a file mapping for sector ${sectorId}`);
    }
    return loadSectorGeometry(sdk, sectorId, file);
  };
  const fetchCtmFile: FetchCtmDelegate = async fileId => {
    return loadCtmFile(sdk, fileId);
  };

  return [fetchSectorMetadata, fetchSector, fetchCtmFile];
}

async function loadSectorMetadata(sdk: CogniteClient, modelId: number, revisionId: number): Promise<RevealSector3D[]> {
  let cursor: string | undefined;
  let sectors: RevealSector3D[] = [];
  do {
    const result = await sdk.viewer3D.listRevealSectors3D(modelId, revisionId, { cursor });
    sectors = sectors.concat(result.items);
    cursor = result.nextCursor;
  } while (cursor !== undefined);
  return sectors;
}

async function loadRotation(
  sdk: CogniteClient,
  modelId: number,
  revisionId: number
): Promise<[number, number, number] | null> {
  const result = await sdk.viewer3D.retrieveRevealRevision3D(modelId, revisionId);
  return result.rotation ? result.rotation : null;
}

function createSectorFilemap(sectors: RevealSector3D[]): Map<number, Versioned3DFile> {
  const sectorIdToFile = new Map<number, Versioned3DFile>();
  for (const sector of sectors) {
    const file = getNewestVersionedFile(sector.threedFiles);
    sectorIdToFile.set(sector.id, file);
  }
  return sectorIdToFile;
}

async function loadSectorGeometry(sdk: CogniteClient, sectorId: number, file: Versioned3DFile): Promise<ArrayBuffer> {
  const buffer = await sdk.files3D.retrieve(file!.fileId);
  return buffer;
}

async function loadCtmFile(sdk: CogniteClient, fileId: number): Promise<ArrayBuffer> {
  const buffer = await sdk.files3D.retrieve(fileId);
  return buffer;
}
