/*!
 * Copyright 2020 Cognite AS
 */

import { EptSceneProvider } from './EptSceneProvider';

import { ModelUrlProvider, ModelTransformationProvider } from '@/utilities/networking/types';
import { PointCloudMetadata } from '@/datamodels/pointcloud/PointCloudMetadata';
import { DataRepository } from '@/datamodels/base';

type ModelMetadataProvider<TModelIdentifier> = ModelUrlProvider<TModelIdentifier> & EptSceneProvider;
export class PointCloudMetadataRepository<TModelIdentifier>
  implements DataRepository<TModelIdentifier, Promise<PointCloudMetadata>> {
  private readonly _modelMetadataProvider: ModelMetadataProvider<TModelIdentifier>;
  private readonly _cadTransformationProvider: ModelTransformationProvider;
  constructor(
    modelMetadataProvider: ModelMetadataProvider<TModelIdentifier>,
    cadTransformationProvider: ModelTransformationProvider
  ) {
    this._modelMetadataProvider = modelMetadataProvider;
    this._cadTransformationProvider = cadTransformationProvider;
  }
  async loadData(modelIdentifier: TModelIdentifier): Promise<PointCloudMetadata> {
    const blobUrl = await this._modelMetadataProvider.getModelUrl(modelIdentifier);
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
