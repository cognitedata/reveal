/*!
 * Copyright 2022 Cognite AS
 */

import { ModelIdentifier } from '@reveal/data-providers';
import { PointCloudObjectData } from './pointcloud-stylable-object-providers/PointCloudObjectAnnotationData';

export interface PointCloudStylableObjectProvider {
  getPointCloudObjects(modelIdentifier: ModelIdentifier): Promise<PointCloudObjectData>;
}
