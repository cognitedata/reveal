/*!
 * Copyright 2021 Cognite AS
 */

import { PotreeNodeWrapper } from './PotreeNodeWrapper';
import { PointCloudMetadata } from './PointCloudMetadata';
import { Potree } from './potree-three-loader';
import { DEFAULT_POINT_CLOUD_METADATA_FILE } from './constants';
import { PointCloudStylableObjectProvider } from '@reveal/data-providers';
import { IPointClassificationsProvider } from './classificationsProviders/IPointClassificationsProvider';

export class PointCloudFactory {
  private readonly _potreeInstance: Potree;
  private readonly _pointCloudObjectProvider: PointCloudStylableObjectProvider;
  private readonly _classificationsProvider: IPointClassificationsProvider;

  constructor(
    potreeInstance: Potree,
    pointCloudObjectProvider: PointCloudStylableObjectProvider,
    classificationsProvider: IPointClassificationsProvider
  ) {
    this._potreeInstance = potreeInstance;
    this._pointCloudObjectProvider = pointCloudObjectProvider;
    this._classificationsProvider = classificationsProvider;
  }

  get potreeInstance(): Potree {
    return this._potreeInstance;
  }

  async createModel(modelMetadata: PointCloudMetadata): Promise<PotreeNodeWrapper> {
    const { modelBaseUrl, modelIdentifier } = modelMetadata;

    const annotationInfoPromise = this._pointCloudObjectProvider.getPointCloudObjects(modelIdentifier);
    const classSchemaPromise = this._classificationsProvider.getClassifications(modelMetadata);

    const annotationInfo = await annotationInfoPromise;
    const classSchema = await classSchemaPromise;

    const pointCloudOctree = await this._potreeInstance.loadPointCloud(
      modelBaseUrl,
      DEFAULT_POINT_CLOUD_METADATA_FILE,
      annotationInfo
    );

    pointCloudOctree.name = `PointCloudOctree: ${modelBaseUrl}`;
    return new PotreeNodeWrapper(
      pointCloudOctree,
      annotationInfo.annotations,
      modelIdentifier.revealInternalId,
      classSchema
    );
  }
}
