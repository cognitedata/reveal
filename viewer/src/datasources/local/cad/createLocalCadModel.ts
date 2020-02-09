/*!
 * Copyright 2020 Cognite AS
 */

import { createParser, createQuadsParser } from '../../../models/cad/parseSectorData';
import { FetchCtmDelegate, FetchSectorDelegate, FetchSectorMetadataDelegate } from '../../../models/cad/delegates';
import { loadLocalCadMetadata } from './loadLocalCadMetadata';
import { loadLocalSimpleCadMetadata } from './loadLocalSimpleSectorMetadata';
import { DefaultSectorRotationMatrix, DefaultInverseSectorRotationMatrix } from '../../constructMatrixFromRotation';
import { loadLocalFileMap } from './loadLocalFileMap';
import { buildSectorMetadata } from '../../cognitesdk/cad/buildSectorMetadata';
import { getNewestVersionedFile } from '../../cognitesdk/utilities';
import { CadModel } from '../../../models/cad/CadModel';

// TODO rename file from sector to cad
export async function createLocalCadModel(baseUrl: string): Promise<CadModel> {
  const loadMetadata = loadLocalCadMetadata(baseUrl + '/uploaded_sectors.txt');
  const loadSimpleMetadata = loadLocalSimpleCadMetadata(baseUrl + '/uploaded_sectors_simple.txt');
  const loadSectorIdToFileId = loadMetadata.then(metadata => {
    const sectorIdToFileId = new Map<number, number>();
    for (const sector of metadata) {
      const bestFile = getNewestVersionedFile(sector.threedFiles);
      sectorIdToFileId.set(sector.id, bestFile.fileId);
    }
    return sectorIdToFileId;
  });
  const loadFilemap = loadLocalFileMap(baseUrl + '/uploaded_files.txt');

  const fetchSectorMetadata: FetchSectorMetadataDelegate = async () => {
    return [
      buildSectorMetadata(await loadMetadata, await loadSimpleMetadata),
      {
        modelMatrix: DefaultSectorRotationMatrix,
        inverseModelMatrix: DefaultInverseSectorRotationMatrix
      }
    ];
  };
  const fetchSectorDetailed: FetchSectorDelegate = async (sectorId: number) => {
    const sectorIdToFileId = await loadSectorIdToFileId;
    const fileId = sectorIdToFileId.get(sectorId);
    if (!fileId || fileId === -1) {
      throw new Error(`${sectorId} is not a valid sector ID`);
    }
    return fetchCtm(fileId);
  };
  // TODO this function is a big hack because we do not have the f3d fileId
  const fetchSectorSimple: FetchSectorDelegate = async (sectorId: number) => {
    const sectorIdToFileId = await loadSectorIdToFileId;
    const fileId = sectorIdToFileId.get(sectorId);
    if (!fileId || fileId === -1) {
      throw new Error(`${sectorId} is not a valid sector ID`);
    }
    const filemap = await loadFilemap;
    const filename = filemap.get(fileId);
    if (!filename) {
      throw new Error(`Could not find filename mapping for file ${fileId})`);
    }
    const filenameQuads = filename.replace('.i3d', '.f3d');
    const url = baseUrl + '/' + filenameQuads;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Got error ${response.status} while fetching '${url}' (${response.statusText})`);
    }

    const buffer = await response.arrayBuffer();

    return new Uint8Array(buffer);
  };
  const fetchCtm: FetchCtmDelegate = async (fileId: number) => {
    const filemap = await loadFilemap;
    const filename = filemap.get(fileId);
    if (!filename) {
      throw new Error(`Could not find filename mapping for file ${fileId})`);
    }

    const url = baseUrl + '/' + filename;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Got error ${response.status} while fetching '${url}' (${response.statusText})`);
    }

    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  };
  // Fetch metadata
  const [scene, modelTransformation] = await fetchSectorMetadata();
  const parseDetailed = createParser(fetchCtm);
  const parseSimple = await createQuadsParser();
  return {
    fetchSectorMetadata,
    fetchSectorDetailed,
    fetchSectorSimple,
    fetchCtm,
    parseDetailed,
    parseSimple,
    scene,
    modelTransformation
  };
}
