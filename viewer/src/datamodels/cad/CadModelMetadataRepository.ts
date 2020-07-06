/*!
 * Copyright 2020 Cognite AS
 */

import { CadModelMetadata } from '@/datamodels/cad/CadModelMetadata';
import { ModelUrlProvider } from '@/utilities/networking/types';
import { CadSceneProvider } from './CadSceneProvider';
import { CadTransformationProvider } from './CadTransformationProvider';
import { DataRepository } from './DataRepository';
import { CadMetadataParser } from './parsers/CadMetadataParser';
import { SectorScene } from './sector/types';
import { File3dFormat } from '@/utilities';

type ModelIdentifierWithFormat<T> = T & { format: File3dFormat };
type ModelMetadataProvider<TModelIdentifier> = ModelUrlProvider<TModelIdentifier> & CadSceneProvider;

export class CadModelMetadataRepository<TModelIdentifier>
  implements DataRepository<TModelIdentifier, Promise<CadModelMetadata>> {
  private readonly _modelMetadataProvider: ModelMetadataProvider<ModelIdentifierWithFormat<TModelIdentifier>>;
  private readonly _cadTransformationProvider: CadTransformationProvider;
  private readonly _cadSceneParser: CadMetadataParser;
  constructor(
    modelMetadataProvider: ModelMetadataProvider<TModelIdentifier>,
    cadTransformationProvider: CadTransformationProvider,
    cadMetadataParser: CadMetadataParser
  ) {
    this._modelMetadataProvider = modelMetadataProvider;
    this._cadTransformationProvider = cadTransformationProvider;
    this._cadSceneParser = cadMetadataParser;
  }
  async loadData(modelIdentifier: TModelIdentifier): Promise<CadModelMetadata> {
    const identifierWithFormat = { format: File3dFormat.RevealCadModel, ...modelIdentifier };
    const blobUrl = await this._modelMetadataProvider.getModelUrl(identifierWithFormat);
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
