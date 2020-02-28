/*!
 * Copyright 2020 Cognite AS
 */

import { createParser, createQuadsParser } from '../../../models/cad/parseSectorData';
import { ParseSectorDelegate } from '../../../models/cad/delegates';
import { DefaultSectorRotationMatrix, DefaultInverseSectorRotationMatrix } from '../../constructMatrixFromRotation';
import { CadModel } from '../../../models/cad/CadModel';
import { CadMetadataParser } from '../../../models/cad/CadMetadataParser';
import { SectorScene, SectorModelTransformation, SectorQuads, Sector } from '../../../models/cad/types';
import { ModelDataRetriever } from '../../ModelDataRetriever';
import { LocalModelDataRetriever } from '../LocalModelDataRetriever';

// TODO 2020-02-27 larsmoa: Untangle interfaces. Doesn't make sense
// that we implement a Model in Datasources.
export class LocalCadModel implements CadModel {
  private readonly dataRetriever: ModelDataRetriever;

  private readonly detailedParser: ParseSectorDelegate<Sector>;
  private readonly simpleParserPromise: Promise<ParseSectorDelegate<SectorQuads>>;

  private readonly metadataPromise: Promise<[SectorScene, SectorModelTransformation]>;
  private metadata: [SectorScene, SectorModelTransformation] | undefined;

  constructor(baseUrl: string, dataRetriever?: ModelDataRetriever) {
    this.dataRetriever = dataRetriever || new LocalModelDataRetriever(baseUrl);
    this.detailedParser = createParser(id => this.fetchCtm(id));
    this.simpleParserPromise = createQuadsParser();

    const metadataJson = this.dataRetriever.fetchJson('scene.json');
    this.metadataPromise = preFetchMetadata(metadataJson);
  }

  // TODO 2020-02-27 larsmoa: Get rid of this function
  async initialize(): Promise<void> {
    this.metadata = await this.fetchSectorMetadata();
  }

  public get scene(): SectorScene {
    if (!this.metadata) {
      throw new Error('Call initialize() first');
    }
    return this.metadata[0];
  }

  public get modelTransformation(): SectorModelTransformation {
    if (!this.metadata) {
      throw new Error('Call initialize() first');
    }
    return this.metadata[1];
  }

  public parseDetailed(sectorId: number, buffer: Uint8Array): Promise<Sector> {
    return this.detailedParser(sectorId, buffer);
  }

  public async parseSimple(sectorId: number, buffer: Uint8Array): Promise<SectorQuads> {
    const simpleParser = await this.simpleParserPromise;
    return simpleParser(sectorId, buffer);
  }

  public async fetchSectorMetadata(): Promise<[SectorScene, SectorModelTransformation]> {
    return this.metadataPromise;
  }

  public async fetchSectorDetailed(sectorId: number): Promise<Uint8Array> {
    const [sectorScene] = await this.fetchSectorMetadata();
    const sector = sectorScene.sectors.get(sectorId);
    if (!sector) {
      throw new Error(`Could not find sector with ID ${sectorId}`);
    }

    const buffer = await this.dataRetriever.fetchData(sector.indexFile.fileName);
    return new Uint8Array(buffer);
  }

  public async fetchSectorSimple(sectorId: number): Promise<Uint8Array> {
    const [sectorScene] = await this.fetchSectorMetadata();
    const sector = sectorScene.sectors.get(sectorId);
    if (!sector) {
      throw new Error(`Could not find sector with ID ${sectorId}`);
    }
    if (!sector.facesFile.fileName) {
      throw new Error(`Sector ${sectorId} does not have faces-data (low detail)`);
    }

    const buffer = await this.dataRetriever.fetchData(sector.facesFile.fileName);
    return new Uint8Array(buffer);
  }

  public async fetchCtm(fileId: number): Promise<Uint8Array> {
    const buffer = await this.dataRetriever.fetchData(`/mesh_${fileId}.ctm`);
    return new Uint8Array(buffer);
  }
}

async function preFetchMetadata(metadataJson: Promise<any>): Promise<[SectorScene, SectorModelTransformation]> {
  const metadata = await metadataJson;
  const parser = new CadMetadataParser();

  const scene: SectorScene = parser.parse(metadata);
  const modelTransform: SectorModelTransformation = {
    modelMatrix: DefaultSectorRotationMatrix,
    inverseModelMatrix: DefaultInverseSectorRotationMatrix
  };

  return [scene, modelTransform];
}

export async function createLocalCadModel(baseUrl: string): Promise<CadModel> {
  const model = new LocalCadModel(baseUrl);
  await model.initialize();
  return model;
}
