/*!
 * Copyright 2020 Cognite AS
 */

import { createParser, createQuadsParser } from '../../../models/cad/parseSectorData';
import { FetchCtmDelegate, FetchSectorDelegate, FetchSectorMetadataDelegate } from '../../../models/cad/delegates';
import { DefaultSectorRotationMatrix, DefaultInverseSectorRotationMatrix } from '../../constructMatrixFromRotation';
import { CadModel } from '../../../models/cad/CadModel';
import { CadMetadataParser } from '../../../models/cad/CadMetadataParser';

export async function createLocalCadModel(baseUrl: string): Promise<CadModel> {
  const metadataParser = new CadMetadataParser();
  const metadataRequest = (async () => {
    const response = await fetch(baseUrl + '/scene.json');
    return response.json();
  })();

  const fetchSectorMetadata: FetchSectorMetadataDelegate = async () => {
    return [
      metadataParser.parse(await metadataRequest),
      {
        modelMatrix: DefaultSectorRotationMatrix,
        inverseModelMatrix: DefaultInverseSectorRotationMatrix
      }
    ];
  };
  const fetchSectorDetailed: FetchSectorDelegate = async (sectorId: number) => {
    const [sectorScene] = await fetchSectorMetadata();
    const sector = sectorScene.sectors.get(sectorId);
    if (!sector) {
      throw new Error(`Could not find sector with ID ${sectorId}`);
    }

    const response = await fetch(baseUrl + '/' + sector.indexFile.fileName);
    return new Uint8Array(await response.arrayBuffer());
  };
  // TODO this function is a big hack because we do not have the f3d fileId
  const fetchSectorSimple: FetchSectorDelegate = async (sectorId: number) => {
    const [sectorScene] = await fetchSectorMetadata();
    const sector = sectorScene.sectors.get(sectorId);
    if (!sector) {
      throw new Error(`Could not find sector with ID ${sectorId}`);
    }
    if (!sector.facesFile) {
      throw new Error(`Sector ${sectorId} does not have faces-data (low detail)`);
    }

    const response = await fetch(baseUrl + '/' + sector.facesFile.fileName);
    return new Uint8Array(await response.arrayBuffer());
  };
  const fetchCtm: FetchCtmDelegate = async (fileId: number) => {
    const response = await fetch(baseUrl + `/mesh_${fileId}.ctm`);
    return new Uint8Array(await response.arrayBuffer());
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
