/*!
 * Copyright 2022 Cognite AS
 */

import { ClassicDataSourceType, DataSourceType } from './DataSourceType';
import { PointCloudObject } from './pointcloud-stylable-object-providers/types';

export interface PointCloudStylableObjectProvider<T extends DataSourceType = ClassicDataSourceType> {
  getPointCloudObjects(identifier: T['modelIdentifier']): Promise<PointCloudObject<T>[]>;
}
