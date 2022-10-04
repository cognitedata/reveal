/*!
 * Copyright 2021 Cognite AS
 */

import { PotreeNodeWrapper } from './PotreeNodeWrapper';
import { PointCloudMetadata } from './PointCloudMetadata';

import { ModelDataProvider } from '@reveal/data-providers';

import { PointCloudOctree, Potree } from './potree-three-loader';
import { PointCloudMaterialManager } from '@reveal/rendering';

export class PointCloudFactory {
  private readonly _potreeInstance: Potree;
  private readonly _pointCloudMaterialManager: PointCloudMaterialManager;

  constructor(modelLoader: ModelDataProvider, pointCloudMaterialManager: PointCloudMaterialManager) {
    this._potreeInstance = new Potree(modelLoader, pointCloudMaterialManager);
    this._pointCloudMaterialManager = pointCloudMaterialManager;
  }

  get potreeInstance(): Potree {
    return this._potreeInstance;
  }

  dispose(): void {
    this._pointCloudMaterialManager.dispose();
  }

  async createModel(modelMetadata: PointCloudMetadata): Promise<PotreeNodeWrapper> {
    const { modelBaseUrl, modelIdentifier } = modelMetadata;

    return this._potreeInstance.loadPointCloud(modelBaseUrl, 'ept.json', modelIdentifier).then((pco: PointCloudOctree) => {
      pco.name = `PointCloudOctree: ${modelBaseUrl}`;
      return new PotreeNodeWrapper(pco, modelIdentifier);
    });
  }
}
