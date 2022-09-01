/*!
 * Copyright 2021 Cognite AS
 */

import { PotreeNodeWrapper } from './PotreeNodeWrapper';
import { PointCloudMetadata } from './PointCloudMetadata';

import { ModelDataProvider } from '@reveal/modeldata-api';

import { PointCloudOctree, Potree } from './potree-three-loader';

export class PointCloudFactory {
  private readonly _potreeInstance: Potree;

  constructor(modelLoader: ModelDataProvider) {
    this._potreeInstance = new Potree(modelLoader);
  }

  get potreeInstance(): Potree {
    return this._potreeInstance;
  }

  async createModel(modelMetadata: PointCloudMetadata): Promise<PotreeNodeWrapper> {
    const { modelBaseUrl, modelIdentifier } = modelMetadata;

    return this._potreeInstance.loadPointCloud(modelBaseUrl, 'ept.json').then((pco: PointCloudOctree) => {
      pco.name = `PointCloudOctree: ${modelBaseUrl}`;
      return new PotreeNodeWrapper(pco, modelIdentifier);
    });
  }
}
