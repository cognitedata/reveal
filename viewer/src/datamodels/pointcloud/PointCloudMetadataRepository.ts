/*!
 * Copyright 2020 Cognite AS
 */

import { File3dFormat } from '@/utilities';
import { ModelUrlProvider, ModelTransformationProvider, EptSceneProvider } from '@/utilities/networking/types';
import { PointCloudMetadata } from '@/datamodels/pointcloud/PointCloudMetadata';
import { MetadataRepository } from '../base';

type ModelIdentifierWithFormat<T> = T & { format: File3dFormat };
type ModelMetadataProvider<TModelIdentifier> = ModelUrlProvider<TModelIdentifier> & EptSceneProvider;

export class PointCloudMetadataRepository<TModelIdentifier>
  implements MetadataRepository<TModelIdentifier, Promise<PointCloudMetadata>> {
  private readonly _modelMetadataProvider: ModelMetadataProvider<ModelIdentifierWithFormat<TModelIdentifier>>;
  private readonly _cadTransformationProvider: ModelTransformationProvider;

  constructor(
    modelMetadataProvider: ModelMetadataProvider<TModelIdentifier>,
    cadTransformationProvider: ModelTransformationProvider
  ) {
    this._modelMetadataProvider = modelMetadataProvider;
    this._cadTransformationProvider = cadTransformationProvider;
  }

  async loadData(modelIdentifier: TModelIdentifier): Promise<PointCloudMetadata> {
    const idWithFormat = { format: File3dFormat.EptPointCloud, ...modelIdentifier };
    const blobUrl = await this._modelMetadataProvider.getModelUrl(idWithFormat);
    const scene = await this._modelMetadataProvider.getEptScene(blobUrl);
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
