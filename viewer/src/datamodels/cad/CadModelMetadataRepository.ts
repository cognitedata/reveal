/*!
 * Copyright 2020 Cognite AS
 */

import { CadMetadataParser } from './parsers/CadMetadataParser';
import { SectorScene } from './sector/types';

import { CadModelMetadata } from '@/datamodels/cad/CadModelMetadata';
import { DataRepository } from '@/datamodels/base';
import { ModelUrlProvider, ModelTransformationProvider } from '@/utilities/networking/types';
import { JsonFileProvider } from '@/utilities/networking/types';

type ModelMetadataProvider<TModelIdentifier> = ModelUrlProvider<TModelIdentifier> & JsonFileProvider;
export class CadModelMetadataRepository<TModelIdentifier>
  implements DataRepository<TModelIdentifier, Promise<CadModelMetadata>> {
  private readonly _modelMetadataProvider: ModelMetadataProvider<TModelIdentifier>;
  private readonly _cadTransformationProvider: ModelTransformationProvider;
  private readonly _cadSceneParser: CadMetadataParser;
  private readonly _blobFileName: string;
  constructor(
    modelMetadataProvider: ModelMetadataProvider<TModelIdentifier>,
    modelTransformationProvider: ModelTransformationProvider,
    cadMetadataParser: CadMetadataParser,
    blobFileName: string = 'scene.json'
  ) {
    this._modelMetadataProvider = modelMetadataProvider;
    this._cadTransformationProvider = modelTransformationProvider;
    this._cadSceneParser = cadMetadataParser;
    this._blobFileName = blobFileName;
  }
  async loadData(modelIdentifier: TModelIdentifier): Promise<CadModelMetadata> {
    const blobUrl = await this._modelMetadataProvider.getModelUrl(modelIdentifier);
    const json = await this._modelMetadataProvider.getJsonFile(blobUrl, this._blobFileName);
    const scene: SectorScene = this._cadSceneParser.parse(json);
    // TODO: j-bjorne 15-05-2020: Making provider to ready for getting it from network.
    const modelTransformation = this._cadTransformationProvider.getModelTransformation();
    return {
      blobUrl,
      modelTransformation,
      scene
    };
  }
}
