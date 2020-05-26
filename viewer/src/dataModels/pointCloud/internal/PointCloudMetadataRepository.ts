/*!
 * Copyright 2020 Cognite AS
 */

import { ModelUrlProvider } from '@/utilities/networking/types';
import { EptSceneProvider } from './EptSceneProvider';
import { PointCloudMetadata } from '@/dataModels/pointCloud/public/PointCloudMetadata';

// TODO 25-05-2020 j-bjorne: Move into common type folder
import { DataRepository } from '@/dataModels/cad/internal/DataRepository';
import { CadTransformationProvider } from '@/dataModels/cad/internal/CadTransformationProvider';

export class PointCloudMetadataRepository<TModelIdentifier>
  implements DataRepository<TModelIdentifier, Promise<PointCloudMetadata>> {
  private readonly _modelMetadataProvider: ModelUrlProvider<TModelIdentifier> & EptSceneProvider;
  private readonly _cadTransformationProvider: CadTransformationProvider;
  constructor(
    modelBlobProvider: ModelUrlProvider<TModelIdentifier> & EptSceneProvider,
    cadTransformationProvider: CadTransformationProvider
  ) {
    this._modelMetadataProvider = modelBlobProvider;
    this._cadTransformationProvider = cadTransformationProvider;
  }
  async loadData(modelIdentifier: TModelIdentifier): Promise<PointCloudMetadata> {
    const blobUrl = await this._modelMetadataProvider.getModelUrl(modelIdentifier);
    const scene = await this._modelMetadataProvider.getEptScene(blobUrl);
    // TODO: j-bjorne 15-05-2020: Making provider to ready for getting it from network.
    const modelTransformation = this._cadTransformationProvider.getCadTransformation();
    return {
      blobUrl,
      modelTransformation,
      scene
    };
  }
}
