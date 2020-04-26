/*!
 * Copyright 2020 Cognite AS
 */

import { CadModel } from './CadModel';
import { SectorModelTransformation } from './types';
import { SectorScene } from './SectorScene';
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
  dataRetriever: ModelDataRetriever;
  private _scene?: SectorScene;
  private readonly _modelTransformation: SectorModelTransformation;

  private readonly scenePromise: Promise<SectorScene>;
  /**
   * Do not use directly, see loadCadModelByUrl().
   * @see loadCadModelByUrl
   */
  private constructor(dataRetriever: ModelDataRetriever, modelTransformation: SectorModelTransformation) {
    this.dataRetriever = dataRetriever;
    this._modelTransformation = modelTransformation;

    const metadataJson = this.dataRetriever.fetchJson('scene.json');
    this.scenePromise = parseSceneMetadata(metadataJson);
    this._scene = undefined;
  }

  public async fetchSectorMetadata(): Promise<SectorScene> {
    return this.scenePromise;
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
