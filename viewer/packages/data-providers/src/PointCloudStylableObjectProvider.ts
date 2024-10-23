/*!
 * Copyright 2022 Cognite AS
 */

import { DataSourceType } from './DataSourceType';
import { ModelIdentifier } from './ModelIdentifier';
import { ClassicPointCloudDataType, PointCloudObject } from './pointcloud-stylable-object-providers/types';

export interface PointCloudStylableObjectProvider<T extends DataSourceType = ClassicPointCloudDataType> {
  getPointCloudObjects(modelIdentifier: ModelIdentifier, revisionSpace?: string): Promise<PointCloudObject<T>[]>;
}
