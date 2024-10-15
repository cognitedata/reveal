/*!
 * Copyright 2022 Cognite AS
 */

import { PointCloudObject } from './pointcloud-stylable-object-providers/types';

export interface PointCloudStylableObjectProvider<T> {
  getPointCloudObjects(modelIdentifier: T): Promise<PointCloudObject[]>;
}
