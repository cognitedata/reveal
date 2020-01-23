/*!
 * Copyright 2019 Cognite AS
 */

import { FetchSectorMetadataDelegate, FetchSectorDelegate, FetchCtmDelegate } from '../../../models/sector/delegates';
import { CogniteClient, RevealSector3D, Versioned3DFile } from '@cognite/sdk';
import { buildSectorMetadata } from './buildSectorMetadata';
import { constructMatrixFromRotation } from '../../constructMatrixFromRotation';
import { getNewestVersionedFile } from '../utilities';
import { SectorModelTransformation } from '../../../models/sector/types';
import { SectorModel } from '../../SectorModel';
import { mat4 } from 'gl-matrix';
import { LocalSimpleSectorMetadataResponse } from '../../local/sector/loadLocalSimpleSectorMetadata';

export function createSectorModel(sdk: CogniteClient, modelId: number, revisionId: number): SectorModel {
  const metadataPromise = loadSectorMetadata(sdk, modelId, revisionId);

  // TODO replace this with actually fetching metadata about simple sectors
  const simpleMetadataPromise: Promise<Map<number, LocalSimpleSectorMetadataResponse>> = new Promise(resolve => {
    throw new Error('Not implemented');
  });

  const rotationPromise = loadRotation(sdk, modelId, revisionId);
  const sectorFilemapPromise = (async () => {
    return createSectorFilemap(await metadataPromise);
  })();

  const fetchSectorMetadata: FetchSectorMetadataDelegate = async () => {
    const modelMatrix = constructMatrixFromRotation(await rotationPromise);
    const inverseModelMatrix = mat4.invert(mat4.create(), modelMatrix);
    if (!inverseModelMatrix) {
      throw new Error('Model rotation resulted in non-invertible model matrix');
    }
    const modelTransform: SectorModelTransformation = {
      modelMatrix,
      inverseModelMatrix
    };
    return [buildSectorMetadata(await metadataPromise, await simpleMetadataPromise), modelTransform];
  };
  const fetchSector: FetchSectorDelegate = async sectorId => {
    const sectorFilemap = await sectorFilemapPromise;
    const file = sectorFilemap.get(sectorId);
    if (!file) {
      throw new Error(`Could not find a file mapping for sector ${sectorId}`);
    }
    return loadSectorGeometry(sdk, sectorId, file);
  };
  const fetchSectorQuads: FetchSectorDelegate = async sectorId => {
    // TODO implement
    throw new Error('Not implemeted');
  };
  const fetchCtmFile: FetchCtmDelegate = async fileId => {
    return loadCtmFile(sdk, fileId);
  };

  return [fetchSectorMetadata, fetchSector, fetchSectorQuads, fetchCtmFile];
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

async function loadSectorGeometry(sdk: CogniteClient, sectorId: number, file: Versioned3DFile): Promise<Uint8Array> {
  const buffer = await sdk.files3D.retrieve(file!.fileId);
  return new Uint8Array(buffer);
}

async function loadCtmFile(sdk: CogniteClient, fileId: number): Promise<Uint8Array> {
  const buffer = await sdk.files3D.retrieve(fileId);
  return new Uint8Array(buffer);
}
