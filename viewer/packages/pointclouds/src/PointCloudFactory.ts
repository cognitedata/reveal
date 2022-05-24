/*!
 * Copyright 2021 Cognite AS
 */

import { PotreeNodeWrapper } from './PotreeNodeWrapper';
import { PointCloudMetadata } from './PointCloudMetadata';

import { ModelDataProvider } from '@reveal/modeldata-api';

import { PointCloudOctree, Potree } from './potree-three-loader';
import { StyledObjectInfo } from './styling/StyledObjectInfo';
import { DEFAULT_POINT_CLOUD_METADATA_FILE } from './constants';

export class PointCloudFactory {
  private readonly _potreeInstance: Potree;

  constructor(modelLoader: ModelDataProvider) {
    this._potreeInstance = new Potree(modelLoader);
  }

  get potreeInstance(): Potree {
    return this._potreeInstance;
  }

  async createModel(
    modelMetadata: PointCloudMetadata,
    styledObjectInfo?: StyledObjectInfo
  ): Promise<PotreeNodeWrapper> {
    const { modelBaseUrl } = modelMetadata;

    const pointCloudOctree = await this._potreeInstance
      .loadPointCloud(modelBaseUrl, DEFAULT_POINT_CLOUD_METADATA_FILE, styledObjectInfo)

    pointCloudOctree.name = `PointCloudOctree: ${modelBaseUrl}`;
    return new PotreeNodeWrapper(pointCloudOctree, styledObjectInfo);
  }
}
