/*!
 * Copyright 2020 Cognite AS
 */

import { CadMetadataParser } from './parsers/CadMetadataParser';
import { SectorScene } from './sector/types';
import { File3dFormat } from '@/utilities';
import { CadModelMetadata } from '@/datamodels/cad/CadModelMetadata';
import {
  ModelUrlProvider,
  ModelTransformationProvider,
  JsonFileProvider,
  ModelCameraConfigurationProvider
} from '@/utilities/networking/types';
import { MetadataRepository } from '../base';
import { transformCameraConfiguration } from '@/utilities/transformCameraConfiguration';

type ModelIdentifierWithFormat<T> = T & { format: File3dFormat };
type ModelMetadataProvider<TModelIdentifier> = ModelUrlProvider<TModelIdentifier> &
  ModelTransformationProvider<TModelIdentifier> &
  ModelCameraConfigurationProvider<TModelIdentifier> &
  JsonFileProvider;

export class CadModelMetadataRepository<TModelIdentifier>
  implements MetadataRepository<TModelIdentifier, Promise<CadModelMetadata>> {
  private readonly _modelMetadataProvider: ModelMetadataProvider<ModelIdentifierWithFormat<TModelIdentifier>>;
  private readonly _cadSceneParser: CadMetadataParser;
  private readonly _blobFileName: string;
  constructor(
    modelMetadataProvider: ModelMetadataProvider<TModelIdentifier>,
    cadMetadataParser: CadMetadataParser,
    blobFileName: string = 'scene.json'
  ) {
    this._modelMetadataProvider = modelMetadataProvider;
    this._cadSceneParser = cadMetadataParser;
    this._blobFileName = blobFileName;
  }

  async loadData(modelIdentifier: TModelIdentifier): Promise<CadModelMetadata> {
    const identifierWithFormat = { format: File3dFormat.RevealCadModel, ...modelIdentifier };
    const blobUrlPromise = this._modelMetadataProvider.getModelUrl(identifierWithFormat);
    const modelTransformationPromise = this._modelMetadataProvider.getModelTransformation(identifierWithFormat);
    const modelCameraPromise = this._modelMetadataProvider.getModelCamera(identifierWithFormat);

    const blobUrl = await blobUrlPromise;
    const json = await this._modelMetadataProvider.getJsonFile(blobUrl, this._blobFileName);
    const scene: SectorScene = this._cadSceneParser.parse(json);
    const modelTransformation = await modelTransformationPromise;
    const cameraConfiguration = await modelCameraPromise;

    return {
      blobUrl,
      modelTransformation,
      cameraConfiguration: transformCameraConfiguration(cameraConfiguration, modelTransformation),
      scene
    };
  }
}
