/*!
 * Copyright 2020 Cognite AS
 */

import { CadSceneProvider } from './CadSceneProvider';
import { CadMetadataParser } from './parsers/CadMetadataParser';
import { SectorScene } from './sector/types';

import { CadModelMetadata } from '@/datamodels/cad/CadModelMetadata';
import { DataRepository, TransformationProvider } from '@/datamodels/base';
import { ModelUrlProvider } from '@/utilities/networking/types';

type ModelMetadataProvider<TModelIdentifier> = ModelUrlProvider<TModelIdentifier> & CadSceneProvider;
export class CadModelMetadataRepository<TModelIdentifier>
  implements DataRepository<TModelIdentifier, Promise<CadModelMetadata>> {
  private readonly _modelMetadataProvider: ModelMetadataProvider<TModelIdentifier>;
  private readonly _cadTransformationProvider: TransformationProvider;
  private readonly _cadSceneParser: CadMetadataParser;
  constructor(
    modelMetadataProvider: ModelMetadataProvider<TModelIdentifier>,
    cadTransformationProvider: TransformationProvider,
    cadMetadataParser: CadMetadataParser
  ) {
    this._modelMetadataProvider = modelMetadataProvider;
    this._cadTransformationProvider = cadTransformationProvider;
    this._cadSceneParser = cadMetadataParser;
  }
  async loadData(modelIdentifier: TModelIdentifier): Promise<CadModelMetadata> {
    const blobUrl = await this._modelMetadataProvider.getModelUrl(modelIdentifier);
    const json = await this._modelMetadataProvider.getCadScene(blobUrl);
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
