/*!
 * Copyright 2022 Cognite AS
 */

/*!
 * Copyright 2021 Cognite AS
 */

import { PotreeNodeWrapper } from '../PotreeNodeWrapper';
import { PointCloudMetadata } from '../PointCloudMetadata';

import { Potree } from '../potree-three-loader';
import { DEFAULT_POINT_CLOUD_METADATA_FILE } from '../constants';

import { PointCloudObjectProvider } from '../styling/PointCloudObjectProvider';
import { PointCloudFactory } from '../IPointCloudFactory';

export class LocalPointCloudFactory implements PointCloudFactory {
  private readonly _potreeInstance: Potree;

  constructor(potreeInstance: Potree) {
    this._potreeInstance = potreeInstance;
  }

  get potreeInstance(): Potree {
    return this._potreeInstance;
  }

  async createModel(modelMetadata: PointCloudMetadata): Promise<PotreeNodeWrapper> {
    const { modelBaseUrl } = modelMetadata;

    const annotationInfo = new PointCloudObjectProvider([]);

    const pointCloudOctree = await this._potreeInstance.loadPointCloud(
      modelBaseUrl,
      DEFAULT_POINT_CLOUD_METADATA_FILE,
      annotationInfo
    );

    pointCloudOctree.name = `PointCloudOctree: ${modelBaseUrl}`;
    return new PotreeNodeWrapper(pointCloudOctree, annotationInfo.annotations);
  }
}
