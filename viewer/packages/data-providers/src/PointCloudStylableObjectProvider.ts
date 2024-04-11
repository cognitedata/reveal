/*!
 * Copyright 2022 Cognite AS
 */

import { ModelIdentifier } from './ModelIdentifier';
import { PointCloudObject } from './pointcloud-stylable-object-providers/types';

export type PointCloudStylableObjectProvider = {
  getPointCloudObjects(modelIdentifier: ModelIdentifier): Promise<PointCloudObject[]>;
};
