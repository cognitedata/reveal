/*!
 * Copyright 2022 Cognite AS
 */

import { ModelIdentifier } from '@reveal/data-providers';
import { PointCloudMetadata } from '../PointCloudMetadata';
import { ClassificationInfo } from '../potree-three-loader/loading/ClassificationInfo';

export interface IPointClassificationsProvider {
  getClassifications(modelMetadata: PointCloudMetadata, modelIdentifier: ModelIdentifier): Promise<ClassificationInfo>;
}
