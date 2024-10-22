/*!
 * Copyright 2022 Cognite AS
 */

import { ModelIdentifier } from './ModelIdentifier';
import { PointCloudObject } from './pointcloud-stylable-object-providers/types';

export interface PointCloudStylableObjectProvider {
  getPointCloudObjects(modelIdentifier: ModelIdentifier, revisionSpace?: string): Promise<PointCloudObject[]>;
}
