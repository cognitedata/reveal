/*!
 * Copyright 2020 Cognite AS
 */

import { CadModelMetadata } from '@/dataModels/cad/public/CadModelMetadata';
import { ModelUrlProvider } from '@/utilities/networking/types';
import { CadSceneProvider } from './CadSceneProvider';
import { CadMetadataParser } from './CadMetadataParser';
import { SectorScene } from './sector/SectorScene';
import { CadTransformationProvider } from './CadTransformationProvider';
import { DataRepository } from './DataRepository';

export class CadModelMetadataRepository<TModelIdentifier>
  implements DataRepository<TModelIdentifier, Promise<CadModelMetadata>> {
  private readonly _modelMetadataProvider: ModelUrlProvider<TModelIdentifier> & CadSceneProvider;
  private readonly _cadTransformationProvider: CadTransformationProvider;
  private readonly _cadSceneParser: CadMetadataParser;
  constructor(
    modelBlobProvider: ModelUrlProvider<TModelIdentifier> & CadSceneProvider,
    cadTransformationProvider: CadTransformationProvider,
    cadMetadataParser: CadMetadataParser
  ) {
    this._modelMetadataProvider = modelBlobProvider;
    this._cadTransformationProvider = cadTransformationProvider;
    this._cadSceneParser = cadMetadataParser;
  }
  async loadData(modelIdentifier: TModelIdentifier): Promise<CadModelMetadata> {
    const blobUrl = await this._modelMetadataProvider.getModelUrl(modelIdentifier);
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
