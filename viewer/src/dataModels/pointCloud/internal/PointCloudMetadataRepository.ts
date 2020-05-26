/*!
 * Copyright 2020 Cognite AS
 */

import { ModelUrlProvider } from '@/utilities/networking/types';
import { EptSceneProvider } from './EptSceneProvider';
import { PointCloudMetadata } from '@/dataModels/pointCloud/public/PointCloudMetadata';

// TODO 25-05-2020 j-bjorne: Move into common type folder
import { DataRepository } from '@/dataModels/cad/internal/DataRepository';
import { CadTransformationProvider } from '@/dataModels/cad/internal/CadTransformationProvider';

type ModelMetadataProvider<TModelIdentifier> = ModelUrlProvider<TModelIdentifier> & EptSceneProvider;
export class PointCloudMetadataRepository<TModelIdentifier>
  implements DataRepository<TModelIdentifier, Promise<PointCloudMetadata>> {
  private readonly _modelMetadataProvider: ModelMetadataProvider<TModelIdentifier>;
  private readonly _cadTransformationProvider: CadTransformationProvider;
  constructor(
    modelMetadataProvider: ModelMetadataProvider<TModelIdentifier>,
    cadTransformationProvider: CadTransformationProvider
  ) {
    this._modelMetadataProvider = modelMetadataProvider;
    this._cadTransformationProvider = cadTransformationProvider;
  }
  async loadData(modelIdentifier: TModelIdentifier): Promise<PointCloudMetadata> {
    const blobUrl = await this._modelMetadataProvider.getModelUrl(modelIdentifier);
    const scene = await this._modelMetadataProvider.getEptScene(blobUrl);
    // TODO: j-bjorne 15-05-2020: Making provider to ready for getting it from network.
    // This provider should change its input and return type once we have a functioning api call.
    const modelTransformation = this._cadTransformationProvider.getCadTransformation();
    return {
      blobUrl,
      modelTransformation,
      scene
    };
  }
}
