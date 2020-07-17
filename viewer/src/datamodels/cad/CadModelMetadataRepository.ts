/*!
 * Copyright 2020 Cognite AS
 */

import { CadMetadataParser } from './parsers/CadMetadataParser';
import { SectorScene } from './sector/types';
import { File3dFormat } from '@/utilities';
import { CadModelMetadata } from '@/datamodels/cad/CadModelMetadata';
import { ModelUrlProvider, ModelTransformationProvider, JsonFileProvider } from '@/utilities/networking/types';
import { MetadataRepository } from '../base';

type ModelIdentifierWithFormat<T> = T & { format: File3dFormat };
type ModelMetadataProvider<TModelIdentifier> = ModelUrlProvider<TModelIdentifier> & JsonFileProvider;

export class CadModelMetadataRepository<TModelIdentifier>
  implements MetadataRepository<TModelIdentifier, Promise<CadModelMetadata>> {
  private readonly _modelMetadataProvider: ModelMetadataProvider<ModelIdentifierWithFormat<TModelIdentifier>>;
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
    const identifierWithFormat = { format: File3dFormat.RevealCadModel, ...modelIdentifier };
    const blobUrl = await this._modelMetadataProvider.getModelUrl(identifierWithFormat);
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
