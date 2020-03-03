/*!
 * Copyright 2020 Cognite AS
 */

import { createParser, createQuadsParser } from './parseSectorData';
import { ParseSectorDelegate } from './delegates';
import { CadModel } from './CadModel';
import { SectorScene, SectorModelTransformation, SectorQuads, Sector } from './types';
import { ModelDataRetriever } from '../../datasources/ModelDataRetriever';
import { CadMetadataParser } from './CadMetadataParser';

export class CadModelImpl implements CadModel {
  public get modelTransformation(): SectorModelTransformation {
    return this._modelTransformation;
  }

  public get scene(): SectorScene {
    return this._scene!;
  }
  /**
   * Creates and initializes a instance by loading metadata through the retriever provided.
   * @param dataRetriever         Data retriever used to fetch geometry and model metadata.
   * @param modelTransformation   Model transformation matrix.
   */
  public static async create(
    dataRetriever: ModelDataRetriever,
    modelTransformation: SectorModelTransformation
  ): Promise<CadModelImpl> {
    const model = new CadModelImpl(dataRetriever, modelTransformation);
    await model.initialize();
    return model;
  }

  private _scene?: SectorScene;
  private readonly _modelTransformation: SectorModelTransformation;

  private readonly dataRetriever: ModelDataRetriever;
  private readonly detailedParser: ParseSectorDelegate<Sector>;
  private readonly simpleParserPromise: Promise<ParseSectorDelegate<SectorQuads>>;
  private readonly scenePromise: Promise<SectorScene>;

  /**
   * Do not use directly, see loadCadModelByUrl().
   * @see loadCadModelByUrl
   */
  private constructor(dataRetriever: ModelDataRetriever, modelTransformation: SectorModelTransformation) {
    this.dataRetriever = dataRetriever;
    this.detailedParser = createParser(id => this.fetchCtm(id));
    this.simpleParserPromise = createQuadsParser();
    this._modelTransformation = modelTransformation;

    const metadataJson = this.dataRetriever.fetchJson('scene.json');
    this.scenePromise = parseSceneMetadata(metadataJson);
    this._scene = undefined;
  }

  public parseDetailed(sectorId: number, buffer: Uint8Array): Promise<Sector> {
    return this.detailedParser(sectorId, buffer);
  }

  public async parseSimple(sectorId: number, buffer: Uint8Array): Promise<SectorQuads> {
    const simpleParser = await this.simpleParserPromise;
    return simpleParser(sectorId, buffer);
  }

  public async fetchSectorMetadata(): Promise<SectorScene> {
    return this.scenePromise;
  }

  public async fetchSectorDetailed(sectorId: number): Promise<Uint8Array> {
    const sector = this.scene.sectors.get(sectorId);
    if (!sector) {
      throw new Error(`Could not find sector with ID ${sectorId}`);
    }
    const buffer = await this.dataRetriever.fetchData(sector.indexFile.fileName);
    return new Uint8Array(buffer);
  }

  public async fetchSectorSimple(sectorId: number): Promise<Uint8Array> {
    const sector = this.scene.sectors.get(sectorId);
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

  private async initialize(): Promise<void> {
    this._scene = await this.scenePromise;
  }
}

async function parseSceneMetadata(metadataJson: Promise<any>): Promise<SectorScene> {
  const metadata = await metadataJson;
  const parser = new CadMetadataParser();
  const scene: SectorScene = parser.parse(metadata);
  return scene;
}
