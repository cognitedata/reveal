/*!
 * Copyright 2019 Cognite AS
 */

import { FetchCtmDelegate, FetchSectorDelegate, FetchSectorMetadataDelegate } from '../../models/sector/delegates';
import { SectorModel } from '../cognitesdk';
import { loadLocalSectorMetadata } from './loadLocalSectorMetadata';
import { DefaultSectorRotationMatrix } from '../cognitesdk/constructMatrixFromRotation';
import { loadLocalFileMap } from './loadLocalFileMap';
import { buildSectorMetadata } from '../cognitesdk/buildSectorMetadata';
import { getNewestVersionedFile } from '../cognitesdk/utilities';

export function createLocalSectorModel(baseUrl: string): SectorModel {
  const loadMetadata = loadLocalSectorMetadata(baseUrl + '/uploaded_sectors.txt');
  const loadSectorIdToFileId = loadMetadata.then(metadata => {
    const sectorIdToFileId = new Map<number, number>();
    for (const sector of metadata) {
      const bestFile = getNewestVersionedFile(sector.threedFiles);
      sectorIdToFileId.set(sector.id, bestFile.fileId);
    }
    return sectorIdToFileId;
  });
  const loadFilemap = loadLocalFileMap(baseUrl + '/uploaded_files.txt');

  const fetchMetadata: FetchSectorMetadataDelegate = async () => {
    return [buildSectorMetadata(await loadMetadata), { modelMatrix: DefaultSectorRotationMatrix }];
  };
  const fetchSector: FetchSectorDelegate = async (sectorId: number) => {
    const sectorIdToFileId = await loadSectorIdToFileId;
    const fileId = sectorIdToFileId.get(sectorId);
    if (!fileId) {
      throw new Error(`${sectorId} is not a valid sector ID`);
    }
    return fetchFile(fileId);
  };
  // TODO this function is a big hack because we do not have the f3d fileId
  const fetchSectorQuads: FetchSectorDelegate = async (sectorId: number) => {
    const sectorIdToFileId = await loadSectorIdToFileId;
    const fileId = sectorIdToFileId.get(sectorId);
    if (!fileId) {
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
  const fetchFile: FetchCtmDelegate = async (fileId: number) => {
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
  return [fetchMetadata, fetchSector, fetchSectorQuads, fetchFile];
}
