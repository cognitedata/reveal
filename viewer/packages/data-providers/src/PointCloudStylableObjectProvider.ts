/*!
 * Copyright 2022 Cognite AS
 */

import { ModelIdentifier } from './ModelIdentifier';
import { PointCloudObjectData } from './pointcloud-stylable-object-providers/PointCloudObjectAnnotationData';

export interface PointCloudStylableObjectProvider {
  getPointCloudObjects(modelIdentifier: ModelIdentifier): Promise<PointCloudObjectData>;
}
