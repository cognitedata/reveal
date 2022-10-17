/*!
 * Copyright 2021 Cognite AS
 */

import { PotreeNodeWrapper } from './PotreeNodeWrapper';
import { PointCloudMetadata } from './PointCloudMetadata';

import { Potree } from './potree-three-loader';
import { DEFAULT_POINT_CLOUD_METADATA_FILE } from './constants';
import { PointCloudStylableObjectProvider } from '@reveal/data-providers';
import { IPointClassificationsProvider } from './classificationsProviders/IPointClassificationsProvider';

import { ModelDataProvider } from '@reveal/data-providers';

import { PointCloudMaterialManager } from '@reveal/rendering';
import { createObjectIdMaps } from './potree-three-loader/utils/createObjectIdMaps';

export class PointCloudFactory {
  private readonly _potreeInstance: Potree;
  private readonly _pointCloudObjectProvider: PointCloudStylableObjectProvider;
  private readonly _classificationsProvider: IPointClassificationsProvider;
  private readonly _pointCloudMaterialManager: PointCloudMaterialManager;

  constructor(
    modelLoader: ModelDataProvider,
    pointCloudObjectProvider: PointCloudStylableObjectProvider,
    classificationsProvider: IPointClassificationsProvider,
    pointCloudMaterialManager: PointCloudMaterialManager
  ) {
    this._potreeInstance = new Potree(modelLoader, pointCloudMaterialManager);
    this._pointCloudObjectProvider = pointCloudObjectProvider;
    this._classificationsProvider = classificationsProvider;
    this._pointCloudMaterialManager = pointCloudMaterialManager;
  }

  dispose(): void {
    this._pointCloudMaterialManager.dispose();
  }

  async createModel(modelMetadata: PointCloudMetadata): Promise<PotreeNodeWrapper> {
    const { modelBaseUrl, modelIdentifier } = modelMetadata;

    const annotationInfoPromise = this._pointCloudObjectProvider.getPointCloudObjects(modelIdentifier);
    const classSchemaPromise = this._classificationsProvider.getClassifications(modelMetadata);

    const annotationInfo = await annotationInfoPromise;
    const classSchema = await classSchemaPromise;

    this._pointCloudMaterialManager.addModelMaterial(modelIdentifier.revealInternalId,
                                                     createObjectIdMaps(annotationInfo));

    const pointCloudOctree = await this._potreeInstance.loadPointCloud(
      modelBaseUrl,
      DEFAULT_POINT_CLOUD_METADATA_FILE,
      annotationInfo,
      modelIdentifier.revealInternalId
    );

    pointCloudOctree.name = `PointCloudOctree: ${modelBaseUrl}`;
    return new PotreeNodeWrapper(modelIdentifier.revealInternalId, pointCloudOctree, annotationInfo, classSchema);
  }
}
