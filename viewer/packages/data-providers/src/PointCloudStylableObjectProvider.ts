/*!
 * Copyright 2022 Cognite AS
 */

import { ClassicDataSourceType, InternalDataSourceType } from './DataSourceType';
import { PointCloudObject } from './pointcloud-stylable-object-providers/types';

export interface PointCloudStylableObjectProvider<T extends InternalDataSourceType = ClassicDataSourceType> {
  getPointCloudObjects(identifier: T['modelIdentifier']): Promise<PointCloudObject<T>[]>;
}
