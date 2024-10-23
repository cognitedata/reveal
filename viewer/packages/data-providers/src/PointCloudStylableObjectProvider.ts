/*!
 * Copyright 2022 Cognite AS
 */

import { ClassicDataSourceType, DataSourceType } from './DataSourceType';
import { ModelIdentifier } from './ModelIdentifier';
import { PointCloudObject } from './pointcloud-stylable-object-providers/types';

export interface PointCloudStylableObjectProvider<T extends DataSourceType = ClassicDataSourceType> {
  getPointCloudObjects(modelIdentifier: ModelIdentifier, revisionSpace?: string): Promise<PointCloudObject<T>[]>;
}
