/*!
 * Copyright 2020 Cognite AS
 */

import { CadModel } from '.';
import { SectorModelTransformation } from './sector/types';
import { SectorScene } from './sector/SectorScene';
import { ModelDataRetriever } from '../../../utilities/networking/ModelDataRetriever';
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
    identifier: string,
    dataRetriever: ModelDataRetriever,
    modelTransformation: SectorModelTransformation
  ): Promise<CadModelImpl> {
    const model = new CadModelImpl(identifier, dataRetriever, modelTransformation);
    await model.initialize();
    return model;
  }
  readonly dataRetriever: ModelDataRetriever;
  readonly identifier: string;

  private _scene?: SectorScene;
  private readonly _modelTransformation: SectorModelTransformation;

  private readonly scenePromise: Promise<SectorScene>;
  /**
   * Do not use directly, see loadCadModelByUrl().
   * @see loadCadModelByUrl
   */
  private constructor(
    identifier: string,
    dataRetriever: ModelDataRetriever,
    modelTransformation: SectorModelTransformation
  ) {
    this.identifier = identifier;
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
