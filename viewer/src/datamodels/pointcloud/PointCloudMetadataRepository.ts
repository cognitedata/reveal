/*!
 * Copyright 2020 Cognite AS
 */

import {
  ModelUrlProvider,
  JsonFileProvider,
  ModelTransformationProvider,
  ModelCameraConfigurationProvider
} from '@/utilities/networking/types';
import { PointCloudMetadata } from '@/datamodels/pointcloud/PointCloudMetadata';
import { MetadataRepository } from '../base';
import { File3dFormat } from '@/utilities/types';
import { transformCameraConfiguration } from '@/utilities/transformCameraConfiguration';

type ModelIdentifierWithFormat<T> = T & { format: File3dFormat };
type ModelMetadataProvider<TModelIdentifier> = ModelUrlProvider<TModelIdentifier> &
  ModelTransformationProvider<TModelIdentifier> &
  ModelCameraConfigurationProvider<TModelIdentifier> &
  JsonFileProvider;

export class PointCloudMetadataRepository<TModelIdentifier>
  implements MetadataRepository<TModelIdentifier, Promise<PointCloudMetadata>> {
  private readonly _modelMetadataProvider: ModelMetadataProvider<ModelIdentifierWithFormat<TModelIdentifier>>;
  private readonly _blobFileName: string;
  constructor(modelMetadataProvider: ModelMetadataProvider<TModelIdentifier>, blobFileName: string = 'ept.json') {
    this._modelMetadataProvider = modelMetadataProvider;
    this._blobFileName = blobFileName;
  }

  async loadData(modelIdentifier: TModelIdentifier): Promise<PointCloudMetadata> {
    const idWithFormat = { format: File3dFormat.EptPointCloud, ...modelIdentifier };
    const blobUrlPromise = this._modelMetadataProvider.getModelUrl(idWithFormat);
    const modelMatrixPromise = this._modelMetadataProvider.getModelMatrix(idWithFormat);
    const cameraConfigurationPromise = this._modelMetadataProvider.getModelCamera(idWithFormat);

    const blobUrl = await blobUrlPromise;
    const scene = await this._modelMetadataProvider.getJsonFile(blobUrl, this._blobFileName);
    const modelMatrix = await modelMatrixPromise;
    const cameraConfiguration = await cameraConfigurationPromise;
    return {
      blobUrl,
      modelMatrix,
      cameraConfiguration: transformCameraConfiguration(cameraConfiguration, modelMatrix),
      scene
    };
  }
}
