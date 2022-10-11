/*!
 * Copyright 2021 Cognite AS
 */

import { PotreeNodeWrapper } from './PotreeNodeWrapper';
import { PointCloudMetadata } from './PointCloudMetadata';
import { Potree } from './potree-three-loader';
import { DEFAULT_POINT_CLOUD_METADATA_FILE } from './constants';
import { IAnnotationProvider } from './styling/IAnnotationProvider';


export class PointCloudFactory {
  private readonly _potreeInstance: Potree;
  private readonly _annotationProvider: IAnnotationProvider;

  constructor(potreeInstance: Potree, annotationProvider: IAnnotationProvider) {
    this._potreeInstance = potreeInstance;
    this._annotationProvider = annotationProvider;
  }

  get potreeInstance(): Potree {
    return this._potreeInstance;
  }

  async createModel(modelMetadata: PointCloudMetadata): Promise<PotreeNodeWrapper> {
    const { modelBaseUrl, modelIdentifier } = modelMetadata;

    const annotationInfo = await this._annotationProvider.getAnnotations(modelIdentifier);

    const pointCloudOctree = await this._potreeInstance.loadPointCloud(
      modelBaseUrl,
      DEFAULT_POINT_CLOUD_METADATA_FILE,
      annotationInfo
    );

    pointCloudOctree.name = `PointCloudOctree: ${modelBaseUrl}`;
    return new PotreeNodeWrapper(pointCloudOctree, annotationInfo.annotations, modelIdentifier.revealInternalId);
  }
}
