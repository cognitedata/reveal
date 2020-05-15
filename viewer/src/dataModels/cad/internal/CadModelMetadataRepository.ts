/*!
 * Copyright 2020 Cognite AS
 */

import { IdEither } from '@cognite/sdk';
import { CadModelMetadata } from '../public/CadModelMetadata';
import { ModelUrlProvider } from '../../../utilities/networking/ModelUrlProvider';
import { CadSceneProvider } from './CadSceneProvider';
import { File3dFormat } from '../../../utilities/File3dFormat';
import { CadMetadataParser } from './CadMetadataParser';
import { SectorScene } from './sector/SectorScene';
import { CadTransformationProvider } from './CadTransformationProvider';

export class CadModelMetadataRepository {
  private readonly _modelUrlProvider: ModelUrlProvider;
  private readonly _cadSceneAndUrlProvider: CadSceneProvider;
  private readonly _cadTransformationProvider: CadTransformationProvider;
  private readonly _cadSceneParser: CadMetadataParser;
  constructor(
    modelBlobProvider: ModelUrlProvider,
    cadSceneAndUrlProvider: CadSceneProvider,
    cadTransformationProvider: CadTransformationProvider,
    cadMetadataParser: CadMetadataParser
  ) {
    this._modelUrlProvider = modelBlobProvider;
    this._cadSceneAndUrlProvider = cadSceneAndUrlProvider;
    this._cadTransformationProvider = cadTransformationProvider;
    this._cadSceneParser = cadMetadataParser;
  }
  async loadMetadata(modelRevisionId: IdEither): Promise<CadModelMetadata> {
    const blobUrl = await this._modelUrlProvider.getModelUrl(modelRevisionId, File3dFormat.RevealCadModel);
    const json = await this._cadSceneAndUrlProvider.getCadScene(blobUrl);
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
