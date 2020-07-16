/*!
 * Copyright 2020 Cognite AS
 */

import { ModelUrlProvider, ModelTransformationProvider, JsonFileProvider } from '@/utilities/networking/types';
import { PointCloudMetadata } from '@/datamodels/pointcloud/PointCloudMetadata';
import { MetadataRepository } from '../base';
import { File3dFormat } from '@/utilities/types';

type ModelIdentifierWithFormat<T> = T & { format: File3dFormat };
type ModelMetadataProvider<TModelIdentifier> = ModelUrlProvider<TModelIdentifier> & JsonFileProvider;

export class PointCloudMetadataRepository<TModelIdentifier>
  implements MetadataRepository<TModelIdentifier, Promise<PointCloudMetadata>> {
  private readonly _modelMetadataProvider: ModelMetadataProvider<ModelIdentifierWithFormat<TModelIdentifier>>;
  private readonly _cadTransformationProvider: ModelTransformationProvider;
  private readonly _blobFileName: string;
  constructor(
    modelMetadataProvider: ModelMetadataProvider<TModelIdentifier>,
    cadTransformationProvider: ModelTransformationProvider,
    blobFileName: string = 'ept.json'
  ) {
    this._modelMetadataProvider = modelMetadataProvider;
    this._cadTransformationProvider = cadTransformationProvider;
    this._blobFileName = blobFileName;
  }

  async loadData(modelIdentifier: TModelIdentifier): Promise<PointCloudMetadata> {
    const idWithFormat = { format: File3dFormat.EptPointCloud, ...modelIdentifier };
    const blobUrl = await this._modelMetadataProvider.getModelUrl(idWithFormat);
    const scene = await this._modelMetadataProvider.getJsonFile(blobUrl, this._blobFileName);
    // TODO: j-bjorne 15-05-2020: Making provider to ready for getting it from network.
    // This provider should change its input and return type once we have a functioning api call.
    const modelTransformation = this._cadTransformationProvider.getModelTransformation();
    return {
      blobUrl,
      modelTransformation,
      scene
    };
  }
}
