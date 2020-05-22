/*!
 * Copyright 2020 Cognite AS
 */

import { CadModelMetadata } from '@/dataModels/cad/public/CadModelMetadata';
import { ModelUrlProvider } from '@/utilities/networking/ModelUrlProvider';
import { CadSceneProvider } from './CadSceneProvider';
import { CadMetadataParser } from './CadMetadataParser';
import { SectorScene } from './sector/SectorScene';
import { CadTransformationProvider } from './CadTransformationProvider';
import { DataRepository } from './DataRepository';

export class CadModelMetadataRepository<Params> implements DataRepository<Params, Promise<CadModelMetadata>> {
  private readonly _modelMetadataProvider: ModelUrlProvider<Params> & CadSceneProvider;
  private readonly _cadTransformationProvider: CadTransformationProvider;
  private readonly _cadSceneParser: CadMetadataParser;
  constructor(
    modelBlobProvider: ModelUrlProvider<Params> & CadSceneProvider,
    cadTransformationProvider: CadTransformationProvider,
    cadMetadataParser: CadMetadataParser
  ) {
    this._modelMetadataProvider = modelBlobProvider;
    this._cadTransformationProvider = cadTransformationProvider;
    this._cadSceneParser = cadMetadataParser;
  }
  async loadData(params: Params): Promise<CadModelMetadata> {
    const blobUrl = await this._modelMetadataProvider.getModelUrl(params);
    const json = await this._modelMetadataProvider.getCadScene(blobUrl);
    const scene: SectorScene = this._cadSceneParser.parse(json);
    // TODO: j-bjorne 15-05-2020: Making provider to ready for getting it from network.
    const modelTransformation = this._cadTransformationProvider.getCadTransformation();
    return {
      blobUrl,
      modelTransformation,
      scene
    };
  }
}
